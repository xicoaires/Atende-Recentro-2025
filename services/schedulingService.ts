import { AppointmentData } from '../types';
import { TIME_SLOTS } from '../constants';

// In-memory array to act as a mock database
const mockAppointments: AppointmentData[] = [];

const MAX_APPOINTMENTS_PER_SLOT = 11;

/**
 * Checks if a specific time slot is available for a single agency.
 * Now assumes every appointment record is for a single agency at a single time.
 * @param date - The date of the appointment (YYYY-MM-DD).
 * @param time - The time of the appointment (HH:MM).
 * @param agency - The agency name to check.
 * @returns A boolean indicating if the slot is available.
 */
const isSlotAvailable = (date: string, time: string, agency: string): boolean => {
  const appointmentsCount = mockAppointments.filter(
    (appt) => appt.date === date && appt.time === time && appt.agencies.includes(agency)
  ).length;

  return appointmentsCount < MAX_APPOINTMENTS_PER_SLOT;
};


/**
 * Simulates submitting an appointment to a backend.
 * All appointments are now booked sequentially if multiple agencies are selected,
 * regardless of the flow type.
 * It will attempt to re-order the agencies to find a valid sequence if there's a conflict.
 * @param data - The appointment data to be submitted.
 * @returns A promise that resolves to a success or failure object.
 */
export const submitAppointment = (data: AppointmentData): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      const { date, time, agencies } = data;

      if (!date || !time) {
        resolve({ success: false, message: 'Por favor, selecione uma data e um horário válidos.' });
        return;
      }
      
      if (!agencies || agencies.length === 0) {
        resolve({ success: false, message: 'Nenhum órgão selecionado para agendamento.' });
        return;
      }

      const startIndex = TIME_SLOTS.indexOf(time);
      if (startIndex === -1) {
          resolve({ success: false, message: 'Horário de início inválido.' });
          return;
      }
      
      const requiredSlots = TIME_SLOTS.slice(startIndex, startIndex + agencies.length);
      if (requiredSlots.length < agencies.length) {
          resolve({
              success: false,
              message: `Não há horários consecutivos suficientes a partir de ${time} para todos os órgãos selecionados. Por favor, escolha um horário mais cedo.`,
          });
          return;
      }

      // --- Smart Reordering Logic ---
      let unbookedAgencies = [...agencies];
      const successfulBookings: { agency: string; time: string }[] = [];
      let bookingFailed = false;

      for (const slot of requiredSlots) {
          let foundAgencyForSlot = false;
          // Find any available agency for the current slot
          for (let i = 0; i < unbookedAgencies.length; i++) {
              const agency = unbookedAgencies[i];
              if (isSlotAvailable(date, slot, agency)) {
                  successfulBookings.push({ agency, time: slot });
                  unbookedAgencies.splice(i, 1); // Remove booked agency
                  foundAgencyForSlot = true;
                  break; // Move to the next slot
              }
          }

          if (!foundAgencyForSlot) {
              bookingFailed = true;
              break; // If no agency can be booked in this slot, the entire sequence fails
          }
      }

      if (bookingFailed) {
          resolve({
              success: false,
              message: `Não foi possível encontrar uma sequência de horários disponíveis a partir de ${time}. Tente outro horário de início ou selecione menos órgãos.`,
          });
          return;
      }
      
      // If successful, create an appointment record for each one
      successfulBookings.forEach(booking => {
          const newSequentialAppointment: AppointmentData = {
              ...data,
              agencies: [booking.agency], // Each record has only one agency
              time: booking.time,
          };
          mockAppointments.push(newSequentialAppointment);
      });

      console.log('Current Appointments:', mockAppointments);
      resolve({ success: true, message: 'Agendamento confirmado com sucesso!' });
      
    }, 1000); // 1-second delay
  });
};