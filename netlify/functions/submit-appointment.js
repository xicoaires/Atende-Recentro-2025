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

  let client;
  try {
    const data = JSON.parse(event.body);
    console.log('Dados recebidos para submit:', data);

    const {
      fullName, email, phone, propertyAddress, profile,
      query, companyName, role, companyAddress,
      lgpdConsent, date, agencies, selectedTimes
    } = data;

    if (!fullName || !email || !propertyAddress || !lgpdConsent || !date || !agencies || agencies.length === 0 || !selectedTimes) {
      console.error('Erro de validação: Campos obrigatórios ausentes');
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: 'Erro de validação: Campos obrigatórios ausentes.' })
      };
    }

    client = await pool.connect();
    await client.query('BEGIN');

    const checkQuery = `
      SELECT agency, appt_time, COUNT(*)
      FROM appointments
      WHERE appt_date = $1
        AND (agency = ANY($2::text[]) AND appt_time = ANY($3::time[]))
      GROUP BY agency, appt_time
      HAVING COUNT(*) >= $4;
    `;
    
    const checkAgencies = Object.keys(selectedTimes);
    const checkTimes = Object.values(selectedTimes);

    console.log('Checking for conflicts on agencies:', checkAgencies, 'and times:', checkTimes);

    const resultCheck = await client.query(checkQuery, [date, checkAgencies, checkTimes, MAX_APPOINTMENTS_PER_SLOT]);
    console.log('Conflict check result:', resultCheck.rows);

    if (resultCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      const conflicts = resultCheck.rows.map(row => `${row.agency} às ${row.appt_time.slice(0, 5)}`);
      console.error('Conflitos detectados:', conflicts);
      return {
        statusCode: 409,
        body: JSON.stringify({
          success: false,
          message: `Os seguintes horários não estão mais disponíveis: ${conflicts.join(', ')}`
        })
      };
    }

    const insertQuery = `
      INSERT INTO appointments (
        full_name, email, phone, property_address, profile, query,
        company_name, role, company_address, lgpd_consent,
        agency, appt_date, appt_time
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    `;

    for (const agency of agencies) {
      const apptTime = selectedTimes[agency];
      if (!apptTime) {
        await client.query('ROLLBACK');
        console.error(`Horário não selecionado para o órgão: ${agency}`);
        return {
          statusCode: 400,
          body: JSON.stringify({ success: false, message: `Horário não selecionado para o órgão: ${agency}` })
        };
      }

      await client.query(insertQuery, [
        fullName, email, phone || null, propertyAddress,
        profile.length > 0 ? profile : null, query || null,
        companyName || null, role || null, companyAddress || null,
        lgpdConsent, agency, date, apptTime
      ]);
      console.log(`Agendamento inserido: ${agency} às ${apptTime}`);
    }

    await client.query('COMMIT');
    console.log('Todos os agendamentos confirmados!');
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
