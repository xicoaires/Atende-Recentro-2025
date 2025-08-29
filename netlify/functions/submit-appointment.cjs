// submit-appointment.cjs
const pool = require("./db.cjs");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

exports.handler = async (event) => {
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
    query,
    companyName,
    role,
    companyAddress,
    lgpdConsent,
    date,
    selectedTimes,
  } = data;

  try {
    const client = await pool.connect(); // pega conexão do pool

    const res = await client.query(
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

    client.release(); // devolve ao pool

    const appointmentId = res.rows[0].id;

    // Enviar e-mail
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Confirmação de Agendamento - Atende Recentro 2025",
      text: `Olá ${fullName}, seu agendamento foi confirmado para o dia ${date} às ${selectedTimes.preference}.`,
    });

    return { statusCode: 200, body: JSON.stringify({ success: true, id: appointmentId }) };
  } catch (err) {
    console.error("Erro ao processar agendamento:", err);
    return { statusCode: 500, body: JSON.stringify({ success: false, message: err.message }) };
  }
};
