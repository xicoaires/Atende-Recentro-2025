import React, { useEffect, useState } from 'react';
import { AppointmentData } from '../types';
import { AGENCIES } from '../constants';
import { fetchAvailability } from '../services/schedulingService';

interface Step2Props {
  data: AppointmentData;
  updateData: (data: Partial<AppointmentData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step2Scheduling: React.FC<Step2Props> = ({ data, updateData, onNext, onBack }) => {
  const [availability, setAvailability] = useState<Record<string, string[]>>({});
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>(data.agencies || []);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const allAgenciesSelected = selectedAgencies.length === AGENCIES.length;

  useEffect(() => {
    const loadAvailability = async () => {
      if (selectedAgencies.length === 0) return;

      console.log('Fetching availability for date:', data.date, 'and agencies:', selectedAgencies);
      setLoadingAvailability(true);
      try {
        const response = await fetchAvailability(data.date, selectedAgencies);
        console.log('Raw response from API:', response);
        if (response.success) {
          setAvailability(response.bookedSlotsByAgency || {});
          console.log('Parsed response:', response);
        }
      } catch (err) {
        console.error('Erro no fetchAvailability:', err);
      } finally {
        setLoadingAvailability(false);
      }
    };

    loadAvailability();
  }, [data.date, selectedAgencies]);

  const toggleAgency = (agency: string) => {
    const newSelection = selectedAgencies.includes(agency)
      ? selectedAgencies.filter(a => a !== agency)
      : [...selectedAgencies, agency];
    setSelectedAgencies(newSelection);
    updateData({ agencies: newSelection });
  };

  const toggleAllAgencies = () => {
    if (allAgenciesSelected) {
      setSelectedAgencies([]);
      updateData({ agencies: [] });
    } else {
      setSelectedAgencies([...AGENCIES]);
      updateData({ agencies: [...AGENCIES] });
    }
  };

  const handleTimeChange = (agency: string, time: string) => {
    updateData({
      selectedTimes: { ...data.selectedTimes, [agency]: time },
    });
  };

  const isTimeDisabled = (time: string, currentAgency: string) => {
    // Desabilita se já foi selecionado em outro órgão
    return Object.entries(data.selectedTimes).some(
      ([agency, selectedTime]) => agency !== currentAgency && selectedTime === time
    );
  };

  const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-700">2. Agendamento</h2>

      <div className="flex items-center space-x-2">
        <input type="checkbox" checked={allAgenciesSelected} onChange={toggleAllAgencies} />
        <label className="font-medium">Selecionar todos os órgãos</label>
      </div>

      {AGENCIES.map(agency => (
        <div key={agency} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedAgencies.includes(agency)}
              onChange={() => toggleAgency(agency)}
            />
            <h3 className="text-lg font-semibold">{agency}</h3>
          </div>

          {selectedAgencies.includes(agency) && (
            <div className="mt-2">
              {loadingAvailability ? (
                <p>Carregando horários disponíveis...</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map(time => {
                    const isBooked = availability[agency]?.includes(time);
                    const isDisabled = isBooked || isTimeDisabled(time, agency);

                    return (
                      <button
                        key={time}
                        disabled={isDisabled}
                        onClick={() => handleTimeChange(agency, time)}
                        className={`py-2 px-3 rounded-lg border ${
                          data.selectedTimes[agency] === time
                            ? 'bg-blue-600 text-white'
                            : isDisabled
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-white hover:bg-gray-100'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <div className="flex justify-between mt-8">
        <button onClick={onBack} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors">
          Voltar
        </button>
        <button
          onClick={onNext}
          disabled={selectedAgencies.length === 0 || Object.keys(data.selectedTimes).length !== selectedAgencies.length}
          className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          Próximo
        </button>
      </div>
    </div>
  );
};

export default Step2Scheduling;
