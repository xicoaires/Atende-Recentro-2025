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

// Função para formatar a data para exibição
const formatDateForDisplay = (dateStr: string) => {
  const date = new Date(dateStr);
  const day = date.getDate() + 1;
  const monthNames = [
    'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
  ];
  const weekdayNames = [
    'Domingo','Segunda-feira','Terça-feira','Quarta-feira',
    'Quinta-feira','Sexta-feira','Sábado'
  ];
  const month = monthNames[date.getMonth()];
  const weekday = weekdayNames[date.getDay() + 1];
  return `${day} de ${month} (${weekday})`;
};

const Step2Scheduling: React.FC<Step2Props> = ({ data, updateData, onNext, onBack }) => {
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-gray-700 text-center">2. Agendamento</h2>

      {/* Seleção da data */}
      <div className="text-center">
        <p className="text-gray-600 font-medium mb-4">Selecione o dia*</p>
        <div className="flex justify-center gap-6 flex-wrap">
          {AVAILABLE_DATES.map((date) => (
            <button
              key={date}
              onClick={() => updateData({ date })} // Corrigido: não reseta selectedTimes
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                data.date === date
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {formatDateForDisplay(date)}
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
                data.selectedTimes.preference === time
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
          disabled={!data.date || !data.selectedTimes.preference}
          className={`font-bold py-2 px-6 rounded-lg transition-colors ${
            !data.date || !data.selectedTimes.preference
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Próximo
        </button>
      </div>
    </div>
  );
};

export default Step2Scheduling;
