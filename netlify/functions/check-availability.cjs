const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // necessário para Neon
});

const MAX_APPOINTMENTS_PER_SLOT = 11;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { date, agencies } = JSON.parse(event.body);
    console.log('Fetching availability for date:', date, 'and agencies:', agencies);

    if (!date || !agencies || agencies.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: 'Data e órgãos são obrigatórios.' })
      };
    }

    const client = await pool.connect();
    try {
      const query = `
        SELECT agency, appt_time
        FROM appointments
        WHERE appt_date = $1 AND agency = ANY($2::text[])
        GROUP BY agency, appt_time
        HAVING COUNT(*) >= $3;
      `;
      
      const result = await client.query(query, [date, agencies, MAX_APPOINTMENTS_PER_SLOT]);
      console.log('Raw DB result:', result.rows);

      const bookedSlotsByAgency = {};
      result.rows.forEach(row => {
        const agency = row.agency;
        const time = row.appt_time.slice(0, 5);
        if (!bookedSlotsByAgency[agency]) bookedSlotsByAgency[agency] = [];
        bookedSlotsByAgency[agency].push(time);
      });

      console.log('Parsed bookedSlotsByAgency:', bookedSlotsByAgency);

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, bookedSlotsByAgency })
      };
    } catch (dbError) {
      console.error('Database Error:', dbError);
      return { statusCode: 500, body: JSON.stringify({ success: false, message: 'Erro ao consultar a disponibilidade.' }) };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Handler Error:', error);
    return { statusCode: 400, body: JSON.stringify({ success: false, message: 'Requisição mal formatada.' }) };
  }
};
