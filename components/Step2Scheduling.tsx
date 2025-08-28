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
  const [selectAll, setSelectAll] = useState(false);

  // Carrega disponibilidade do banco
  useEffect(() => {
    const loadAvailability = async () => {
      if (data.agencies.length === 0) return;
      setLoading(true);
      console.log('Fetching availability for date:', data.date, 'and agencies:', data.agencies);
      try {
        const response = await fetchAvailability(data.date, data.agencies);
        console.log('Raw response from API:', response);
        if (response.success) {
          setAvailability(response.bookedSlotsByAgency || {});
        }
      } catch (err) {
        console.error('Error fetching availability:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAvailability();
  }, [data.date, data.agencies]);

  // Marca o horário selecionado
  const handleSelectTime = (agency: string, time: string) => {
    updateData({
      selectedTimes: {
        ...data.selectedTimes,
        [agency]: time
      }
    });
  };

  // Checkbox “Selecionar todos os órgãos”
  const handleSelectAllChange = (checked: boolean) => {
    setSelectAll(checked);
    updateData({ agencies: checked ? [...AGENCIES] : [] });
  };

  // Checkbox individual de órgão
  const handleAgencyChange = (agency: string, checked: boolean) => {
    const newAgencies = checked
      ? [...data.agencies, agency]
      : data.agencies.filter(a => a !== agency);

    updateData({ agencies: newAgencies });
    setSelectAll(newAgencies.length === AGENCIES.length);

    // Remove horários selecionados se o órgão for desmarcado
    if (!checked) {
      const newSelectedTimes = { ...data.selectedTimes };
      delete newSelectedTimes[agency];
      updateData({ selectedTimes: newSelectedTimes });
    }
  };

  // Checa se o horário deve estar desabilitado
  const isSlotDisabled = (agency: string, slot: string) => {
    // Horário já ocupado no banco
    const booked = availability[agency]?.includes(slot);
    if (booked) return true;

    // Horário selecionado para outro órgão
    for (const [otherAgency, selectedTime] of Object.entries(data.selectedTimes)) {
      if (otherAgency !== agency && selectedTime === slot) return true;
    }

    return false;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-700">2. Agendamento</h2>

      <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Selecione os órgãos</h3>
        <div className="flex items-center space-x-2 mt-2">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={(e) => handleSelectAllChange(e.target.checked)}
          />
          <span className="font-medium">Selecionar todos os órgãos</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {AGENCIES.map((agency) => (
            <label key={agency} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={data.agencies.includes(agency)}
                onChange={(e) => handleAgencyChange(agency, e.target.checked)}
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
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot}
                disabled={isSlotDisabled(agency, slot) || loading}
                onClick={() => handleSelectTime(agency, slot)}
                className={`py-1 px-3 rounded-lg border transition-colors ${
                  data.selectedTimes[agency] === slot
                    ? 'bg-green-600 text-white'
                    : isSlotDisabled(agency, slot)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-white text-gray-800 hover:bg-green-100'
                }`}
              >
                {slot}
              </button>
            ))}
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
          disabled={
            data.agencies.length === 0 ||
            Object.keys(data.selectedTimes).length !== data.agencies.length
          }
          className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          Próximo
        </button>
      </div>
    </div>
  );
};

export default Step2Scheduling;
