import { AppointmentData } from '../types';


/**
 * Submits an appointment by sending a POST request to the backend Netlify Function.
 * @param data - The appointment data to be submitted.
 * @returns A promise that resolves to a success or failure object from the API.
 */
export const submitAppointment = async (data: AppointmentData): Promise<{ success: boolean; message: string }> => {
  console.log("Dados que serão enviados:", data);
  try {
    const response = await fetch('/.netlify/functions/submit-appointment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      // The server returned an error (4xx or 5xx)
      // Use the message from the server if available, otherwise a generic one.
      return { success: false, message: result.message || `Erro: ${response.statusText}` };
    }

    return result; // Should be { success: true, message: '...' }

  } catch (error) {
    console.error('Network or parsing error:', error);
    return {
      success: false,
      message: 'Não foi possível conectar ao serviço de agendamento. Verifique sua conexão e tente novamente.',
    };
  }
};
