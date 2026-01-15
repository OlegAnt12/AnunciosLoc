-- =============================================
-- Base de Dados: AnunciosLoc
-- Descrição: Sistema de Anúncios baseado em Localização
-- Plataforma: MySQL
-- =============================================

-- Criar a base de dados
CREATE DATABASE IF NOT EXISTS anunciosloc;

USE anunciosloc;

-- Definir charset e collation para a base de dados
ALTER DATABASE anunciosloc CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- =============================================
-- Tabelas Principais
-- =============================================

-- Tabela de utilizadores
CREATE TABLE utilizadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE,
    push_token VARCHAR(255) NULL,
    ultima_notificacao_lida INT DEFAULT 0
);

-- Tabela de sessões
CREATE TABLE sessoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilizador_id INT,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_expiracao TIMESTAMP NOT NULL,
    ativa BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (utilizador_id) REFERENCES utilizadores(id) ON DELETE CASCADE
);

-- Tabela de tipos de coordenadas
CREATE TABLE tipos_coordenada (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(20) NOT NULL UNIQUE,
    descricao TEXT
);

INSERT INTO tipos_coordenada (nome, descricao) VALUES 
('GPS', 'Coordenadas geográficas com latitude, longitude e raio'),
('WIFI', 'Identificação por SSIDs de redes WiFi');

-- Tabela de locais
CREATE TABLE locais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    tipo_coordenada_id INT,
    criador_id INT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (tipo_coordenada_id) REFERENCES tipos_coordenada(id),
    FOREIGN KEY (criador_id) REFERENCES utilizadores(id) ON DELETE SET NULL
);

-- Tabela de coordenadas GPS
CREATE TABLE coordenadas_gps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    local_id INT,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    raio_metros INT NOT NULL,
    FOREIGN KEY (local_id) REFERENCES locais(id) ON DELETE CASCADE,
    CHECK (raio_metros > 0)
);

-- Tabela de SSIDs WiFi
CREATE TABLE ssids_wifi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    local_id INT,
    ssid VARCHAR(100) NOT NULL,
    descricao TEXT,
    FOREIGN KEY (local_id) REFERENCES locais(id) ON DELETE CASCADE
);

-- Tabela de perfis de utilizador
CREATE TABLE perfis_utilizador (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilizador_id INT,
    chave VARCHAR(50) NOT NULL,
    valor VARCHAR(500) NOT NULL, -- Alterado de TEXT para VARCHAR com tamanho limitado
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilizador_id) REFERENCES utilizadores(id) ON DELETE CASCADE,
    UNIQUE KEY unique_utilizador_chave (utilizador_id, chave)
);

-- Tabela de chaves de perfil disponíveis (públicas)
CREATE TABLE chaves_perfil_publicas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chave VARCHAR(50) UNIQUE NOT NULL,
    descricao TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de tipos de política
CREATE TABLE tipos_politica (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(20) NOT NULL UNIQUE,
    descricao TEXT
);

INSERT INTO tipos_politica (nome, descricao) VALUES 
('WHITELIST', 'Permite apenas utilizadores que correspondem à lista'),
('BLACKLIST', 'Permite todos excepto os utilizadores da lista');

-- Tabela de mensagens
CREATE TABLE mensagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    conteudo TEXT NOT NULL,
    autor_id INT,
    local_id INT,
    tipo_politica_id INT,
    modo_entrega ENUM('CENTRALIZADO', 'DESCENTRALIZADO') NOT NULL,
    data_publicacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_inicio TIMESTAMP NOT NULL,
    data_fim TIMESTAMP NOT NULL,
    ativa BOOLEAN DEFAULT TRUE,
    removida BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (autor_id) REFERENCES utilizadores(id) ON DELETE CASCADE,
    FOREIGN KEY (local_id) REFERENCES locais(id) ON DELETE CASCADE,
    FOREIGN KEY (tipo_politica_id) REFERENCES tipos_politica(id)
);

