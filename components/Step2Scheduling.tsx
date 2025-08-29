import React, { useEffect, useState } from 'react';
import { AppointmentData } from '../types';

interface Step2Props {
  data: AppointmentData;
  updateData: (data: Partial<AppointmentData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const AVAILABLE_DATES = ['2025-10-07', '2025-10-08'];

// Função para formatar a data para: 7 de Outubro (Terça-feira)
const formatDateForDisplay = (dateStr: string) => {
  const date = new Date(dateStr);
  const day = date.getDate();
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const weekdayNames = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
  const month = monthNames[date.getMonth()];
  const weekday = weekdayNames[date.getDay()];
  return `${day} de ${month} (${weekday})`;
};

interface Slot {
  time: string;
  total: number;
  available: number;
}

const Step2Scheduling: React.FC<Step2Props> = ({ data, updateData, onNext, onBack }) => {
  const [slotsByDate, setSlotsByDate] = useState<Record<string, Slot[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar slots para uma data específica
  const fetchSlots = async (date: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/.netlify/functions/get-available-slots?date=${date}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setSlotsByDate(prev => ({ ...prev, [date]: json.slots }));
      } else {
        setError(json.message || 'Erro ao carregar vagas');
      }
    } catch (err) {
      console.error('Erro ao carregar vagas:', err);
      setError('Erro ao carregar vagas');
    } finally {
      setLoading(false);
    }
  };

  // Buscar slots automaticamente quando a data muda
  useEffect(() => {
    if (data.date && !slotsByDate[data.date]) {
      fetchSlots(data.date);
    }
  }, [data.date]);

  const availableSlots = data.date ? slotsByDate[data.date] || [] : [];

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
              onClick={() => updateData({ date, selectedTimes: { preference: '' } })}
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

        {loading && <p>Carregando horários...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="flex justify-center flex-wrap gap-4">
          {availableSlots.map(slot => (
            <button
              key={slot.time}
              onClick={() => updateData({ selectedTimes: { preference: slot.time } })}
              disabled={slot.available === 0}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                data.selectedTimes.preference === slot.time
                  ? 'bg-blue-600 text-white shadow-md'
                  : slot.available === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {slot.time} ({slot.available} vagas restantes)
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
