// submit-appointment.js
const { Pool } = require('pg');
const nodemailer = require('nodemailer');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const MAX_APPOINTMENTS_PER_SLOT = 11;

// Configuração do Nodemailer para Gmail
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true se usar 465
  auth: {
    user: process.env.SMTP_USER, // exemplo: "atenderecentro@gmail.com"
    pass: process.env.SMTP_PASS  // senha de app do Gmail
  }
});

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

    if (!fullName || !email || !propertyAddress || !lgpdConsent || !date || !selectedTimes) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: 'Erro de validação: Campos obrigatórios ausentes.' })
      };
    }

    client = await pool.connect();
    await client.query('BEGIN');

    const insertQuery = `
      INSERT INTO appointments (
          full_name, email, phone, property_address, profile, query,
          company_name, role, company_address, lgpd_consent,
          appt_date, appt_time
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    `;

    // Inserindo cada horário selecionado (selectedTimes é um objeto {hora: horaSelecionada})
    for (const [key, apptTime] of Object.entries(selectedTimes)) {
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
        apptTime
      ]);
    }

    await client.query('COMMIT');

    // Envio do e-mail de confirmação
    const mailOptions = {
      from: '"Atende Recentro 2025" <atenderecentro@gmail.com>',
      to: email,
      subject: 'Confirmação de Agendamento - Atende Recentro 2025',
      html: `
        <p>Olá ${fullName},</p>
        <p>Seu agendamento para o Atende Recentro 2025 foi confirmado com sucesso!</p>
        <p><strong>Data:</strong> ${new Date(date).toLocaleDateString('pt-BR')}</p>
        <p><strong>Horário de preferência:</strong> ${Object.values(selectedTimes).join(', ')}</p>
        <p>A equipe do Recentro entrará em contato com informações adicionais, se necessário.</p>
        <br/>
        <p>Atenciosamente,<br/>Equipe Atende Recentro 2025</p>
      `
    };

    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Agendamento confirmado e e-mail enviado!' })
    };

  } catch (error) {
    if (client) {
      await client.query('ROLLBACK').catch(() => {});
    }
    console.error('Erro ao processar agendamento:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: 'Erro ao salvar o agendamento ou enviar e-mail.', error: error.message })
    };
  } finally {
    if (client) client.release();
  }
};
