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
      agencies,
      selectedTimes,
    } = JSON.parse(event.body);

    console.log('Dados recebidos para submit:', {
      fullName, email, phone, propertyAddress, profile, query,
      companyName, role, companyAddress, lgpdConsent, date, agencies, selectedTimes
    });

    if (!fullName || !email || !propertyAddress || !lgpdConsent || !date || !agencies || agencies.length === 0 || !selectedTimes) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: 'Erro de validação: Campos obrigatórios ausentes.' })
      };
    }

    client = await pool.connect();
    await client.query('BEGIN');

    // Verifica se algum horário já está cheio
    const conflicts = [];

    for (const agency of agencies) {
      const apptTime = selectedTimes[agency];
      if (!apptTime) {
        await client.query('ROLLBACK');
        return {
          statusCode: 400,
          body: JSON.stringify({ success: false, message: `Horário não selecionado para o órgão: ${agency}` })
        };
      }

      const checkQuery = `
        SELECT COUNT(*) as count
        FROM appointments
        WHERE appt_date = $1 AND agency = $2 AND appt_time = $3
      `;
      const res = await client.query(checkQuery, [date, agency, apptTime]);
      if (parseInt(res.rows[0].count) >= MAX_APPOINTMENTS_PER_SLOT) {
        conflicts.push(`${agency} às ${apptTime}`);
      }
    }

    if (conflicts.length > 0) {
      await client.query('ROLLBACK');
      console.log('Conflitos encontrados:', conflicts);
      return {
        statusCode: 409,
        body: JSON.stringify({
          success: false,
          message: `Os seguintes horários não estão mais disponíveis: ${conflicts.join(', ')}`
        })
      };
    }

    // Inserção segura
    const insertQuery = `
      INSERT INTO appointments (
        full_name, email, phone, property_address, profile, query,
        company_name, role, company_address, lgpd_consent,
        agency, appt_date, appt_time
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    `;

    for (const agency of agencies) {
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
        agency,
        date,
        selectedTimes[agency]
      ]);
    }

    await client.query('COMMIT');
    console.log('Agendamento salvo com sucesso!');
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Agendamento confirmado!' })
    };

  } catch (error) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    console.error('Erro no submit-appointment:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: 'Erro ao salvar o agendamento.', error: error.message })
    };
  } finally {
    if (client) client.release();
  }
};
