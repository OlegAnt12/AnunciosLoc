const db = require('../config/database');
const cacheService = require('./cacheService');

class LocationService {
  async createLocation(locationData, userId) {
    const { nome, descricao, tipo, coordenadas } = locationData;

    return await db.transaction(async (connection) => {
      // Obter ID do tipo de coordenada
      const [tipos] = await connection.execute(
        'SELECT id FROM tipos_coordenada WHERE nome = ?',
        [tipo]
      );

      if (tipos.length === 0) {
        throw new Error('Tipo de coordenada inválido');
      }

      const tipoId = tipos[0].id;

      // Inserir local
      const [localResult] = await connection.execute(
        `INSERT INTO locais (nome, descricao, tipo_coordenada_id, criador_id) 
         VALUES (?, ?, ?, ?)`,
        [nome, descricao, tipoId, userId]
      );

      const localId = localResult.insertId;

      // Inserir coordenadas específicas
      if (tipo === 'GPS' && coordenadas) {
        const { latitude, longitude, raio_metros } = coordenadas;
        
        await connection.execute(
          `INSERT INTO coordenadas_gps (local_id, latitude, longitude, raio_metros) 
           VALUES (?, ?, ?, ?)`,
          [localId, latitude, longitude, raio_metros]
        );
      } else if (tipo === 'WIFI' && coordenadas && Array.isArray(coordenadas)) {
        for (const ssid of coordenadas) {
          if (ssid && ssid.trim()) {
            await connection.execute(
              'INSERT INTO ssids_wifi (local_id, ssid) VALUES (?, ?)',
              [localId, ssid.trim()]
            );
          }
        }
      }

      // Invalidar cache
      await cacheService.delete('locations:all');

      return localId;
    });
  }

  async getLocations(filters = {}) {
    const cacheKey = `locations:${JSON.stringify(filters)}`;
    
    // Tentar obter do cache
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    let query = `
      SELECT 
        l.*, 
        tc.nome as tipo_coordenada,
        u.username as criador_username,
        COUNT(DISTINCT m.id) as total_mensagens
      FROM locais l
      JOIN tipos_coordenada tc ON l.tipo_coordenada_id = tc.id
      LEFT JOIN utilizadores u ON l.criador_id = u.id
      LEFT JOIN mensagens m ON l.id = m.local_id AND m.ativa = TRUE AND m.removida = FALSE
      WHERE l.ativo = TRUE
    `;

    const params = [];

    if (filters.criador_id) {
      query += ' AND l.criador_id = ?';
      params.push(filters.criador_id);
    }

    if (filters.tipo) {
      query += ' AND tc.nome = ?';
      params.push(filters.tipo);
    }

    query += ' GROUP BY l.id ORDER BY l.nome';

    const [rows] = await db.query(query, params);

    // Buscar coordenadas para cada local
    const locationsWithCoords = await Promise.all(
      rows.map(async (location) => {
        let coordenadas = null;

        if (location.tipo_coordenada === 'GPS') {
          const [gpsCoords] = await db.query(
            'SELECT latitude, longitude, raio_metros FROM coordenadas_gps WHERE local_id = ?',
            [location.id]
          );
          coordenadas = gpsCoords[0] || null;
        } else if (location.tipo_coordenada === 'WIFI') {
          const [wifiCoords] = await db.query(
            'SELECT ssid, descricao FROM ssids_wifi WHERE local_id = ?',
            [location.id]
          );
          coordenadas = wifiCoords;
        }

        return {
          ...location,
          coordenadas
        };
      })
    );

    // Guardar no cache
    await cacheService.set(cacheKey, locationsWithCoords, 300); // 5 minutos

    return locationsWithCoords;
  }

