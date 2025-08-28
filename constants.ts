import { ProfileType } from "./types";

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

export const PROFILE_OPTIONS: ProfileType[] = [
  ProfileType.Investor,
  ProfileType.Owner,
  ProfileType.Architect,
  ProfileType.Engineer,
];

export const EVENT_DATES: string[] = ["2025-10-07", "2025-10-08"];

export const TIME_SLOTS: string[] = (() => {
  const slots = [];
  // Event runs from 14:00 to 19:00
  for (let h = 14; h < 19; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hour = h.toString().padStart(2, '0');
      const minute = m.toString().padStart(2, '0');
      slots.push(`${hour}:${minute}`);
    }
  }
  return slots;
})();
