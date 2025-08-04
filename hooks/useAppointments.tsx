
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Appointment, ServiceType, TimeSlotStatus } from '../types';
import { CAPACITY, TIME_SLOTS } from '../constants';

interface AppointmentContextType {
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id' | 'checkedIn'>) => Promise<Appointment>;
  getAvailableSlots: (day: string, type: ServiceType) => TimeSlotStatus[];
  findAppointment: (identifier: string) => Appointment | undefined;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id:string) => void;
  toggleCheckIn: (id: string) => void;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

const initialAppointments: Appointment[] = [
    {
        id: 'dummy-1',
        fullName: 'João da Silva',
        email: 'joao.silva@example.com',
        phone: '(81) 99999-1234',
        cpf: '111.222.333-44',
        mainInterest: 'Isenção IPTU',
        propertyAddress: 'Rua da Moeda, 10, Recife',
        serviceType: ServiceType.GUIDED,
        visitDay: '07/10/2025',
        visitTime: '14:00–15:00',
        termsAccepted: true,
        checkedIn: true
    },
    {
        id: 'dummy-2',
        fullName: 'Maria Oliveira',
        email: 'maria.o@example.com',
        phone: '(81) 98888-5678',
        cpf: '222.333.444-55',
        mainInterest: 'Licenciamento de reforma',
        propertyAddress: 'Rua do Apolo, 200, Recife',
        serviceType: ServiceType.DIRECT,
        station: 'Secretaria de Política Urbana (Licenciamento/DPPC)',
        visitDay: '07/10/2025',
        visitTime: '14:00–15:00',
        termsAccepted: true,
        checkedIn: false
    }
];


export const AppointmentProvider = ({ children }: { children: ReactNode }) => {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);

  const getAvailableSlots = useCallback((day: string, type: ServiceType): TimeSlotStatus[] => {
    const dailyAppointments = appointments.filter(a => a.visitDay === day);
    
    return TIME_SLOTS.map(time => {
      const appointmentsInSlot = dailyAppointments.filter(a => a.visitTime === time);
      const guidedCount = appointmentsInSlot.filter(a => a.serviceType === ServiceType.GUIDED).length;
      const directCount = appointmentsInSlot.filter(a => a.serviceType === ServiceType.DIRECT).length;

      let available = true;
      let message = "";

      if (type === ServiceType.GUIDED) {
        if (guidedCount >= CAPACITY.GUIDED) {
          available = false;
          message = "Esgotado";
        } else {
          message = `${CAPACITY.GUIDED - guidedCount} vagas restantes`;
        }
      } else { // ServiceType.DIRECT
        if (directCount >= CAPACITY.DIRECT) {
          available = false;
          message = "Esgotado";
        } else {
          message = `${CAPACITY.DIRECT - directCount} vagas restantes`;
        }
      }
      
      return { time, available, message };
    });
  }, [appointments]);

  const addAppointment = (appointmentData: Omit<Appointment, 'id' | 'checkedIn'>): Promise<Appointment> => {
    return new Promise((resolve, reject) => {
        const existing = appointments.find(a => a.cpf === appointmentData.cpf && a.visitDay === appointmentData.visitDay);
        if (existing) {
            return reject(new Error('CPF já possui agendamento para este dia.'));
        }

        const slots = getAvailableSlots(appointmentData.visitDay, appointmentData.serviceType);
        const chosenSlot = slots.find(s => s.time === appointmentData.visitTime);

        if (!chosenSlot || !chosenSlot.available) {
            return reject(new Error('O horário selecionado não está mais disponível.'));
        }

        const newAppointment: Appointment = {
            ...appointmentData,
            id: new Date().toISOString() + Math.random(),
            checkedIn: false,
        };

        // Simulating async operation
        setTimeout(() => {
            setAppointments(prev => [...prev, newAppointment]);
            // Here you would send a confirmation email
            console.log("Enviando confirmação por email para:", newAppointment.email);
            resolve(newAppointment);
        }, 500);
    });
  };

  const findAppointment = (identifier: string) => {
    return appointments.find(a => a.cpf === identifier || a.email === identifier);
  };
  
  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    setAppointments(prev => prev.map(app => app.id === id ? { ...app, ...updates } : app));
  };
  
  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(app => app.id !== id));
  };

  const toggleCheckIn = (id: string) => {
    setAppointments(prev => prev.map(app => app.id === id ? { ...app, checkedIn: !app.checkedIn } : app));
  };


  return (
    <AppointmentContext.Provider value={{ appointments, addAppointment, getAvailableSlots, findAppointment, updateAppointment, deleteAppointment, toggleCheckIn }}>
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = (): AppointmentContextType => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
};
