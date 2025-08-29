const { Pool } = require("pg");
const nodemailer = require("nodemailer");

// Configuração do Pool (evita erro de "Client already connected")
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // seu e-mail
    pass: process.env.GMAIL_APP_PASSWORD, // senha ou App Password
  },
});

// Função para formatar a data corretamente
function formatDatePTBR(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day); // mês zero-indexado
  const weekdays = [
    "domingo",
    "segunda-feira",
    "terça-feira",
    "quarta-feira",
    "quinta-feira",
    "sexta-feira",
    "sábado",
  ];
  const months = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];

  const weekday = weekdays[dateObj.getDay()];
  const monthName = months[dateObj.getMonth()];

  return `${day} de ${monthName} (${weekday})`;
}

// Função principal do Netlify
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
    otherProfileDescription, // mantido no destructuring
    query,
    companyName,
    role,
    companyAddress,
    lgpdConsent,
    date,
    selectedTimes,
  } = data;

  try {
    // Verifica quantos agendamentos já existem para a mesma data e hora
    const check = await pool.query(
      `SELECT COUNT(*) AS total 
       FROM appointments 
       WHERE appt_date = $1 AND appt_time = $2`,
      [date, selectedTimes.preference]
    );

    const total = parseInt(check.rows[0].total, 10);

    if (total >= 40) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: "Esse horário já atingiu o limite de 40 agendamentos.",
        }),
      };
    }

    // Insere o agendamento no banco (sem otherProfileDescription)
    const res = await pool.query(
      `INSERT INTO appointments (
        full_name,
        email,
        phone,
        property_address,
        profile,
        query,
        company_name,
        role,
        company_address,
        lgpd_consent,
        appt_date,
        appt_time
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
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

    const appointmentId = res.rows[0].id;

    // Formata a data para o e-mail
    const formattedDate = formatDatePTBR(date);

    // Enviar e-mail de confirmação
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Confirmação de Agendamento - Atende Recentro 2025",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            
            <h2 style="color: #1E40AF; margin-bottom: 10px;">Olá ${fullName},</h2>
            
            <p style="font-size: 16px;">Seu agendamento foi confirmado com sucesso! Seguem os detalhes:</p>

            <div style="background-color: #EFF6FF; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold; color: #1E40AF;">📍 Local do Evento:</p>
              <p style="margin: 5px 0 0 0;">Complexo Niágara S.A. - Av. Rio Branco, 162 - Recife</p>
            </div>

            <ul style="padding-left: 20px; margin: 0 0 20px 0; list-style-type: disc;">
              <li><strong>Data:</strong> ${formattedDate}</li>
              <li><strong>Horário:</strong> ${selectedTimes.preference}</li>
              <li><strong>Endereço do imóvel:</strong> ${propertyAddress}</li>

            </ul>

            <p style="font-size: 16px;">Estamos ansiosos para recebê-lo(a) no Atende Recentro 2025.</p>

            <div style="margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 15px; font-size: 14px; color: #555;">
              <p>Atenciosamente,</p>
              <p><strong>Equipe Atende Recentro 2025</strong></p>
            </div>

          </div>
        </div>
      `,
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
  }
};
