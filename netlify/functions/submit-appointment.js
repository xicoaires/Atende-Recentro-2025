// netlify/functions/submit-appointment.js
const { Pool } = require('pg');
const { parse, addMinutes, format } = require('date-fns');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const { date, time, agencies, fullName, email, phone, propertyAddress } = data;

    if (!date || !time || !agencies || agencies.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ success: false, message: 'Dados incompletos' }) };
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      let currentTime = parse(`${date} ${time}`, 'yyyy-MM-dd HH:mm', new Date());
      const createdAppointments = [];

      for (const agency of agencies) {
        const appointmentTime = format(currentTime, 'HH:mm');

        const res = await client.query(
          `INSERT INTO appointments (agency, appt_date, appt_time, full_name, email, phone, property_address)
           VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
          [agency, date, appointmentTime, fullName, email, phone, propertyAddress]
        );

        createdAppointments.push({ id: res.rows[0].id, agency, time: appointmentTime });
        currentTime = addMinutes(currentTime, 15); // próximo horário
      }

      await client.query('COMMIT');
      return { statusCode: 200, body: JSON.stringify({ success: true, appointments: createdAppointments }) };
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(err);
      return { statusCode: 500, body: JSON.stringify({ success: false, message: 'Erro interno' }) };
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    return { statusCode: 400, body: JSON.stringify({ success: false, message: 'Requisição inválida' }) };
  }
};
