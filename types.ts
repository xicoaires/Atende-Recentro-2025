
export enum AttendanceType {
  GUIDED = 'Fluxo Guiado',
  DIRECT = 'Atendimento Direto',
}

export enum Agency {
  GABINETE = 'Gabinete do Centro',
  SEFIN = 'Secretaria de Finanças (SEFIN)',
  POLITICA_URBANA = 'Secretaria de Política Urbana (Licenciamento/DPPC)',
  CAU_PE = 'CAU/PE',
  IPHAN = 'IPHAN',
  CARTORIO = '1º Cartório de Imóveis',
  SEBRAE = 'SEBRAE',
}

export interface Appointment {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
  propertyAddress: string;
  mainInterest: string;
  attendanceType: AttendanceType;
  agency?: Agency;
  visitDate: string;
  timeslot: string;
  termsAccepted: boolean;
  present: boolean;
}

export interface TimeslotStatus {
  time: string;
  guidedAvailable: number;
  directAvailable: number;
  guidedSoldOut: boolean;
  directSoldOut: boolean;
}