-- Tabela de restrições de perfil para mensagens
CREATE TABLE restricoes_mensagem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mensagem_id INT,
    chave VARCHAR(50) NOT NULL,
    valor VARCHAR(500) NOT NULL, -- Alterado de TEXT para VARCHAR com tamanho limitado
    FOREIGN KEY (mensagem_id) REFERENCES mensagens(id) ON DELETE CASCADE
);

-- Tabela de entrega de mensagens
CREATE TABLE entregas_mensagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mensagem_id INT,
    utilizador_id INT,
    dispositivo_origem VARCHAR(100),
    data_entrega TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recebida BOOLEAN DEFAULT FALSE,
    data_rececao TIMESTAMP NULL,
    modo_entrega ENUM('CENTRALIZADO', 'DESCENTRALIZADO'),
    FOREIGN KEY (mensagem_id) REFERENCES mensagens(id) ON DELETE CASCADE,
    FOREIGN KEY (utilizador_id) REFERENCES utilizadores(id) ON DELETE CASCADE
);

-- =============================================
-- Tabelas para Funcionalidades Avançadas
-- =============================================

-- Tabela para roteamento de retransmissão (mulas)
CREATE TABLE mulas_mensagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mensagem_id INT,
    mula_utilizador_id INT,
    publicador_utilizador_id INT,
    data_atribuicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_entrega TIMESTAMP NULL,
    entregue BOOLEAN DEFAULT FALSE,
    prioridade INT DEFAULT 1,
    FOREIGN KEY (mensagem_id) REFERENCES mensagens(id) ON DELETE CASCADE,
    FOREIGN KEY (mula_utilizador_id) REFERENCES utilizadores(id) ON DELETE CASCADE,
    FOREIGN KEY (publicador_utilizador_id) REFERENCES utilizadores(id) ON DELETE CASCADE,
    CHECK (prioridade >= 1 AND prioridade <= 5)
);

-- Tabela de configuração de mulas
CREATE TABLE config_mulas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilizador_id INT UNIQUE,
    espaco_maximo_mensagens INT DEFAULT 10,
    ativo BOOLEAN DEFAULT TRUE,
    data_configuracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilizador_id) REFERENCES utilizadores(id) ON DELETE CASCADE,
    CHECK (espaco_maximo_mensagens >= 0)
);

-- Tabela para segurança (chaves públicas)
CREATE TABLE chaves_publicas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilizador_id INT UNIQUE,
    chave_publica TEXT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_expiracao TIMESTAMP NOT NULL,
    FOREIGN KEY (utilizador_id) REFERENCES utilizadores(id) ON DELETE CASCADE
);

-- Tabela para assinaturas digitais de mensagens
CREATE TABLE assinaturas_mensagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mensagem_id INT UNIQUE,
    assinatura_digital TEXT NOT NULL,
    algoritmo VARCHAR(50) DEFAULT 'RSA-SHA256',
    data_assinatura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mensagem_id) REFERENCES mensagens(id) ON DELETE CASCADE
);

-- =============================================
-- Tabelas de Log e Auditoria
-- =============================================

CREATE TABLE logs_acesso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilizador_id INT,
    acao VARCHAR(50) NOT NULL,
    descricao TEXT,
    endereco_ip VARCHAR(45),
    data_acesso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilizador_id) REFERENCES utilizadores(id) ON DELETE SET NULL
);

CREATE TABLE logs_mensagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mensagem_id INT,
    acao VARCHAR(50) NOT NULL,
    utilizador_id INT,
    detalhes TEXT,
    data_log TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mensagem_id) REFERENCES mensagens(id) ON DELETE SET NULL,
    FOREIGN KEY (utilizador_id) REFERENCES utilizadores(id) ON DELETE SET NULL
);

-- =============================================
-- Índices para Melhor Performance
-- =============================================

-- Índices para utilizadores
CREATE INDEX idx_utilizadores_username ON utilizadores(username);
CREATE INDEX idx_utilizadores_ativo ON utilizadores(ativo);

