export enum ProfileType {
  Investor = "Investidor",
  Owner = "Proprietário de Imóvel no Centro",
  Architect = "Arquiteto",
  Engineer = "Engenheiro",
}

export enum FlowType {
  Complete = "Fluxo completo (todos os órgãos em sequência)",
  Specific = "Fluxo específico (você escolhe os órgãos)",
}

export interface AppointmentData {
  fullName: string;
  email: string;
  phone: string;
  propertyAddress: string;
  profile: ProfileType[];
  query: string;
  companyName?: string;
  role?: string;
  companyAddress?: string;
  lgpdConsent: boolean;
  flowType: FlowType;
  agencies: string[];
  date: string;
  time: string;
}
