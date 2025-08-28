import React, { useEffect, useState } from 'react';
import { AppointmentData } from '../types';
import { AGENCIES, EVENT_DATES, TIME_SLOTS } from '../constants';

interface Step2Props {
  data: AppointmentData;
  updateData: (data: Partial<AppointmentData>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface AvailabilityResponse {
  success: boolean;
  bookedSlotsByAgency: Record<string, string[]>;
  message?: string;
}

const Step2Scheduling: React.FC<Step2Props> = ({ data, updateData, onNext, onBack }) => {
  const [error, setError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (data.agencies.length === 0 || !data.date) {
      setAvailability({});
      return;
    }

    setIsLoading(true);
    setError(null);

    const fetchAvailability = async () => {
      try {
        console.log('Fetching availability for date:', data.date, 'and agencies:', data.agencies);

        const response = await fetch('/.netlify/functions/check-availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: data.date,
            agencies: data.agencies,
          }),
        });

        const text = await response.text();
        console.log('Raw response from API:', text);

        const result: AvailabilityResponse = JSON.parse(text);
        console.log('Parsed response:', result);

        if (result.success) {
          setAvailability(result.bookedSlotsByAgency);
        } else {
          setError(result.message || 'Erro ao verificar horários.');
        }
      } catch (e: any) {
        console.error('Error fetching availability:', e);
        setError('Erro ao verificar a disponibilidade. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, [data.date, data.agencies]);

  const handleAgencyChange = (agency: string) => {
    const newAgencies = data.agencies.includes(agency)
      ? data.agencies.filter(a => a !== agency)
      : [...data.agencies, agency];

    const newSelectedTimes = { ...data.selectedTimes };
    if (!data.agencies.includes(agency)) {
      // órgão adicionado: não faz nada
    } else {
      // órgão removido: remove horário selecionado
      delete newSelectedTimes[agency];
    }

    updateData({ agencies: newAgencies, selectedTimes: newSelectedTimes });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      updateData({ agencies: AGENCIES, selectedTimes: {} });
    } else {
      updateData({ agencies: [], selectedTimes: {} });
    }
  };

  const handleTimeChange = (agency: string, time: string) => {
    const newSelectedTimes = { ...data.selectedTimes, [agency]: time };
    updateData({ selectedTimes: newSelectedTimes });
  };

  const handleNextClick = () => {
    if (data.agencies.length === 0) {
      setError('Selecione pelo menos um órgão.');
      return;
    }

    const allTimesSelected = data.agencies.every(agency => data.selectedTimes[agency]);
    if (!allTimesSelected) {
      setError('Selecione um horário para cada órgão.');
      return;
    }

    setError(null);
    onNext();
  };

  const allAgenciesSelected = data.agencies.length === AGENCIES.length;

  const isTimeDisabled = (agency: string, time: string) => {
    const booked = availability[agency]?.includes(time);
    const selectedElsewhere = Object.entries(data.selectedTimes).some(
      ([otherAgency, selectedTime]) => otherAgency !== agency && selectedTime === time
    );
    return booked || selectedElsewhere;
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-gray-700">2. Agendamento</h2>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Órgãos de Atendimento</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={allAgenciesSelected}
              onChange={handleSelectAll}
              className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <span className="text-gray-700 font-bold">Selecionar Todos</span>
          </label>
          {AGENCIES.map(agency => (
            <label key={agency} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={data.agencies.includes(agency)}
                onChange={() => handleAgencyChange(agency)}
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="text-gray-700">{agency}</span>
            </label>
          ))}
        </div>
      </div>

      {data.agencies.length > 0 && data.date && (
        <div className="space-y-6 mt-4">
          {data.agencies.map(agency => (
            <div key={agency}>
              <h4 className="text-md font-semibold text-gray-700 mb-2">{agency}</h4>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                {TIME_SLOTS.map(time => {
                  const disabled = isTimeDisabled(agency, time);
                  const isSelected = data.selectedTimes[agency] === time;

                  return (
                    <button
                      key={time}
                      onClick={() => handleTimeChange(agency, time)}
                      disabled={disabled}
                      className={`p-2 rounded-lg text-sm font-medium transition-colors
                        ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}
                        ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'hover:bg-blue-100'}
                      `}
                      title={disabled ? 'Indisponível' : ''}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {isLoading && <p className="text-sm text-gray-500">Verificando horários...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Voltar
        </button>
        <button
          onClick={handleNextClick}
          className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Próximo
        </button>
      </div>
    </div>
  );
};

export default Step2Scheduling;
