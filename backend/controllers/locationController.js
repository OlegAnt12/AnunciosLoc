const db = require('../config/database');

const locationController = {
  // Listar todos os locais
  listLocations: async (req, res) => {
    try {
      const result = await db.query(`
        SELECT 
          l.*, 
          tc.nome as tipo_coordenada,
          u.username as criador_username
        FROM locais l
        JOIN tipos_coordenada tc ON l.tipo_coordenada_id = tc.id
        LEFT JOIN utilizadores u ON l.criador_id = u.id
        WHERE l.ativo = TRUE
        ORDER BY l.nome
      `);

      // Buscar coordenadas para cada local
      const locationsWithCoords = await Promise.all(
        result.rows.map(async (location) => {
          let coordenadas = null;

          if (location.tipo_coordenada === 'GPS') {
            const gpsResult = await db.query(
              'SELECT latitude, longitude, raio_metros FROM coordenadas_gps WHERE local_id = $1',
              [location.id]
            );
            coordenadas = gpsResult.rows[0];
          } else if (location.tipo_coordenada === 'WIFI') {
            const wifiResult = await db.query(
              'SELECT ssid, descricao FROM ssids_wifi WHERE local_id = $1',
              [location.id]
            );
            coordenadas = wifiResult.rows;
          }

          return {
            ...location,
            coordenadas
          };
        })
      );

      res.json(locationsWithCoords);
    } catch (error) {
      console.error('Erro a listar locais:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Criar novo local
  createLocation: async (req, res) => {
    const { nome, descricao, tipo, coordenadas } = req.body;

    if (!nome || !tipo) {
      return res.status(400).json({ error: 'Nome e tipo são obrigatórios' });
    }

    try {
      await db.query('BEGIN');

      // Obter ID do tipo de coordenada
      const tipoResult = await db.query(
        'SELECT id FROM tipos_coordenada WHERE nome = $1',
        [tipo]
      );

      if (tipoResult.rows.length === 0) {
        await db.query('ROLLBACK');
        return res.status(400).json({ error: 'Tipo de coordenada inválido' });
      }

      const tipoId = tipoResult.rows[0].id;

      // Inserir local
      const localResult = await db.query(
        `INSERT INTO locais (nome, descricao, tipo_coordenada_id, criador_id) 
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [nome, descricao, tipoId, req.user.id]
      );

      const localId = localResult.rows[0].id;

      // Inserir coordenadas específicas
      if (tipo === 'GPS' && coordenadas) {
        const { latitude, longitude, raio_metros } = coordenadas;
        
        if (!latitude || !longitude || !raio_metros) {
          await db.query('ROLLBACK');
          return res.status(400).json({ error: 'Coordenadas GPS incompletas' });
        }

        await db.query(
          `INSERT INTO coordenadas_gps (local_id, latitude, longitude, raio_metros) 
           VALUES ($1, $2, $3, $4)`,
          [localId, latitude, longitude, raio_metros]
        );
      } else if (tipo === 'WIFI' && coordenadas && Array.isArray(coordenadas)) {
        for (const ssid of coordenadas) {
          if (ssid) {
            await db.query(
              'INSERT INTO ssids_wifi (local_id, ssid) VALUES ($1, $2)',
              [localId, ssid]
            );
          }
        }
      }

      await db.query('COMMIT');

      res.status(201).json({
        message: 'Local criado com sucesso',
        locationId: localId
      });
    } catch (error) {
      await db.query('ROLLBACK');
      console.error('Erro a criar local:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Eliminar local
  deleteLocation: async (req, res) => {
    const { id } = req.params;

    try {
      // Verificar se o local pertence ao utilizador
      const locationResult = await db.query(
        'SELECT criador_id FROM locais WHERE id = $1',
        [id]
      );

      if (locationResult.rows.length === 0) {
        return res.status(404).json({ error: 'Local não encontrado' });
      }

      if (locationResult.rows[0].criador_id !== req.user.id) {
        return res.status(403).json({ error: 'Apenas o criador pode eliminar o local' });
      }

      await db.query(
        'UPDATE locais SET ativo = FALSE WHERE id = $1',
        [id]
      );

      res.json({ message: 'Local eliminado com sucesso' });
    } catch (error) {
      console.error('Erro a eliminar local:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Verificar localização atual (simplificado)
  checkCurrentLocation: async (req, res) => {
    const { latitude, longitude, ssids } = req.body;

    try {
      let matchedLocations = [];

      // Verificar locais por GPS (simulação - sem PostGIS)
      if (latitude && longitude) {
        const gpsResult = await db.query(`
          SELECT l.id, l.nome, 'GPS' as tipo
          FROM locais l
          JOIN coordenadas_gps cg ON l.id = cg.local_id
          WHERE l.ativo = TRUE
        `);

        // Simulação simples de proximidade
        matchedLocations = gpsResult.rows.filter(location => {
          // Em produção, usar PostGIS para cálculos reais
          return Math.random() > 0.7; // 30% de chance de match para teste
        });
      }

      // Verificar locais por WiFi
      if (ssids && ssids.length > 0) {
        const wifiResult = await db.query(`
          SELECT DISTINCT l.id, l.nome, 'WIFI' as tipo
          FROM locais l
          JOIN ssids_wifi sw ON l.id = sw.local_id
          WHERE l.ativo = TRUE AND sw.ssid = ANY($1)
        `, [ssids]);

        matchedLocations = [...matchedLocations, ...wifiResult.rows];
      }

      // Remover duplicados
      const uniqueLocations = matchedLocations.filter((location, index, self) =>
        index === self.findIndex(l => l.id === location.id)
      );

      res.json({
        currentLocations: uniqueLocations,
        message: `Encontrado em ${uniqueLocations.length} locais`
      });
    } catch (error) {
      console.error('Erro a verificar localização:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};

module.exports = locationController;