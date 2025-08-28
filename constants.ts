// src/constants.ts
import { ProfileType } from './types';

// Opções de perfil para Step1PersonalInfo
export const PROFILE_OPTIONS = [
  { label: "Investidor", value: ProfileType.Investor },
  { label: "Proprietário de Imóvel no Centro", value: ProfileType.Owner },
  { label: "Arquiteto", value: ProfileType.Architect },
  { label: "Engenheiro", value: ProfileType.Engineer },
];

// Órgãos disponíveis para agendamento
export const AGENCIES: string[] = [
  "Secretaria de Finanças (SEFIN)",
  "Instituto do Patrimônio Histórico e Artístico Nacional (IPHAN/PE)",
  "Procuradoria de Urbanismo e Meio Ambiente (PUMA)",
  "Secretaria de Desenvolvimento Urbano e Licenciamento (SEPUL)",
  "Procuradoria Municipal da Fazenda",
  "Conselho de Arquitetura e Urbanismo de Pernambuco (CAU/PE)",
  "1º Tabelião de Imóveis do Recife",
  "Corpo de Bombeiros Militar de Pernambuco (CBMPE)",
  "Superintendência do Patrimônio da União (SPU)",
];

// Datas disponíveis para o evento
export const EVENT_DATES = [
  "2025-10-07",
  "2025-10-08",
];

// Horários disponíveis (14:00 até 18:45, em intervalos de 15 minutos)
export const TIME_SLOTS = Array.from({ length: (19 - 14) * 4 }, (_, i) => {
  const hour = 14 + Math.floor(i / 4);
  const minute = (i % 4) * 15;
  return `${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')}`;
});
