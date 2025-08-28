// db.js
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // importante para conexões em serviços como Heroku/Render
  },
});

export default pool;
