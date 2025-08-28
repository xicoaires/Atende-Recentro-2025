// netlify/functions/get-available-slots.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const MAX_APPOINTMENTS_PER_SLOT = 11;

// Gera os slots de 14:00 até 18:45 a cada 15 minutos
const TIME_SLOTS = [];
for (let h = 14; h < 19; h++) {
  for (let m = 0; m < 60; m += 15) {
    const hour = h.toString().padStart(2, '0');
    const minute = m.toString().padStart(2, '0');
    TIME_SLOTS.push(`${hour}:${minute}:00`);
  }
}

// Soma minutos a um horário
const addMinutes = (timeStr, minutesToAdd) => {
  const [h, m] = timeStr.split(':').map(Number);
  const totalMinutes = h * 60 + m + minutesToAdd;
  const newHour = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const newMinute = (totalMinutes % 60).toString().padStart(2, '0');
  return `${newHour}:${newMinute}:00`;
};

// Retorna true se houver espaço suficiente para n agendamentos consecutivos
const isConsecutiveAvailable = (slotIndex, unavailableTimes, requiredSlots) => {
  for (let i = 0; i < requiredSlots; i++) {
    if (slotIndex + i >= TIME_SLOTS.length) return false;
    if (unavailableTimes.includes(TIME_SLOTS[slotIndex + i])) return false;
  }
  return true;
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { date, agencies } = JSON.parse(event.body);

    if (!date || !Array.isArray(agencies) || agencies.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Data ou agências inválidas' }) };
    }

    const client = await pool.connect();

    try {
      // Coleta horários ocupados por agência
      const unavailable = {};
      for (const agency of agencies) {
        const res = await client.query(
          `SELECT appt_time FROM appointments WHERE appt_date=$1 AND agency=$2`,
          [date, agency]
        );
        unavailable[agency] = res.rows.map(r => r.appt_time);
      }

      // Filtra apenas os horários que têm slots consecutivos suficientes
      const requiredSlots = agencies.length;
      const availableSlots = TIME_SLOTS.filter((slot, index) =>
        agencies.every(agency => isConsecutiveAvailable(index, unavailable[agency], requiredSlots))
      );

      return { statusCode: 200, body: JSON.stringify({ availableSlots }) };

    } finally {
      client.release();
    }

  } catch (err) {
    console.error('Erro ao buscar horários disponíveis:', err);
    return { statusCode: 500, body: JSON.stringify({ message: 'Erro interno ao buscar horários' }) };
  }
};
