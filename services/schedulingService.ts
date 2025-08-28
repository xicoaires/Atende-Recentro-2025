import { AppointmentData } from '../types';

export const submitAppointment = async (data: AppointmentData) => {
  const response = await fetch('/.netlify/functions/submit-appointment', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return await response.json();
};

export const getAvailableSlots = async (date: string, agencies: string[]) => {
  try {
    const response = await fetch('/.netlify/functions/get-available-slots', {
      method: 'POST',
      body: JSON.stringify({ date, agencies }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Falha ao carregar horários');
    }

    const data = await response.json();
    return data as Record<string, string[]>;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
