// Datas disponíveis para agendamento
export const EVENT_DATES = [
  "2025-10-07",
  "2025-10-08",
];

// Horários fixos de agendamento
export const TIME_SLOTS = [
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

// Lista de órgãos exibidos para o usuário
export const AGENCIES = [
  "Secretaria de Finanças (SEFIN)",
  "Instituto do Patrimônio Histórico e Artístico Nacional (IPHAN/PE)",
  "Secretaria de Desenvolvimento Urbano (SEDURB)",
  "Secretaria de Meio Ambiente e Sustentabilidade (SMAS)",
];

// Mapeamento entre o nome exibido no front e o código esperado no backend
export const AGENCIES_MAP: Record<string, string> = {
  "Secretaria de Finanças (SEFIN)": "SEFIN",
  "Instituto do Patrimônio Histórico e Artístico Nacional (IPHAN/PE)": "IPHAN",
  "Secretaria de Desenvolvimento Urbano (SEDURB)": "SEDURB",
  "Secretaria de Meio Ambiente e Sustentabilidade (SMAS)": "SMAS",
};
