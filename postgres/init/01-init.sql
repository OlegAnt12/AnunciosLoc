-- executado apenas na primeira inicialização do volume
CREATE USER grupo15 WITH PASSWORD 'grupo15';
CREATE DATABASE anunciosloc_bd OWNER grupo15;
GRANT ALL PRIVILEGES ON DATABASE anunciosloc_bd TO grupo15;
-- podes acrescentar schema e dados seed aqui (02-schema.sql, 03-seed.sql, ...)