// netlify/functions/submit-appointment.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const MAX_APPOINTMENTS_PER_SLOT = 11;

// Helper: gera slots de 14:00 até 18:45
const generateTimeSlots = () => {
  const slots = [];
  for (let h = 14; h < 19; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hour = h.toString().padStart(2, '0');
      const minute = m.toString().padStart(2, '0');
      slots.push(`${hour}:${minute}`);
    }
  }
  return slots;
};
const TIME_SLOTS = generateTimeSlots();

const formatTime = (timeStr) => {
  if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) return timeStr;
  if (/^\d{2}:\d{2}$/.test(timeStr)) return `${timeStr}:00`;
  return null;
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    console.log("Body recebido:", event.body);
    const data = JSON.parse(event.body);
    console.log("Dados parseados:", data);

    const {
      fullName,
      email,
      phone,
      propertyAddress,
      profile,
      query,
      companyName,
      role,
      companyAddress,
      lgpdConsent,
      flowType,
      agencies,
      date,
      time
    } = data;

    // Validação mínima
    if (
      !fullName ||
      !email ||
      !propertyAddress ||
      lgpdConsent !== true ||
      !date ||
      !time ||
      !agencies ||
      agencies.length === 0
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: 'Campos obrigatórios ausentes ou inválidos.' })
      };
    }

    const formattedTime = formatTime(time);
    if (!formattedTime) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: 'Formato de horário inválido.' })
      };
    }

    const profileArray = Array.isArray(profile)
      ? profile
      : profile
      ? [profile]
      : [];
    const lgpdBoolean = lgpdConsent === true || lgpdConsent === "true";

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const successfulBookings = [];
      for (const agency of agencies) {
        // agora sem FOR UPDATE
        const checkRes = await client.query(
          `SELECT COUNT(*) as count
           FROM appointments
           WHERE appt_date = $1 AND appt_time = $2 AND agency = $3;`,
          [date, formattedTime, agency]
        );

        const count = parseInt(checkRes.rows[0].count || '0', 10);
        if (count < MAX_APPOINTMENTS_PER_SLOT) {
          successfulBookings.push({ agency, time: formattedTime });
        } else {
          await client.query('ROLLBACK');
          return {
            statusCode: 409,
            body: JSON.stringify({
              success: false,
              message: `Conflito de agendamento para ${formattedTime} na agência ${agency}. Tente outro horário.`
            })
          };
        }
      }

      // Insert new appointments
      const insertQuery = `
        INSERT INTO appointments (
          full_name, email, phone, property_address, profile, query,
          company_name, role, company_address, lgpd_consent, flow_type,
          agency, appt_date, appt_time
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14);
      `;

      for (const booking of successfulBookings) {
        await client.query(insertQuery, [
          fullName,
          email,
          phone || null,
          propertyAddress,
          profileArray.length > 0 ? profileArray : null,
          query || null,
          companyName || null,
          role || null,
          companyAddress || null,
          lgpdBoolean,
          flowType || null,
          booking.agency,
          date,
          booking.time
        ]);
      }

      await client.query('COMMIT');
      return { statusCode: 200, body: JSON.stringify({ success: true, message: 'Agendamento confirmado!' }) };

    } catch (dbError) {
      try { await client.query('ROLLBACK'); } catch (e) { /* ignore */ }
      console.error('Database Error:', dbError);
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          message: 'Erro no servidor ao salvar o agendamento.',
          error: dbError.message
        })
      };
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Handler Error:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: 'Requisição mal formatada.', error: error.message })
    };
  }
};
