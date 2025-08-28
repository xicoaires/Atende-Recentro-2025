// netlify/functions/submit-appointment.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const MAX_APPOINTMENTS_PER_SLOT = 11;

// Helper: formata horário para HH:MM:SS
const formatTime = (timeStr) => {
  if (/^\d{2}:\d{2}$/.test(timeStr)) return `${timeStr}:00`;
  if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) return timeStr;
  return null;
};

// Helper: soma minutos a um horário
const addMinutes = (timeStr, minutesToAdd) => {
  const [h, m] = timeStr.split(':').map(Number);
  const totalMinutes = h * 60 + m + minutesToAdd;
  const newHour = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const newMinute = (totalMinutes % 60).toString().padStart(2, '0');
  return `${newHour}:${newMinute}:00`;
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);

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
      !fullName || !email || !propertyAddress ||
      lgpdConsent !== true || !date || !time ||
      !agencies || agencies.length === 0
    ) {
      return { statusCode: 400, body: JSON.stringify({ success: false, message: 'Campos obrigatórios ausentes ou inválidos.' }) };
    }

    const formattedTime = formatTime(time);
    if (!formattedTime) {
      return { statusCode: 400, body: JSON.stringify({ success: false, message: 'Formato de horário inválido.' }) };
    }

    const profileArray = Array.isArray(profile) ? profile : profile ? [profile] : [];
    const lgpdBoolean = lgpdConsent === true || lgpdConsent === 'true';

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Verifica disponibilidade de todos os horários consecutivos
      for (let i = 0; i < agencies.length; i++) {
        const slotTime = addMinutes(formattedTime, i * 15);
        const res = await client.query(
          `SELECT COUNT(*) as count FROM appointments WHERE appt_date=$1 AND appt_time=$2 AND agency=$3`,
          [date, slotTime, agencies[i]]
        );
        const count = parseInt(res.rows[0].count || '0', 10);
        if (count >= MAX_APPOINTMENTS_PER_SLOT) {
          await client.query('ROLLBACK');
          return {
            statusCode: 409,
            body: JSON.stringify({
              success: false,
              message: `Horário ${slotTime} indisponível para ${agencies[i]}. Escolha outro horário.`
            })
          };
        }
      }

      // Inserir todos os agendamentos
      const insertQuery = `
        INSERT INTO appointments (
          full_name, email, phone, property_address, profile, query,
          company_name, role, company_address, lgpd_consent, flow_type,
          agency, appt_date, appt_time
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      `;

      for (let i = 0; i < agencies.length; i++) {
        const slotTime = addMinutes(formattedTime, i * 15);
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
          agencies[i],
          date,
          slotTime
        ]);
      }

      await client.query('COMMIT');
      return { statusCode: 200, body: JSON.stringify({ success: true, message: 'Agendamento confirmado!' }) };

    } catch (dbError) {
      await client.query('ROLLBACK').catch(() => {});
      console.error('Database Error:', dbError);
      return { statusCode: 500, body: JSON.stringify({ success: false, message: 'Erro ao salvar o agendamento.', error: dbError.message }) };
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Handler Error:', error);
    return { statusCode: 400, body: JSON.stringify({ success: false, message: 'Requisição mal formatada.', error: error.message }) };
  }
};
