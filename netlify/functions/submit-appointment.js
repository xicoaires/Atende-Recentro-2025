const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const MAX_APPOINTMENTS_PER_SLOT = 11;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let client;

  try {
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
      date,
      selectedTimes,
    } = JSON.parse(event.body);

    // Validação mínima
    if (!fullName || !email || !propertyAddress || !lgpdConsent || !date || !selectedTimes || Object.keys(selectedTimes).length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: 'Erro de validação: Campos obrigatórios ausentes.' })
      };
    }

    client = await pool.connect();
    await client.query('BEGIN');

    // Checa conflitos por horário
    const checkQuery = `
      SELECT appt_time, COUNT(*)
      FROM appointments
      WHERE appt_date = $1
      AND appt_time = ANY($2::time[])
      GROUP BY appt_time
      HAVING COUNT(*) >= $3;
    `;
    const times = Object.values(selectedTimes);

    const resultCheck = await client.query(checkQuery, [date, times, MAX_APPOINTMENTS_PER_SLOT]);

    if (resultCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      const conflicts = resultCheck.rows.map(row => row.appt_time.slice(0, 5));
      return {
        statusCode: 409,
        body: JSON.stringify({
          success: false,
          message: `Os seguintes horários não estão mais disponíveis: ${conflicts.join(', ')}`
        })
      };
    }

    // Insere um registro por horário selecionado
    const insertQuery = `
      INSERT INTO appointments (
        full_name, email, phone, property_address, profile, query,
        company_name, role, company_address, lgpd_consent,
        appt_date, appt_time
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    `;

    for (const time of times) {
      await client.query(insertQuery, [
        fullName,
        email,
        phone || null,
        propertyAddress,
        profile.length > 0 ? profile : null,
        query || null,
        companyName || null,
        role || null,
        companyAddress || null,
        lgpdConsent,
        date,
        time
      ]);
    }

    await client.query('COMMIT');
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Agendamento confirmado!' })
    };

  } catch (error) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    console.error('Final Submission Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: 'Erro ao salvar o agendamento.', error: error.message })
    };
  } finally {
    if (client) client.release();
  }
};
