import { Client } from "pg";
import nodemailer from "nodemailer";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const formData = JSON.parse(event.body);

    console.log("Chamando submitAppointment com dados:", formData);

    await client.connect();

    const query = `
      INSERT INTO appointments
      (full_name, email, phone, property_address, profile, query, company_name, role, company_address, lgpd_consent, flow_type, agency, appt_date, appt_time)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING id
    `;

    const values = [
      formData.fullName,
      formData.email,
      formData.phone,
      formData.propertyAddress,
      formData.profile,
      formData.query,
      formData.companyName,
      formData.role,
      formData.companyAddress,
      formData.lgpdConsent,
      "recentro",
      null, // agency não usado
      formData.date,
      formData.selectedTimes.preference,
    ];

    const res = await client.query(query, values);
    console.log("Agendamento inserido com ID:", res.rows[0].id);

    // Configura Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // senha de app do Gmail
      },
    });

    const mailOptions = {
      from: '"Atende Recentro" <atenderecentro@gmail.com>',
      to: formData.email,
      subject: "Confirmação de Agendamento - Atende Recentro 2025",
      html: `
        <p>Olá ${formData.fullName},</p>
        <p>Seu agendamento foi confirmado!</p>
        <p><strong>Data:</strong> ${formData.date}</p>
        <p><strong>Horário de preferência:</strong> ${formData.selectedTimes.preference}</p>
        <p>Em breve, nossa equipe entrará em contato com informações adicionais.</p>
        <p>Atenciosamente,<br/>Equipe Atende Recentro 2025</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, id: res.rows[0].id }),
    };
  } catch (error) {
    console.error("Erro ao processar agendamento:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: error.message }),
    };
  } finally {
    await client.end();
  }
}
