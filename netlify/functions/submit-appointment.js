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

    console.log('--- Dados recebidos no backend ---');
    console.log({ fullName, email, phone, propertyAddress, profile, query, companyName, role, companyAddress, lgpdConsent, date, agencies, selectedTimes });

    // Validação de campos obrigatórios
    if (!fullName) return { statusCode: 400, body: JSON.stringify({ success: false, message: 'Campo fullName ausente' }) };
    if (!email) return { statusCode: 400, body: JSON.stringify({ success: false, message: 'Campo email ausente' }) };
    if (!propertyAddress) return { statusCode: 400, body: JSON.stringify({ success: false, message: 'Campo propertyAddress ausente' }) };
    if (!lgpdConsent) return { statusCode: 400, body: JSON.stringify({ success: false, message: 'LGPD não consentido' }) };
    if (!date) return { statusCode: 400, body: JSON.stringify({ success: false, message: 'Campo date ausente' }) };
    if (!agencies || agencies.length === 0) return { statusCode: 400, body: JSON.stringify({ success: false, message: 'Nenhum órgão selecionado' }) };
    if (!selectedTimes || Object.keys(selectedTimes).length === 0) return { statusCode: 400, body: JSON.stringify({ success: false, message: 'Nenhum horário selecionado' }) };

    client = await pool.connect();
    await client.query('BEGIN');

    console.log('Conexão com o banco estabelecida. Iniciando verificação de conflitos...');

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

    const resultCheck = await client.query(checkQuery, [date, checkAgencies, checkTimes, MAX_APPOINTMENTS_PER_SLOT]);

    console.log('Resultado da verificação de conflitos:', resultCheck.rows);

    if (resultCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      const conflicts = resultCheck.rows.map(row => `${row.agency} às ${row.appt_time.slice(0, 5)}`);
      return { statusCode: 409, body: JSON.stringify({ success: false, message: `Os seguintes horários não estão mais disponíveis: ${conflicts.join(', ')}` }) };
    }

    console.log('Nenhum conflito encontrado. Inserindo registros no banco...');

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
        return { statusCode: 400, body: JSON.stringify({ success: false, message: `Horário não selecionado para o órgão: ${agency}` }) };
      }

      console.log(`Inserindo agendamento: ${agency} às ${apptTime}`);

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
        apptTime
      ]);
    }

    await client.query('COMMIT');
    console.log('Agendamentos inseridos com sucesso!');
    return { statusCode: 200, body: JSON.stringify({ success: true, message: 'Agendamento confirmado!' }) };

  } catch (error) {
    if (client) {
      await client.query('ROLLBACK').catch(() => {});
    }
    console.error('Erro no submit-appointment:', error);
    return { statusCode: 500, body: JSON.stringify({ success: false, message: 'Erro ao salvar o agendamento', error: error.message }) };
  } finally {
    if (client) client.release();
  }
};