  async checkUserLocation(userId, locationData) {
    const { latitude, longitude, ssids = [] } = locationData;

    // Registar localização do utilizador
    await db.query(
      `INSERT INTO localizacoes_utilizador 
       (utilizador_id, latitude, longitude, ssids_detectados, fonte) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, latitude, longitude, ssids.join(','), 'MISTO']
    );

    const matchedLocations = [];

    // Verificar locais por GPS
    if (latitude && longitude) {
      const [gpsRows] = await db.query(
        `SELECT l.id, l.nome, 'GPS' as tipo, cg.raio_metros,
                calcular_distancia_km(?, ?, cg.latitude, cg.longitude) as distancia
         FROM locais l
         JOIN coordenadas_gps cg ON l.id = cg.local_id
         WHERE l.ativo = TRUE
         HAVING distancia <= cg.raio_metros`,
        [latitude, longitude]
      );
      matchedLocations.push(...gpsRows);
    }

    // Verificar locais por WiFi
    if (ssids.length > 0) {
      const ssidsString = ssids.join(',');
      const [wifiRows] = await db.query(
        `SELECT DISTINCT l.id, l.nome, 'WIFI' as tipo, NULL as distancia
         FROM locais l
         JOIN ssids_wifi sw ON l.id = sw.local_id
         WHERE l.ativo = TRUE AND FIND_IN_SET(sw.ssid, ?)`,
        [ssidsString]
      );
      matchedLocations.push(...wifiRows);
    }

    // Remover duplicados e registar matches
    const uniqueLocations = [];
    const seenIds = new Set();

    for (const location of matchedLocations) {
      if (!seenIds.has(location.id)) {
        seenIds.add(location.id);
        uniqueLocations.push(location);

        // Registar matching
        await db.query(
          `INSERT INTO matching_localizacao (utilizador_id, local_id, metodo, certeza) 
           VALUES (?, ?, ?, ?)`,
          [userId, location.id, location.tipo, location.distancia ? 0.9 : 0.8]
        );
      }
    }

    return uniqueLocations;
  }

  async updateLocation(locationId, updateData, userId) {
    return await db.transaction(async (connection) => {
      // Verificar existência e propriedade
      const [locals] = await connection.execute('SELECT criador_id, tipo_coordenada_id FROM locais WHERE id = ?', [locationId]);
      if (locals.length === 0) throw new Error('Local não encontrado');
      if (locals[0].criador_id !== userId) throw new Error('Apenas o criador pode editar o local');

      // Atualizar nome/descrição se fornecidos
      if (updateData.nome || updateData.descricao) {
        await connection.execute(
          'UPDATE locais SET nome = COALESCE(?, nome), descricao = COALESCE(?, descricao) WHERE id = ?',
          [updateData.nome || null, updateData.descricao || null, locationId]
        );
      }

      // Resolver tipo atual
      const [tipoRows] = await connection.execute('SELECT nome FROM tipos_coordenada WHERE id = ?', [locals[0].tipo_coordenada_id]);
      let tipoAtual = tipoRows[0] && tipoRows[0].nome;

      // Se for pedido alterar o tipo, validar e atualizar
      let novoTipo = tipoAtual;
      if (updateData.tipo && updateData.tipo !== tipoAtual) {
        const [tipos] = await connection.execute('SELECT id FROM tipos_coordenada WHERE nome = ?', [updateData.tipo]);
        if (tipos.length === 0) throw new Error('Tipo de coordenada inválido');
        await connection.execute('UPDATE locais SET tipo_coordenada_id = ? WHERE id = ?', [tipos[0].id, locationId]);
        novoTipo = updateData.tipo;
      }

      // Coordenadas
      if (novoTipo === 'GPS' && updateData.coordenadas) {
        const { latitude, longitude, raio_metros } = updateData.coordenadas;
        const [ex] = await connection.execute('SELECT local_id FROM coordenadas_gps WHERE local_id = ?', [locationId]);
        if (ex.length > 0) {
          await connection.execute('UPDATE coordenadas_gps SET latitude = ?, longitude = ?, raio_metros = ? WHERE local_id = ?', [latitude, longitude, raio_metros, locationId]);
        } else {
          await connection.execute('INSERT INTO coordenadas_gps (local_id, latitude, longitude, raio_metros) VALUES (?, ?, ?, ?)', [locationId, latitude, longitude, raio_metros]);
        }
        // Remover quaisquer SSIDs se existirem
        await connection.execute('DELETE FROM ssids_wifi WHERE local_id = ?', [locationId]);
      } else if (novoTipo === 'WIFI' && updateData.coordenadas && Array.isArray(updateData.coordenadas)) {
        // Substituir SSIDs
        await connection.execute('DELETE FROM ssids_wifi WHERE local_id = ?', [locationId]);
        for (const ssid of updateData.coordenadas) {
          if (ssid && ssid.trim()) {
            await connection.execute('INSERT INTO ssids_wifi (local_id, ssid) VALUES (?, ?)', [locationId, ssid.trim()]);
          }
        }
        // Remover coordenadas GPS se existirem
        await connection.execute('DELETE FROM coordenadas_gps WHERE local_id = ?', [locationId]);
      }

      // Invalidar cache
      await cacheService.delete('locations:all');

      return true;
    });
  }

  async deleteLocation(locationId, userId) {
    return await db.transaction(async (connection) => {
      // Verificar se o local pertence ao utilizador
      const [locations] = await connection.execute(
        'SELECT criador_id FROM locais WHERE id = ?',
        [locationId]
      );

      if (locations.length === 0) {
        throw new Error('Local não encontrado');
      }

      if (locations[0].criador_id !== userId) {
        throw new Error('Apenas o criador pode eliminar o local');
      }

      // Marcar como inativo (soft delete)
      await connection.execute(
        'UPDATE locais SET ativo = FALSE WHERE id = ?',
        [locationId]
      );

      // Invalidar cache
      await cacheService.delete('locations:all');

      return true;
    });
  }

  async getLocationStats(locationId) {
    const stats = await db.query(`
      SELECT 
        l.id,
        l.nome,
        COUNT(DISTINCT m.id) as total_mensagens,
        COUNT(DISTINCT CASE WHEN m.ativa = TRUE AND m.removida = FALSE THEN m.id END) as mensagens_ativas,
        COUNT(DISTINCT em.id) as total_entregas,
        COUNT(DISTINCT em.utilizador_id) as utilizadores_unicos
      FROM locais l
      LEFT JOIN mensagens m ON l.id = m.local_id
      LEFT JOIN entregas_mensagens em ON m.id = em.mensagem_id
      WHERE l.id = ?
      GROUP BY l.id, l.nome
    `, [locationId]);

    return stats[0] || null;
  }
}

module.exports = new LocationService();