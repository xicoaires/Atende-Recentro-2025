import { AppointmentData } from '../types';

/**
 * Submits an appointment to the backend API (Netlify Function).
 * @param data - The appointment data to be submitted.
 * @returns A promise that resolves to a success or failure object from the API.
 */
// services/schedulingService.ts

export type AppointmentPayload = {
  fullName: string;
  email: string;
  phone?: string;
  propertyAddress: string;
  profile?: string[];
  query?: string;
  companyName?: string;
  role?: string;
  companyAddress?: string;
  lgpdConsent: boolean;
  flowType?: string;
  agencies: string[];
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
};

// Slots válidos
const TIME_SLOTS = [
  "14:00","14:15","14:30","14:45",
  "15:00","15:15","15:30","15:45",
  "16:00","16:15","16:30","16:45",
  "17:00","17:15","17:30","17:45",
  "18:00","18:15","18:30","18:45"
];

// Validação do payload
export const validateAppointment = (payload: AppointmentPayload) => {
  const errors: string[] = [];

  if (!payload.fullName) errors.push("Nome completo é obrigatório.");
  if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email))
    errors.push("Email inválido ou ausente.");
  if (!payload.propertyAddress) errors.push("Endereço do imóvel é obrigatório.");
  if (payload.lgpdConsent !== true) errors.push("Consentimento LGPD é obrigatório.");
  if (!payload.date || !/^\d{4}-\d{2}-\d{2}$/.test(payload.date))
    errors.push("Data inválida ou ausente. Use YYYY-MM-DD.");
  if (!payload.time || !TIME_SLOTS.includes(payload.time))
    errors.push("Horário inválido ou ausente. Use um slot válido.");
  if (!payload.agencies || payload.agencies.length === 0)
    errors.push("Pelo menos uma agência deve ser selecionada.");
  if (payload.profile && !Array.isArray(payload.profile))
    errors.push("Profile deve ser um array.");

  return { valid: errors.length === 0, errors };
};

// Função para enviar o agendamento
export const submitAppointment = async (payload: AppointmentPayload) => {
  // Valida antes de enviar
  const validation = validateAppointment(payload);
  if (!validation.valid) {
    return { success: false, message: "Erro de validação", errors: validation.errors };
  }

  try {
    const response = await fetch('/.netlify/functions/submit-appointment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || "Erro desconhecido do servidor", ...data };
    }

    return data;

  } catch (err) {
    console.error("Erro ao enviar agendamento:", err);
    return { success: false, message: "Erro de rede ou servidor", error: err };
  }
};