-- Índices para sessões
CREATE INDEX idx_sessoes_session_id ON sessoes(session_id);
CREATE INDEX idx_sessoes_utilizador_id ON sessoes(utilizador_id);
CREATE INDEX idx_sessoes_expiracao ON sessoes(data_expiracao);
CREATE INDEX idx_sessoes_ativa ON sessoes(ativa);

-- Índices para locais
CREATE INDEX idx_locais_nome ON locais(nome);
CREATE INDEX idx_locais_criador_id ON locais(criador_id);
CREATE INDEX idx_locais_ativo ON locais(ativo);
CREATE INDEX idx_locais_tipo_coordenada ON locais(tipo_coordenada_id);

-- Índices para coordenadas
CREATE INDEX idx_coordenadas_gps_local_id ON coordenadas_gps(local_id);
CREATE INDEX idx_coordenadas_gps_lat_lng ON coordenadas_gps(latitude, longitude);
CREATE INDEX idx_ssids_wifi_local_id ON ssids_wifi(local_id);
CREATE INDEX idx_ssids_wifi_ssid ON ssids_wifi(ssid);

-- Índices para perfis
CREATE INDEX idx_perfis_utilizador_id ON perfis_utilizador(utilizador_id);
CREATE INDEX idx_perfis_chave ON perfis_utilizador(chave);
CREATE INDEX idx_perfis_chave_valor ON perfis_utilizador(chave, valor(100)); -- Especificado comprimento para o índice

-- Índices para mensagens
CREATE INDEX idx_mensagens_autor_id ON mensagens(autor_id);
CREATE INDEX idx_mensagens_local_id ON mensagens(local_id);
CREATE INDEX idx_mensagens_data_publicacao ON mensagens(data_publicacao);
CREATE INDEX idx_mensagens_data_inicio_fim ON mensagens(data_inicio, data_fim);
CREATE INDEX idx_mensagens_ativa ON mensagens(ativa);
CREATE INDEX idx_mensagens_removida ON mensagens(removida);
CREATE INDEX idx_mensagens_tipo_politica ON mensagens(tipo_politica_id);

-- Índices para restrições
CREATE INDEX idx_restricoes_mensagem_id ON restricoes_mensagem(mensagem_id);
CREATE INDEX idx_restricoes_chave_valor ON restricoes_mensagem(chave, valor(100)); -- Especificado comprimento para o índice

-- Índices para entregas
CREATE INDEX idx_entregas_mensagem_id ON entregas_mensagens(mensagem_id);
CREATE INDEX idx_entregas_utilizador_id ON entregas_mensagens(utilizador_id);
CREATE INDEX idx_entregas_data_entrega ON entregas_mensagens(data_entrega);
CREATE INDEX idx_entregas_recebida ON entregas_mensagens(recebida);

-- Índices para mulas
CREATE INDEX idx_mulas_mensagem_id ON mulas_mensagens(mensagem_id);
CREATE INDEX idx_mulas_mula_utilizador_id ON mulas_mensagens(mula_utilizador_id);
CREATE INDEX idx_mulas_publicador_id ON mulas_mensagens(publicador_utilizador_id);
CREATE INDEX idx_mulas_entregue ON mulas_mensagens(entregue);

-- =============================================
-- Views Úteis
-- =============================================

-- View para mensagens ativas e válidas
CREATE VIEW mensagens_ativas AS
SELECT 
    m.*,
    l.nome as local_nome,
    u.username as autor_username,
    tp.nome as tipo_politica
FROM mensagens m
JOIN locais l ON m.local_id = l.id
JOIN utilizadores u ON m.autor_id = u.id
JOIN tipos_politica tp ON m.tipo_politica_id = tp.id
WHERE m.ativa = TRUE 
    AND m.removida = FALSE
    AND m.data_inicio <= CURRENT_TIMESTAMP
    AND m.data_fim >= CURRENT_TIMESTAMP;

