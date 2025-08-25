// netlify/functions/submit-appointment.js

// We need to install this dependency. In your terminal, run:
// npm install pg
const { Pool } = require('pg');

// The connection string is loaded from a secure environment variable.
// In your Netlify site settings, go to "Site configuration" > "Environment variables".
// Create a new variable with the Key "DATABASE_URL" and for the Value,
// paste your full database connection string, like the one you've generated from your database provider.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const MAX_APPOINTMENTS_PER_SLOT = 11;

// Helper function to generate time slots
const generateTimeSlots = () => {
  const slots = [];
  for (let h = 14; h < 19; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hour = h.toString().padStart(2, '0');
      const minute = m.toString().padStart(2, '0');
      slots.push(`${hour}:${minute}`);
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

exports.handler = async (event, context) => {
  // We only accept POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const { date, time, agencies, ...rest } = data;

    // --- Basic Validation ---
    if (!date || !time || !agencies || agencies.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: 'Dados de agendamento inválidos.' }),
      };
    }

    const startIndex = TIME_SLOTS.indexOf(time);
    if (startIndex === -1) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: 'Horário de início inválido.' }),
      };
    }
    
    const requiredSlots = TIME_SLOTS.slice(startIndex, startIndex + agencies.length);
    if (requiredSlots.length < agencies.length) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: `Não há horários consecutivos suficientes a partir de ${time}.`,
        }),
      };
    }

    const client = await pool.connect();
    try {
      // --- Check Availability ---
      // This is a simplified check. A real-world scenario might use a more complex query.
      const availabilityQuery = `
        SELECT agency, COUNT(*) as count
        FROM appointments
        WHERE appt_date = $1 AND appt_time = ANY($2::text[]) AND agency = ANY($3::text[])
        GROUP BY agency, appt_time;
      `;
      const { rows: existingAppointments } = await client.query(availabilityQuery, [date, requiredSlots, agencies]);
      
      const successfulBookings = [];
      let unbookedAgencies = [...agencies];
      let bookingFailed = false;

      for (const slot of requiredSlots) {
          let foundAgencyForSlot = false;
          for (let i = 0; i < unbookedAgencies.length; i++) {
              const agency = unbookedAgencies[i];
              const count = existingAppointments.find(a => a.agency === agency && a.appt_time === slot)?.count || 0;
              
              if (count < MAX_APPOINTMENTS_PER_SLOT) {
                  successfulBookings.push({ agency, time: slot });
                  unbookedAgencies.splice(i, 1);
                  foundAgencyForSlot = true;
                  break;
              }
          }
           if (!foundAgencyForSlot) {
              bookingFailed = true;
              break;
          }
      }

      if (bookingFailed) {
        return {
          statusCode: 409, // Conflict
          body: JSON.stringify({
            success: false,
            message: `Conflito de agendamento. Um dos horários a partir de ${time} não está mais disponível. Por favor, tente outro horário.`,
          }),
        };
      }
      
      // --- Insert new appointments ---
      await client.query('BEGIN'); // Start transaction
      const insertQuery = `
        INSERT INTO appointments (full_name, email, phone, property_address, profile, query, company_name, role, company_address, lgpd_consent, flow_type, agency, appt_date, appt_time)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14);
      `;
      for (const booking of successfulBookings) {
          await client.query(insertQuery, [
            rest.fullName, rest.email, rest.phone, rest.propertyAddress, rest.profile,
            rest.query, rest.companyName, rest.role, rest.companyAddress, rest.lgpdConsent,
            rest.flowType, booking.agency, date, booking.time
          ]);
      }
      await client.query('COMMIT'); // Commit transaction

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: 'Agendamento confirmado com sucesso!' }),
      };

    } catch (dbError) {
      await client.query('ROLLBACK'); // Rollback on error
      console.error('Database Error:', dbError);
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, message: 'Erro no servidor ao salvar o agendamento.' }),
      };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Handler Error:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: 'Requisição mal formatada.' }),
    };
  }
};