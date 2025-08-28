export enum ProfileType {
  Investor = "Investidor",
  Owner = "Proprietário de Imóvel no Centro",
  Architect = "Arquiteto",
  Engineer = "Engenheiro",
  PublicEmployee = "Funcionário Público",
  Other = "Outros",
}

export interface AppointmentData {
  fullName: string;
  email: string;
  phone: string;
  propertyAddress: string;
  profile: ProfileType[];
  otherProfileDescription?: string; // <-- adicionado aqui
  query: string;
  companyName?: string;
  role?: string;
  companyAddress?: string;
  lgpdConsent: boolean;
  date: string;
  selectedTimes: Record<string, string>;
}
