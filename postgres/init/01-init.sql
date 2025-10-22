-- executado apenas na primeira inicialização do volume
CREATE USER bits WITH PASSWORD 'bits123';
CREATE DATABASE anunciosloc_bd OWNER bits;
GRANT ALL PRIVILEGES ON DATABASE anunciosloc_bd TO bits;
-- podes acrescentar schema e dados seed aqui (02-schema.sql, 03-seed.sql, ...)