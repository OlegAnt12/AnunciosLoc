require('dotenv').config();

// Este ficheiro era para seed em MongoDB (projeto anterior). Para este repositório usamos MySQL
// e o script que importa o schema é /backend/scripts/init-db.js que aplica o ficheiro BD/AnunciosLoc.sql.

if (!process.env.MONGODB_URI) {
  console.log('MongoDB URI não definido. Ignorando seed do MongoDB (não aplicável neste projeto).');
  process.exit(0);
}

console.log('MongoDB seed script not used in this project. If you really need Mongo seeding, set MONGODB_URI and update the script.');
process.exit(0);