-- View para utilizadores com seus perfis
CREATE VIEW utilizadores_com_perfis AS
SELECT 
    u.*,
    (SELECT JSON_OBJECTAGG(p.chave, p.valor) 
     FROM perfis_utilizador p 
     WHERE p.utilizador_id = u.id) as perfil
FROM utilizadores u;

-- View para locais com suas coordenadas GPS
CREATE VIEW locais_com_coordenadas_gps AS
SELECT 
    l.*,
    tc.nome as tipo_coordenada_nome,
    JSON_OBJECT(
        'latitude', cg.latitude,
        'longitude', cg.longitude,
        'raio_metros', cg.raio_metros
    ) as coordenadas
FROM locais l
JOIN tipos_coordenada tc ON l.tipo_coordenada_id = tc.id
LEFT JOIN coordenadas_gps cg ON l.id = cg.local_id
WHERE tc.nome = 'GPS';

-- View para locais com suas coordenadas WiFi
CREATE VIEW locais_com_coordenadas_wifi AS
SELECT 
    l.*,
    tc.nome as tipo_coordenada_nome,
    (SELECT JSON_ARRAYAGG(JSON_OBJECT('ssid', sw.ssid, 'descricao', sw.descricao))
     FROM ssids_wifi sw 
     WHERE sw.local_id = l.id) as coordenadas
FROM locais l
JOIN tipos_coordenada tc ON l.tipo_coordenada_id = tc.id
WHERE tc.nome = 'WIFI';

-- =============================================
-- Funções e Procedures
-- =============================================

DELIMITER //

-- Função para calcular distância entre coordenadas GPS (fórmula de Haversine)
CREATE FUNCTION calcular_distancia_km(
    lat1 DECIMAL(10,8), 
    lon1 DECIMAL(11,8), 
    lat2 DECIMAL(10,8), 
    lon2 DECIMAL(11,8)
) RETURNS DECIMAL(10,6)
DETERMINISTIC
BEGIN
    DECLARE R INT DEFAULT 6371; -- Raio da Terra em km
    DECLARE dlat DECIMAL(10,8);
    DECLARE dlon DECIMAL(11,8);
    DECLARE a DECIMAL(20,15);
    DECLARE c DECIMAL(20,15);
    DECLARE d DECIMAL(10,6);
    
    SET dlat = RADIANS(lat2 - lat1);
    SET dlon = RADIANS(lon2 - lon1);
    SET a = SIN(dlat/2) * SIN(dlat/2) + 
            COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * 
            SIN(dlon/2) * SIN(dlon/2);
    SET c = 2 * ATAN2(SQRT(a), SQRT(1-a));
    SET d = R * c;
    
    RETURN d * 1000; -- Retorna em metros
END//

-- Função para verificar se um utilizador está num local
CREATE FUNCTION verificar_localizacao_utilizador(
    p_utilizador_id INT,
    p_latitude DECIMAL(10,8),
    p_longitude DECIMAL(11,8),
    p_ssids TEXT
) RETURNS INT
READS SQL DATA
BEGIN
    DECLARE local_encontrado_id INT DEFAULT NULL;
    
    -- Verificar locais por GPS
    IF p_latitude IS NOT NULL AND p_longitude IS NOT NULL THEN
        SELECT l.id INTO local_encontrado_id
        FROM locais l
        JOIN coordenadas_gps cg ON l.id = cg.local_id
        WHERE l.ativo = TRUE
          AND calcular_distancia_km(p_latitude, p_longitude, cg.latitude, cg.longitude) <= cg.raio_metros
        LIMIT 1;
    END IF;
    
    -- Se não encontrou por GPS, verificar por WiFi
    IF local_encontrado_id IS NULL AND p_ssids IS NOT NULL THEN
        SELECT l.id INTO local_encontrado_id
        FROM locais l
        JOIN ssids_wifi sw ON l.id = sw.local_id
        WHERE l.ativo = TRUE
          AND FIND_IN_SET(sw.ssid, REPLACE(p_ssids, '|', ','))
        LIMIT 1;
    END IF;
    
    RETURN local_encontrado_id;
