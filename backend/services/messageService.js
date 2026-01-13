const db = require('../config/database');
const cacheService = require('./cacheService');
const notificationService = require('./notificationService');

class MessageService {
  async createMessage(messageData, userId) {
    // Accept both English and Portuguese keys for frontend compatibility
    const titulo = messageData.titulo || messageData.title || '';
    const conteudo = messageData.conteudo || messageData.content || '';
    const local_id = messageData.local_id || messageData.location_id;

    // Map policy types: 'public' -> no restrictions (WHITELIST with no rules)
    const rawPolicy = messageData.tipo_politica || messageData.policy_type || 'WHITELIST';
    const tipo_politica = (rawPolicy || '').toUpperCase();

    const modo_entrega = messageData.modo_entrega || messageData.delivery_mode || 'CENTRALIZADO';
    const data_inicio = messageData.data_inicio || messageData.start_time;
    const data_fim = messageData.data_fim || messageData.end_time;

    // policy rules mapping
    const rawRules = messageData.restricoes || messageData.policy_rules || [];
    const restricoes = rawRules.map(r => ({ chave: r.chave || r.key, valor: r.valor || r.value }));

    return await db.transaction(async (connection) => {
      let resolvedLocalId = local_id;

      // If location coordinates are provided inline, create a local entry
      if (!resolvedLocalId && (messageData.latitude || messageData.longitude || (Array.isArray(messageData.coordenadas) && messageData.coordenadas.length > 0))) {
        // Create a descriptive name
        const name = messageData.nome_local || `Local criado via mensagem por ${userId}`;
        // Determine type
        const type = (messageData.tipo_local || (messageData.coordenadas ? 'WIFI' : 'GPS')).toUpperCase();

        // Get type id
        const [tipoRows] = await connection.execute('SELECT id FROM tipos_coordenada WHERE nome = ?', [type]);
        if (tipoRows.length === 0) throw new Error('Tipo de coordenada inválido para local inserido');
        const tipoCoordenadaId = tipoRows[0].id;

        const [localResult] = await connection.execute(
          `INSERT INTO locais (nome, descricao, tipo_coordenada_id, criador_id) VALUES (?, ?, ?, ?)`,
          [name, messageData.descricao || '', tipoCoordenadaId, userId]
        );
        resolvedLocalId = localResult.insertId;

        // Insert coordinates
        if (type === 'GPS' && (messageData.latitude || messageData.longitude)) {
          const lat = messageData.latitude;
          const lon = messageData.longitude;
          const raio = messageData.raio_metros || messageData.radius_m || 500;
          await connection.execute(
            `INSERT INTO coordenadas_gps (local_id, latitude, longitude, raio_metros) VALUES (?, ?, ?, ?)`,
            [resolvedLocalId, lat, lon, raio]
          );
        } else if (type === 'WIFI' && Array.isArray(messageData.coordenadas)) {
          for (const ssid of messageData.coordenadas) {
            if (ssid && ssid.trim()) {
              await connection.execute('INSERT INTO ssids_wifi (local_id, ssid) VALUES (?, ?)', [resolvedLocalId, ssid.trim()]);
            }
          }
        }
      }

      // Verificar se local existe
      const [locais] = await connection.execute(
        'SELECT id, nome FROM locais WHERE id = ? AND ativo = TRUE',
        [resolvedLocalId]
      );

      if (locais.length === 0) {
        throw new Error('Local não encontrado');
      }

      // Obter ID da política
      const [policies] = await connection.execute(
        'SELECT id FROM tipos_politica WHERE nome = ?',
        [tipo_politica]
      );

      if (policies.length === 0) {
        throw new Error('Tipo de política inválido');
      }

      const politicaId = policies[0].id;

      // Definir datas padrão
      const dataInicio = data_inicio || new Date();
      const dataFim = data_fim || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // +7 dias

      // Validar datas
      if (dataInicio >= dataFim) {
        throw new Error('Data de início deve ser anterior à data de fim');
      }

      // Inserir mensagem
      const [messageResult] = await connection.execute(
        `INSERT INTO mensagens 
         (titulo, conteudo, autor_id, local_id, tipo_politica_id, modo_entrega, data_inicio, data_fim) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [titulo, conteudo, userId, local_id, politicaId, modo_entrega, dataInicio, dataFim]
      );

      const messageId = messageResult.insertId;

      // Inserir restrições
      for (const restricao of restricoes) {
        if (restricao.chave && restricao.valor) {
          await connection.execute(
            'INSERT INTO restricoes_mensagem (mensagem_id, chave, valor) VALUES (?, ?, ?)',
            [messageId, restricao.chave, restricao.valor]
          );
        }
      }

      // Log da criação
      await connection.execute(
        'INSERT INTO logs_mensagens (mensagem_id, acao, utilizador_id, detalhes) VALUES (?, ?, ?, ?)',
        [messageId, 'CRIADA', userId, `Nova mensagem: ${titulo}`]
      );

      // Notificar utilizadores relevantes
      await notificationService.notifyNewMessage(messageId, resolvedLocalId);

      // Assign mulas for decentralized delivery
      if ((modo_entrega || 'CENTRALIZADO').toUpperCase() === 'DESCENTRALIZADO') {
        // Find active mulas with available capacity
        const [candidates] = await connection.execute(
          `SELECT cm.utilizador_id, cm.espaco_maximo_mensagens,
                  COALESCE(SUM(CASE WHEN mm.entregue = FALSE THEN 1 ELSE 0 END), 0) as currently_assigned
           FROM config_mulas cm
           LEFT JOIN mulas_mensagens mm ON cm.utilizador_id = mm.mula_utilizador_id
           WHERE cm.ativo = TRUE
           GROUP BY cm.utilizador_id, cm.espaco_maximo_mensagens
           HAVING currently_assigned < cm.espaco_maximo_mensagens
           ORDER BY (cm.espaco_maximo_mensagens - currently_assigned) DESC
           LIMIT 5`);

        for (const candidate of candidates) {
          await connection.execute(
            `INSERT INTO mulas_mensagens (mensagem_id, mula_utilizador_id, publicador_utilizador_id) VALUES (?, ?, ?)`,
            [messageId, candidate.utilizador_id, userId]
          );
        }
      }

      // Invalidar cache
      await cacheService.delete(`messages:location:${resolvedLocalId}`);
      await cacheService.delete(`messages:user:${userId}`);

      return messageId;
    });
  }

  async getMessagesForLocation(locationId, userId) {
    const cacheKey = `messages:location:${locationId}:user:${userId}`;
    
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const [messages] = await db.query(`
      SELECT 
        m.id, m.titulo, m.conteudo, m.data_publicacao,
        m.modo_entrega, m.data_inicio, m.data_fim,
        u.username as autor,
        l.nome as local_nome,
        tp.nome as tipo_politica,
        EXISTS(
          SELECT 1 FROM entregas_mensagens em 
          WHERE em.mensagem_id = m.id AND em.utilizador_id = ? AND em.recebida = TRUE
        ) as ja_recebida
      FROM mensagens m
      JOIN utilizadores u ON m.autor_id = u.id
      JOIN locais l ON m.local_id = l.id
      JOIN tipos_politica tp ON m.tipo_politica_id = tp.id
      WHERE m.local_id = ? 
        AND m.ativa = TRUE 
        AND m.removida = FALSE
        AND m.data_inicio <= NOW() 
        AND m.data_fim >= NOW()
      ORDER BY m.data_publicacao DESC
    `, [userId, locationId]);

    // Filtrar mensagens que satisfazem a política
    const availableMessages = [];
    
    for (const message of messages) {
      if (!message.ja_recebida) {
        const [policyResult] = await db.execute(
          'SELECT verificar_politica_mensagem(?, ?) as satisfaz_politica',
          [message.id, userId]
        );
        
        if (policyResult[0].satisfaz_politica === 1) {
          availableMessages.push(message);
        }
      }
    }

    // Guardar no cache por 2 minutos
    await cacheService.set(cacheKey, availableMessages, 120);

    return availableMessages;
  }

  async receiveMessage(messageId, userId, deviceId = null) {
    return await db.transaction(async (connection) => {
      // Verificar se a mensagem existe e é válida
      const [messages] = await connection.execute(`
        SELECT m.*, l.nome as local_nome, u.username as autor
        FROM mensagens m
        JOIN locais l ON m.local_id = l.id
        JOIN utilizadores u ON m.autor_id = u.id
        WHERE m.id = ? AND m.ativa = TRUE AND m.removida = FALSE
          AND m.data_inicio <= NOW() AND m.data_fim >= NOW()
      `, [messageId]);

      if (messages.length === 0) {
        throw new Error('Mensagem não encontrada ou expirada');
      }

      const message = messages[0];

      // Verificar se já foi recebida
      const [received] = await connection.execute(
        'SELECT id FROM entregas_mensagens WHERE mensagem_id = ? AND utilizador_id = ? AND recebida = TRUE',
        [messageId, userId]
      );

      if (received.length > 0) {
        throw new Error('Mensagem já recebida');
      }

      // Verificar política
      const [policyResult] = await connection.execute(
        'SELECT verificar_politica_mensagem(?, ?) as satisfaz_politica',
        [messageId, userId]
      );
      
      if (policyResult[0].satisfaz_politica === 0) {
        throw new Error('Não tem permissão para receber esta mensagem');
      }

      // Registar entrega
      await connection.execute(
        `INSERT INTO entregas_mensagens 
         (mensagem_id, utilizador_id, dispositivo_origem, modo_entrega, recebida, data_rececao) 
         VALUES (?, ?, ?, ?, TRUE, NOW())`,
        [messageId, userId, deviceId, message.modo_entrega]
      );

      // Log da receção
      await connection.execute(
        'INSERT INTO logs_mensagens (mensagem_id, acao, utilizador_id, detalhes) VALUES (?, ?, ?, ?)',
        [messageId, 'RECEBIDA', userId, `Mensagem recebida por utilizador ${userId}`]
      );

      // Atualizar estatísticas
      await this.updateMessageStats(messageId);

      return {
        id: message.id,
        titulo: message.titulo,
        conteudo: message.conteudo,
        autor: message.autor,
        data_publicacao: message.data_publicacao,
        local: message.local_nome,
        politica: message.tipo_politica_id
      };
    });
  }

  async getMessageById(messageId) {
    const [rows] = await db.query(
      `SELECT m.*, u.username as autor, l.nome as local_nome, tp.nome as tipo_politica
       FROM mensagens m
       JOIN utilizadores u ON m.autor_id = u.id
       JOIN locais l ON m.local_id = l.id
       JOIN tipos_politica tp ON m.tipo_politica_id = tp.id
       WHERE m.id = ? AND m.removida = FALSE`,
      [messageId]
    );

    return rows[0] || null;
  }

  async updateMessage(messageId, userId, updates = {}) {
    return await db.transaction(async (connection) => {
      const [rows] = await connection.execute('SELECT autor_id FROM mensagens WHERE id = ? AND removida = FALSE', [messageId]);
      if (rows.length === 0) throw new Error('Mensagem não encontrada');
      if (rows[0].autor_id !== userId) throw new Error('Apenas o autor pode atualizar a mensagem');

      const fields = [];
      const params = [];

      if (updates.titulo) {
        fields.push('titulo = ?'); params.push(updates.titulo);
      }
      if (updates.conteudo) {
        fields.push('conteudo = ?'); params.push(updates.conteudo);
      }
      if (updates.data_inicio) {
        fields.push('data_inicio = ?'); params.push(updates.data_inicio);
      }
      if (updates.data_fim) {
        fields.push('data_fim = ?'); params.push(updates.data_fim);
      }

      if (fields.length === 0) throw new Error('Nenhum campo válido para atualizar');

      params.push(messageId);
      await connection.execute(`UPDATE mensagens SET ${fields.join(', ')} WHERE id = ?`, params);

      // Se tiver restrições atualizadas, substituir as antigas
      if (Array.isArray(updates.restricoes)) {
        await connection.execute('DELETE FROM restricoes_mensagem WHERE mensagem_id = ?', [messageId]);
        for (const r of updates.restricoes) {
          if (r.chave && r.valor) {
            await connection.execute('INSERT INTO restricoes_mensagem (mensagem_id, chave, valor) VALUES (?, ?, ?)', [messageId, r.chave, r.valor]);
          }
        }
      }

      // Log de atualização
      await connection.execute('INSERT INTO logs_mensagens (mensagem_id, acao, utilizador_id, detalhes) VALUES (?, ?, ?, ?)', [messageId, 'ATUALIZADA', userId, 'Mensagem atualizada']);

      return true;
    });
  }

  async getReceivedMessages(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [messages] = await db.query(`
      SELECT 
        m.id, m.titulo, m.conteudo, m.data_publicacao,
        u.username as autor,
        l.nome as local_nome,
        em.data_rececao,
        em.modo_entrega
      FROM entregas_mensagens em
      JOIN mensagens m ON em.mensagem_id = m.id
      JOIN utilizadores u ON m.autor_id = u.id
      JOIN locais l ON m.local_id = l.id
      WHERE em.utilizador_id = ? AND em.recebida = TRUE
      ORDER BY em.data_rececao DESC
      LIMIT ? OFFSET ?
    `, [userId, parseInt(limit), offset]);

    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM entregas_mensagens WHERE utilizador_id = ? AND recebida = TRUE',
      [userId]
    );

    return {
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    };
  }

  async getMyMessages(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [messages] = await db.query(`
      SELECT 
        m.*,
        l.nome as local_nome,
        tp.nome as tipo_politica,
        COUNT(DISTINCT em.id) as total_entregas,
        COUNT(DISTINCT em.utilizador_id) as utilizadores_unicos
      FROM mensagens m
      JOIN locais l ON m.local_id = l.id
      JOIN tipos_politica tp ON m.tipo_politica_id = tp.id
      LEFT JOIN entregas_mensagens em ON m.id = em.mensagem_id AND em.recebida = TRUE
      WHERE m.autor_id = ? AND m.removida = FALSE
      GROUP BY m.id
      ORDER BY m.data_publicacao DESC
      LIMIT ? OFFSET ?
    `, [userId, parseInt(limit), offset]);

    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM mensagens WHERE autor_id = ? AND removida = FALSE',
      [userId]
    );

    return {
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    };
  }

  async deleteMessage(messageId, userId) {
    return await db.transaction(async (connection) => {
      // Verificar se a mensagem pertence ao utilizador
      const [messages] = await connection.execute(
        'SELECT autor_id FROM mensagens WHERE id = ?',
        [messageId]
      );

      if (messages.length === 0) {
        throw new Error('Mensagem não encontrada');
      }

      if (messages[0].autor_id !== userId) {
        throw new Error('Apenas o autor pode eliminar a mensagem');
      }

      // Soft delete
      await connection.execute(
        'UPDATE mensagens SET removida = TRUE WHERE id = ?',
        [messageId]
      );

      // Log da eliminação
      await connection.execute(
        'INSERT INTO logs_mensagens (mensagem_id, acao, utilizador_id, detalhes) VALUES (?, ?, ?, ?)',
        [messageId, 'REMOVIDA', userId, 'Mensagem removida pelo autor']
      );

      // Invalidar cache
      await cacheService.delete(`messages:user:${userId}`);

      return true;
    });
  }

  async updateMessageStats(messageId) {
    // Atualizar estatísticas da mensagem (poderia ser uma stored procedure)
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_entregas,
        COUNT(DISTINCT utilizador_id) as utilizadores_unicos
      FROM entregas_mensagens 
      WHERE mensagem_id = ? AND recebida = TRUE
    `, [messageId]);

    // Aqui poderíamos atualizar uma tabela de estatísticas se existisse
    console.log(`📊 Estatísticas atualizadas para mensagem ${messageId}:`, stats[0]);
  }

  async checkForExpiredMessages() {
    const result = await db.query(
      'UPDATE mensagens SET ativa = FALSE WHERE data_fim < NOW() AND ativa = TRUE'
    );
    
    console.log(`🧹 Mensagens expiradas desativadas: ${result.affectedRows}`);
    return result.affectedRows;
  }
}

module.exports = new MessageService();