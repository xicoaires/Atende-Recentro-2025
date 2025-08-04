
import { Agency } from './types';

export const EVENT_DATES = ['2025-10-07', '2025-10-08'];
export const TIMESLOTS = ['14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00', '18:00-19:00'];
export const AGENCIES = Object.values(Agency);

export const CAPACITY_PER_HOUR = {
  total: 20,
  guided: 15,
  direct: 5,
};

export const ADMIN_CREDENTIALS = {
  login: 'Recentro',
  password: 'AtendeRec@2025'
};
