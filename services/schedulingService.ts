// schedulingService.ts
import { AppointmentData } from '../types';

export async function submitAppointment(appointmentData: AppointmentData) {
  try {
    const response = await fetch("/.netlify/functions/submit-appointment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(appointmentData),
    });

    // Verifica se o backend retornou 2xx
    if (!response.ok) {
      const text = await response.text(); // pega corpo como texto para debug
      console.error("Erro inesperado no submit:", text);
      throw new Error(`Erro ao enviar agendamento: ${response.status}`);
    }

    // Converte para JSON apenas se houver conteúdo
    const text = await response.text();
    if (!text) {
      throw new Error("Resposta vazia do servidor");
    }

    const result = JSON.parse(text);
    return result;

  } catch (err) {
    console.error("Erro no submitAppointment:", err);
    throw err;
  }
}
