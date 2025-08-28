const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const TIME_SLOTS = Array.from({ length: (19-14)*4 }, (_, i) => {
  const hour = 14 + Math.floor(i / 4);
  const minute = (i % 4) * 15;
  return `${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')}`;
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const { date, agencies } = JSON.parse(event.body);

    if (!date || !Array.isArray(agencies)) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Data ou agências inválidas' }) };
    }

    const client = await pool.connect();
    try {
      const unavailable = {};
      for (const agency of agencies) {
        const res = await client.query(`SELECT appt_time FROM appointments WHERE appt_date=$1 AND agency=$2`, [date, agency]);
        unavailable[agency] = res.rows.map(row => row.appt_time);
      }
      return { statusCode: 200, body: JSON.stringify(unavailable) };
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ message: 'Erro interno ao buscar horários', error: err.message }) };
  }
};
