import React, { useEffect, useState } from 'react';
import { AppointmentData } from '../types';
import { AGENCIES, TIME_SLOTS } from '../constants';
import { fetchAvailability } from '../services/schedulingService';

interface Step2Props {
  data: AppointmentData;
  updateData: (data: Partial<AppointmentData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step2Scheduling: React.FC<Step2Props> = ({ data, updateData, onNext, onBack }) => {
  const [availability, setAvailability] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadAvailability = async () => {
      setLoading(true);
      console.log('Fetching availability for date:', data.date, 'and agencies:', data.agencies);
      try {
        const response = await fetchAvailability(data.date, data.agencies);
        console.log('Raw response from API:', response);
        if (response.success) {
          setAvailability(response.bookedSlotsByAgency || {});
          console.log('Parsed response:', response);
        }
      } catch (err) {
        console.error('Error fetching availability:', err);
      } finally {
        setLoading(false);
      }
    };

    if (data.agencies.length > 0) {
      loadAvailability();
    }
  }, [data.date, data.agencies]);

  const handleSelectTime = (agency: string, time: string) => {
    updateData({
      selectedTimes: {
        ...data.selectedTimes,
        [agency]: time
      }
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-700">2. Agendamento</h2>
      
      <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Selecione os órgãos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {AGENCIES.map((agency) => (
            <label key={agency} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={data.agencies.includes(agency)}
                onChange={(e) => {
                  const selected = e.target.checked;
                  updateData({
                    agencies: selected
                      ? [...data.agencies, agency]
                      : data.agencies.filter(a => a !== agency)
                  });
                }}
              />
              <span>{agency}</span>
            </label>
          ))}
        </div>
      </div>

      {data.agencies.map((agency) => (
        <div key={agency} className="p-6 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">{agency} - Horários disponíveis</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {TIME_SLOTS.map((slot) => {
              const isBooked = availability[agency]?.includes(slot);
              return (
                <button
                  key={slot}
                  disabled={isBooked || loading}
                  onClick={() => handleSelectTime(agency, slot)}
                  className={`py-1 px-3 rounded-lg border transition-colors ${
                    data.selectedTimes[agency] === slot
                      ? 'bg-green-600 text-white'
                      : isBooked
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-white text-gray-800 hover:bg-green-100'
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex justify-between mt-6">
        <button
          onClick={onBack}
          className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Voltar
        </button>
        <button
          onClick={onNext}
          disabled={data.agencies.length === 0 || Object.keys(data.selectedTimes).length !== data.agencies.length}
          className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          Próximo
        </button>
      </div>
    </div>
  );
};

export default Step2Scheduling;
