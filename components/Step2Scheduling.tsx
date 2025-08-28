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

  useEffect(() => {
    if (data.flowType === FlowType.Complete) {
      updateData({ agencies: AGENCIES });
    } else if (data.agencies.length === AGENCIES.length) {
      updateData({ agencies: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.flowType]);

  const handleAgencyChange = (agency: string) => {
    const newAgencies = data.agencies.includes(agency)
      ? data.agencies.filter(a => a !== agency)
      : [...data.agencies, agency];
    updateData({ agencies: newAgencies, time: '' });
  };

  const handleNextClick = () => {
    if (data.agencies.length === 0) {
      setError('Selecione pelo menos um órgão.');
      return;
    }
    if (!data.time) {
      setError('Selecione um horário.');
      return;
    }
    setError(null);
    onNext();
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">2. Tipo de Atendimento</h2>
        <div className="space-y-2">
          <div className="flex items-center p-3 border rounded-lg">
            <input type="radio" id="flowComplete" name="flowType" value={FlowType.Complete}
              checked={data.flowType === FlowType.Complete}
              onChange={e => updateData({ flowType: e.target.value as FlowType, time: '' })}
              className="h-4 w-4 text-blue-600 border-gray-300" />
            <label htmlFor="flowComplete" className="ml-3 block text-sm font-medium text-gray-700">{FlowType.Complete}</label>
          </div>
          <div className="flex items-center p-3 border rounded-lg">
            <input type="radio" id="flowSpecific" name="flowType" value={FlowType.Specific}
              checked={data.flowType === FlowType.Specific}
              onChange={e => updateData({ flowType: e.target.value as FlowType })}
              className="h-4 w-4 text-blue-600 border-gray-300" />
            <label htmlFor="flowSpecific" className="ml-3 block text-sm font-medium text-gray-700">{FlowType.Specific}</label>
          </div>
        </div>
      </div>

      {data.flowType === FlowType.Specific && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Órgãos Disponíveis</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AGENCIES.map(agency => (
              <div key={agency} className="flex items-center">
                <input id={agency} type="checkbox"
                  checked={data.agencies.includes(agency)}
                  onChange={() => handleAgencyChange(agency)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                <label htmlFor={agency} className="ml-2 block text-sm text-gray-900">{agency}</label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Data e Hora</h3>
        <p className="text-sm text-gray-500 mb-4">
          {data.agencies.length > 0
            ? `Selecione o horário de início. O sistema agendará ${data.agencies.length} atendimentos sequenciais de 15 minutos.`
            : 'Selecione o tipo de atendimento e os órgãos para agendar.'}
        </p>
        <div className="flex space-x-4 mb-4">
          {EVENT_DATES.map(date => (
            <button key={date} onClick={() => updateData({ date })} className={`px-4 py-2 rounded-lg font-medium ${data.date === date ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
          {TIME_SLOTS.map((time, index) => {
            const requiredSlots = data.agencies.length || 1;
            const isSlotDisabled = index + requiredSlots > TIME_SLOTS.length;
            return (
              <button key={time} onClick={() => updateData({ time })}
                disabled={isSlotDisabled || data.agencies.length === 0}
                className={`p-2 rounded-lg text-sm font-medium transition-colors
                  ${data.time === time ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}
                  ${isSlotDisabled || data.agencies.length === 0 ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'hover:bg-blue-100'}
                `}
                title={isSlotDisabled ? "Não há horários consecutivos suficientes a partir deste ponto." : ""}
              >
                {time}
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm font-medium mt-4">{error}</p>}

      <div className="flex justify-between mt-8">
        <button onClick={onBack} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors">Voltar</button>
        <button onClick={handleNextClick} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors">Próximo</button>
      </div>
    </div>
  );
};

export default Step2Scheduling;
