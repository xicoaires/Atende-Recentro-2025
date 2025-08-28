export enum ProfileType {
  Investor = "Investidor",
  Owner = "Proprietário de Imóvel no Centro",
  Architect = "Arquiteto",
  Engineer = "Engenheiro",
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
  agencies: string[];
  date: string;
  selectedTimes: Record<string, string>;
}