import { AppointmentData, FlowType } from '../types';
import { AGENCIES_MAP } from '../constants';

// Mapeia FlowType para o valor esperado no backend
const mapFlowType = (flow: FlowType): string => {
  switch (flow) {
    case FlowType.Complete:
      return "Complete";
    case FlowType.Specific:
      return "Specific";
    default:
      return flow;
  }
};

// Mapeia nomes de agências (usuário vê nome completo, backend recebe código)
const mapAgencies = (agencies: string[]): string[] => {
  return agencies.map(a => AGENCIES_MAP[a] || a);
};

export const submitAppointment = async (data: AppointmentData) => {
  const payload = {
    ...data,
    flowType: mapFlowType(data.flowType),
    agencies: mapAgencies(data.agencies),
  };

  const response = await fetch('/.netlify/functions/submit-appointment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro no envio: ${response.status} - ${errorText}`);
  }

  return await response.json();
};

export const getAvailableSlots = async (date: string, agencies: string[]) => {
  try {
    const response = await fetch('/.netlify/functions/get-available-slots', {
      method: 'POST',
      body: JSON.stringify({ date, agencies: mapAgencies(agencies) }),
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
