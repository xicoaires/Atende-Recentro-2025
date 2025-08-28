import React from 'react';
import { AppointmentData } from '../types';

interface Step2Props {
  data: AppointmentData;
  updateData: (data: Partial<AppointmentData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const AVAILABLE_DATES = ['2025-10-07', '2025-10-08'];
const AVAILABLE_TIMES = ['14:00', '15:00', '16:00', '17:00', '18:00'];

const Step2Scheduling: React.FC<Step2Props> = ({ data, updateData, onNext, onBack }) => {
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-gray-700 text-center">2. Agendamento</h2>

      {/* Seleção da data */}
      <div className="text-center">
        <p className="text-gray-600 font-medium mb-4">Selecione o dia*</p>
        <div className="flex justify-center gap-6">
          {AVAILABLE_DATES.map((date) => (
            <button
              key={date}
              onClick={() => updateData({ date })}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                data.date === date
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {date.split('-').reverse().join('/')}
            </button>
          ))}
        </div>
      </div>

      {/* Seleção do horário */}
      <div className="text-center">
        <p className="text-gray-600 font-medium mb-4">Hora de preferência*</p>
        <div className="flex justify-center flex-wrap gap-4">
          {AVAILABLE_TIMES.map((time) => (
            <button
              key={time}
              onClick={() => updateData({ selectedTimes: { preference: time } })}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                data.selectedTimes['preference'] === time
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* Botões Voltar e Próximo */}
      <div className="flex justify-between mt-6">
        <button
          onClick={onBack}
          className="bg-gray-300 text-gray-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Voltar
        </button>

        <button
          onClick={onNext}
          className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Próximo
        </button>
      </div>
    </div>
  );
};

export default Step2Scheduling;
