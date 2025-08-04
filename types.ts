
export enum ServiceType {
  GUIDED = 'Fluxo Guiado',
  DIRECT = 'Atendimento Direto',
}

export interface Appointment {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
  mainInterest: string;
  propertyAddress: string;
  serviceType: ServiceType;
  station?: string;
  visitDay: string;
  visitTime: string;
  termsAccepted: boolean;
  checkedIn: boolean;
}

export interface TimeSlotStatus {
  time: string;
  available: boolean;
  message: string;
}
