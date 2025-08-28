// submit-appointment.js
import pool from "./db.js"; // seu pool configurado em db.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,         // ex: seu email@gmail.com
    pass: process.env.GMAIL_APP_PASSWORD, // App Password do Gmail
  },
});

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const {
    fullName,
    email,
    phone,
    propertyAddress,
    profile,
    otherProfileDescription,
    query,
    companyName,
    role,
    companyAddress,
    lgpdConsent,
    date,
    selectedTimes,
  } = data;

  let client;

  try {
    client = await pool.connect(); // pega conexão do pool

    // insere no banco
    const result = await client.query(
      `INSERT INTO appointments 
        (full_name, email, phone, property_address, profile, query, company_name, role, company_address, lgpd_consent, appt_date, appt_time)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
      [
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
        selectedTimes.preference,
      ]
    );

    const appointmentId = result.rows[0].id;

    // envia e-mail de confirmação
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Confirmação de Agendamento - Atende Recentro 2025",
      text: `Olá ${fullName},\n\nSeu agendamento foi confirmado para o dia ${date} às ${selectedTimes.preference}.\n\nObrigado,\nEquipe Atende Recentro 2025`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, id: appointmentId }),
    };
  } catch (err) {
    console.error("Erro ao processar agendamento:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: err.message }),
    };
  } finally {
    if (client) client.release(); // sempre libera a conexão
  }
};
