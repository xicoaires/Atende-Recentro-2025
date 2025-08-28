import { AppointmentData } from '../types';

export const submitAppointment = async (data: AppointmentData) => {
  console.log('Chamando submitAppointment com dados:', data);
  const res = await fetch('/.netlify/functions/submit-appointment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  console.log('Resposta do backend submitAppointment:', result);
  return result;
};

export const fetchAvailability = async (date: string, agencies: string[]) => {
  console.log('Chamando fetchAvailability para', date, agencies);
  const res = await fetch('/.netlify/functions/check-availability', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, agencies }),
  });

  const data = await res.json();
  console.log('Resposta do backend fetchAvailability:', data);
  return data;
};
