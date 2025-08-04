
import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import { Appointment, AttendanceType, TimeslotStatus } from '../types';
import { EVENT_DATES, TIMESLOTS, CAPACITY_PER_HOUR } from '../constants';

// NOTE: This context simulates a backend database like the Netlify DB mentioned in the prompt.
// In a real-world application, the functions here would make API calls
// to a server using a library like `@netlify/neon` or fetch.

interface AppointmentContextType {
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id' | 'present'>) => Promise<{ success: boolean; message: string; appointment?: Appointment }>;
  findAppointment: (identifier: string) => Appointment | undefined;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  markAsPresent: (id: string) => void;
  getTimeslotStatus: (date: string) => TimeslotStatus[];
  isDuplicate: (cpf: string, date: string) => boolean;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

// Initial mock data to demonstrate functionality
const initialAppointments: Appointment[] = [
    {
        id: 'mock1',
        fullName: 'João da Silva',
        email: 'joao.silva@example.com',
        phone: '81999991111',
        cpf: '111.111.111-11',
        propertyAddress: 'Rua da Moeda, 123, Bairro do Recife, Recife - PE',
        mainInterest: 'Isenção IPTU',
        attendanceType: AttendanceType.GUIDED,
        visitDate: '2025-10-07',
        timeslot: '14:00-15:00',
        termsAccepted: true,
        present: false
    }
];

export const AppointmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);

  const getTimeslotStatus = (date: string): TimeslotStatus[] => {
    return TIMESLOTS.map(time => {
      const bookingsForSlot = appointments.filter(a => a.visitDate === date && a.timeslot === time);
      const guidedBookings = bookingsForSlot.filter(a => a.attendanceType === AttendanceType.GUIDED).length;
      const directBookings = bookingsForSlot.filter(a => a.attendanceType === AttendanceType.DIRECT).length;

      return {
        time,
        guidedAvailable: CAPACITY_PER_HOUR.guided - guidedBookings,
        directAvailable: CAPACITY_PER_HOUR.direct - directBookings,
        guidedSoldOut: guidedBookings >= CAPACITY_PER_HOUR.guided,
        directSoldOut: directBookings >= CAPACITY_PER_HOUR.direct,
      };
    });
  };
  
  const isDuplicate = (cpf: string, date: string): boolean => {
    return appointments.some(a => a.cpf === cpf && a.visitDate === date);
  };

  const addAppointment = async (newAppointmentData: Omit<Appointment, 'id' | 'present'>): Promise<{ success: boolean; message: string; appointment?: Appointment }> => {
    return new Promise(resolve => {
        setTimeout(() => { // Simulate network delay
            if (isDuplicate(newAppointmentData.cpf, newAppointmentData.visitDate)) {
                resolve({ success: false, message: 'CPF já possui agendamento para esta data.' });
                return;
            }
            
            const status = getTimeslotStatus(newAppointmentData.visitDate).find(s => s.time === newAppointmentData.timeslot);

            if (newAppointmentData.attendanceType === AttendanceType.GUIDED && status?.guidedSoldOut) {
                resolve({ success: false, message: 'Vagas esgotadas para Fluxo Guiado neste horário.' });
                return;
            }

            if (newAppointmentData.attendanceType === AttendanceType.DIRECT && status?.directSoldOut) {
                resolve({ success: false, message: 'Vagas esgotadas para Atendimento Direto neste horário.' });
                return;
            }

            const appointment: Appointment = {
                ...newAppointmentData,
                id: `appt_${new Date().getTime()}_${Math.random()}`,
                present: false,
            };

            setAppointments(prev => [...prev, appointment]);
            resolve({ success: true, message: 'Agendamento realizado com sucesso!', appointment });
        }, 500);
    });
  };
  
  const findAppointment = (identifier: string): Appointment | undefined => {
    return appointments.find(a => a.cpf === identifier || a.email.toLowerCase() === identifier.toLowerCase());
  };

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };
  
  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const markAsPresent = (id: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, present: !a.present } : a));
  };

  const value = useMemo(() => ({
    appointments,
    addAppointment,
    findAppointment,
    updateAppointment,
    deleteAppointment,
    markAsPresent,
    getTimeslotStatus,
    isDuplicate,
  }), [appointments]);

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = (): AppointmentContextType => {
  const context = useContext(AppointmentContext);
  if (context === undefined) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
};