// src/components/Step2Scheduling.tsx
import React, { useEffect, useState } from 'react';
import { AppointmentData, FlowType } from '../types';
import { AGENCIES, EVENT_DATES, TIME_SLOTS } from '../constants';

interface Step2Props {
  data: AppointmentData;
  updateData: (data: Partial<AppointmentData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step2Scheduling: React.FC<Step2Props> = ({ data, updateData, onNext, onBack }) => {
  const [error, setError] = useState<string | null>(null);

  const handleAgencyChange = (agency: string) => {
    const newAgencies = data.agencies.includes(agency)
      ? data.agencies.filter(a => a !== agency)
      : [...data.agencies, agency];
    updateData({ agencies: newAgencies, time: '' });
  };

  const handleNextClick = async () => {
    if (data.agencies.length === 0) {
      setError('Selecione pelo menos um órgão.');
      return;
    }
    if (!data.date || !data.time) {
      setError('Selecione data e horário.');
      return;
    }

    setError(null);

    // Chama o backend para agendar sequencialmente
    try {
      const res = await fetch('/.netlify/functions/submit-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();

      if (!json.success) {
        setError(json.message || 'Erro ao agendar.');
        return;
      }

      onNext();
    } catch (err) {
      console.error(err);
      setError('Erro de comunicação com o servidor.');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-700">2. Agendamento</h2>

      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Órgãos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {AGENCIES.map(agency => (
            <label key={agency} className="flex items-center space-x-2">
              <input type="checkbox"
                checked={data.agencies.includes(agency)}
                onChange={() => handleAgencyChange(agency)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <span className="text-gray-700">{agency}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Data</h3>
        <div className="flex space-x-2">
          {EVENT_DATES.map(date => (
            <button
              key={date}
              onClick={() => updateData({ date })}
              className={`px-3 py-1 rounded-lg font-medium ${data.date === date ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Horário inicial</h3>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {TIME_SLOTS.map(time => (
            <button
              key={time}
              onClick={() => updateData({ time })}
              className={`px-2 py-1 rounded-lg text-sm font-medium transition-colors
                ${data.time === time ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'} hover:bg-blue-100`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <div className="flex justify-between mt-6">
        <button onClick={onBack} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Voltar</button>
        <button onClick={handleNextClick} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700">Próximo</button>
      </div>
    </div>
  );
};

export default Step2Scheduling;
