import { AppointmentData } from '../types';

/**
 * Submits an appointment to the backend API (Netlify Function).
 * @param data - The appointment data to be submitted.
 * @returns A promise that resolves to a success or failure object from the API.
 */
export const submitAppointment = async (data: AppointmentData): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch('/.netlify/functions/submit-appointment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      // Try to parse error message from backend, or use a generic one
      const errorResult = await response.json().catch(() => null);
      const message = errorResult?.message || `Erro no servidor: ${response.statusText}`;
      return { success: false, message };
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error('Network or client-side error:', error);
    return { 
      success: false, 
      message: 'Ocorreu um erro de comunicação. Verifique sua conexão e tente novamente.' 
    };
  }
};
