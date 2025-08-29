const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const MAX_PER_SLOT = 40;
const AVAILABLE_TIMES = ["14:00", "15:00", "16:00", "17:00", "18:00"];

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { date } = event.queryStringParameters || {};

  if (!date) {
    return { statusCode: 400, body: "Missing date parameter" };
  }

  try {
    const slots = [];

    for (const time of AVAILABLE_TIMES) {
      const res = await pool.query(
        `SELECT COUNT(*) AS total 
         FROM appointments 
         WHERE appt_date = $1 AND appt_time = $2`,
        [date, time]
      );

      const total = parseInt(res.rows[0].total, 10);
      const available = Math.max(MAX_PER_SLOT - total, 0);

      slots.push({ time, total, available });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, slots }),
    };
  } catch (err) {
    console.error("Erro ao buscar slots:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: err.message }),
    };
  }
};
