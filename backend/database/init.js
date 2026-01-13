const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const config = require('../config/environment');

const sqlFile = path.resolve(__dirname, '../../BD/AnunciosLoc.sql');

if (!fs.existsSync(sqlFile)) {
  console.error('❌ SQL file not found at', sqlFile);
  process.exit(1);
}

const host = process.env.DB_HOST || config.DB_HOST;
const port = process.env.DB_PORT || config.DB_PORT;
const user = process.env.DB_USER || config.DB_USER;
const password = process.env.DB_PASSWORD || config.DB_PASSWORD;
const database = process.env.DB_NAME || config.DB_NAME;

const args = ['-h', host, '-P', String(port), '-u', user, `-p${password}`, database];

console.log('➡️  Initializing database using mysql client');
console.log('mysql', args.join(' '));

const mysql = spawn('mysql', args, { stdio: ['pipe', 'pipe', 'pipe'] });

const sqlStream = fs.createReadStream(sqlFile);
sqlStream.pipe(mysql.stdin);

mysql.stdout.on('data', (data) => process.stdout.write(data.toString()));
mysql.stderr.on('data', (data) => process.stderr.write(data.toString()));

mysql.on('error', (err) => {
  console.error('❌ Failed to run mysql client. Is mysql-client installed in the container?');
  console.error(err);
  process.exit(1);
});

mysql.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Database initialized successfully');
    process.exit(0);
  } else {
    console.error('❌ mysql exited with code', code);
    process.exit(code);
  }
});