END//

-- Função para verificar se um utilizador satisfaz a política de uma mensagem
CREATE FUNCTION verificar_politica_mensagem(
    p_mensagem_id INT,
    p_utilizador_id INT
) RETURNS BOOLEAN
READS SQL DATA
BEGIN
    DECLARE v_tipo_politica VARCHAR(20);
    DECLARE v_restricoes_count INT;
    DECLARE v_match_count INT;
    
    -- Obter tipo de política e contar restrições
    SELECT tp.nome, COUNT(rm.id)
    INTO v_tipo_politica, v_restricoes_count
    FROM mensagens m
    JOIN tipos_politica tp ON m.tipo_politica_id = tp.id
    LEFT JOIN restricoes_mensagem rm ON m.id = rm.mensagem_id
    WHERE m.id = p_mensagem_id
    GROUP BY tp.nome;
    
    -- Se não há restrições, sempre retorna TRUE
    IF v_restricoes_count = 0 THEN
        RETURN TRUE;
    END IF;
    
    -- Contar matches com o perfil do utilizador
    SELECT COUNT(*)
    INTO v_match_count
    FROM restricoes_mensagem rm
    JOIN perfis_utilizador pu ON rm.chave = pu.chave AND rm.valor = pu.valor
    WHERE rm.mensagem_id = p_mensagem_id AND pu.utilizador_id = p_utilizador_id;
    
    -- Aplicar política
    IF v_tipo_politica = 'WHITELIST' THEN
        RETURN v_match_count > 0;
    ELSE -- BLACKLIST
        RETURN v_match_count = 0;
    END IF;
END//

DELIMITER ;

-- =============================================
-- Procedures
-- =============================================

DELIMITER //

-- Procedure para obter mensagens disponíveis para um utilizador
CREATE PROCEDURE obter_mensagens_disponiveis(
    IN p_utilizador_id INT,
    IN p_local_id INT
)
BEGIN
    SELECT 
        m.id as mensagem_id,
        m.titulo,
        m.conteudo,
        u.username as autor_username,
        m.data_publicacao,
        tp.nome as tipo_politica
    FROM mensagens_ativas m
    JOIN utilizadores u ON m.autor_id = u.id
    JOIN tipos_politica tp ON m.tipo_politica_id = tp.id
    WHERE m.local_id = p_local_id
      AND m.id NOT IN (
          SELECT mensagem_id 
          FROM entregas_mensagens 
          WHERE utilizador_id = p_utilizador_id AND recebida = TRUE
      )
      AND verificar_politica_mensagem(m.id, p_utilizador_id);
END//

-- Procedure para registar entrega de mensagem
CREATE PROCEDURE registar_entrega_mensagem(
    IN p_mensagem_id INT,
    IN p_utilizador_id INT,
    IN p_dispositivo_origem VARCHAR(100),
    IN p_modo_entrega ENUM('CENTRALIZADO', 'DESCENTRALIZADO')
)
BEGIN
    INSERT INTO entregas_mensagens 
    (mensagem_id, utilizador_id, dispositivo_origem, modo_entrega, recebida, data_rececao)
    VALUES 
    (p_mensagem_id, p_utilizador_id, p_dispositivo_origem, p_modo_entrega, TRUE, CURRENT_TIMESTAMP);
END//

DELIMITER ;

-- =============================================
-- Triggers para Auditoria
-- =============================================

DELIMITER //

-- Trigger para logs de mensagens
CREATE TRIGGER trigger_log_mensagem_insert
    AFTER INSERT ON mensagens
    FOR EACH ROW
BEGIN
    INSERT INTO logs_mensagens (mensagem_id, acao, utilizador_id, detalhes)
    VALUES (NEW.id, 'CRIADA', NEW.autor_id, CONCAT('Nova mensagem criada: ', NEW.titulo));
END//

CREATE TRIGGER trigger_log_mensagem_update
    AFTER UPDATE ON mensagens
    FOR EACH ROW
BEGIN
    IF NEW.removida = TRUE AND OLD.removida = FALSE THEN
        INSERT INTO logs_mensagens (mensagem_id, acao, utilizador_id, detalhes)
        VALUES (NEW.id, 'REMOVIDA', NEW.autor_id, 'Mensagem removida pelo autor');
    END IF;
END//

-- Trigger para logs de acesso
CREATE TRIGGER trigger_log_acesso_insert
    AFTER INSERT ON sessoes
    FOR EACH ROW
BEGIN
    INSERT INTO logs_acesso (utilizador_id, acao, descricao)
    VALUES (NEW.utilizador_id, 'LOGIN', 'Nova sessão criada');
END//

CREATE TRIGGER trigger_log_acesso_update
    AFTER UPDATE ON sessoes
    FOR EACH ROW
BEGIN
    IF NEW.ativa = FALSE AND OLD.ativa = TRUE THEN
        INSERT INTO logs_acesso (utilizador_id, acao, descricao)
        VALUES (NEW.utilizador_id, 'LOGOUT', 'Sessão terminada');
    END IF;
END//

DELIMITER ;

-- =============================================
-- Dados de Exemplo para Testes
-- =============================================

-- Inserir alguns utilizadores de exemplo
INSERT INTO utilizadores (username, password_hash) VALUES 
('alice', 'hash_seguro_1'),
('bob', 'hash_seguro_2'),
('carol', 'hash_seguro_3');

-- Inserir locais de exemplo
INSERT INTO locais (nome, descricao, tipo_coordenada_id, criador_id) VALUES 
('Largo da Independência', 'Principal praça da cidade', 1, 1),
('Belas Shopping', 'Centro comercial', 2, 2),
('Ginásio do Camama', 'Ginásio público', 1, 3);

-- Inserir coordenadas GPS
INSERT INTO coordenadas_gps (local_id, latitude, longitude, raio_metros) VALUES 
(1, 38.7343829, -9.1403882, 50),
(3, 38.7400000, -9.1500000, 30);

-- Inserir SSIDs WiFi
INSERT INTO ssids_wifi (local_id, ssid, descricao) VALUES 
(2, 'BelasShopping-FreeWiFi', 'WiFi gratuito do shopping'),
(2, 'BelasShopping-Guest', 'WiFi para convidados');

-- Inserir perfis de exemplo
INSERT INTO perfis_utilizador (utilizador_id, chave, valor) VALUES 
(1, 'profissao', 'estudante'),
(1, 'interesse', 'tecnologia'),
(2, 'profissao', 'engenheiro'),
(2, 'clube', 'Real Madrid'),
(3, 'profissao', 'professor');

-- Inserir chaves públicas de perfil
INSERT INTO chaves_perfil_publicas (chave, descricao) VALUES 
('profissao', 'Profissão do utilizador'),
('interesse', 'Interesses pessoais'),
('clube', 'Clube de futebol preferido');

-- =============================================
-- Comentários nas Tabelas (via ALTER TABLE)
-- =============================================

ALTER TABLE utilizadores COMMENT = 'Armazena os utilizadores do sistema AnunciosLoc';
ALTER TABLE sessoes COMMENT = 'Controla as sessões ativas dos utilizadores';
ALTER TABLE locais COMMENT = 'Define os locais onde as mensagens podem ser publicadas';
ALTER TABLE mensagens COMMENT = 'Armazena todas as mensagens/anúncios do sistema';
ALTER TABLE perfis_utilizador COMMENT = 'Perfis dos utilizadores com pares chave-valor';
ALTER TABLE entregas_mensagens COMMENT = 'Registo de entregas de mensagens aos utilizadores';
ALTER TABLE mulas_mensagens COMMENT = 'Sistema de mulas para roteamento de retransmissão';
ALTER TABLE chaves_publicas COMMENT = 'Chaves públicas para segurança das comunicações';

-- =============================================
-- Fim da Base de Dados AnunciosLoc
-- =============================================