import React from 'react';
import { AppointmentData } from '../types';

interface Step3Props {
  data: AppointmentData;
  onBack: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const Step3Review: React.FC<Step3Props> = ({ data, onBack, onSubmit, isLoading }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-700 text-center">3. Revisão dos Dados</h2>

      <div className="bg-gray-50 p-6 rounded-lg shadow-sm space-y-4">
        <div>
          <p className="font-medium text-gray-600">Nome Completo:</p>
          <p className="text-gray-800">{data.fullName}</p>
        </div>

        <div>
          <p className="font-medium text-gray-600">Email:</p>
          <p className="text-gray-800">{data.email}</p>
        </div>

        {data.phone && (
          <div>
            <p className="font-medium text-gray-600">Telefone:</p>
            <p className="text-gray-800">{data.phone}</p>
          </div>
        )}

        <div>
          <p className="font-medium text-gray-600">Endereço do Imóvel:</p>
          <p className="text-gray-800">{data.propertyAddress}</p>
        </div>

        <div>
          <p className="font-medium text-gray-600">Perfil:</p>
          <p className="text-gray-800">{data.profile.join(', ')}</p>
        </div>

        {data.query && (
          <div>
            <p className="font-medium text-gray-600">Motivação para o Atende Recentro 2025:</p>
            <p className="text-gray-800">{data.query}</p>
          </div>
        )}

        {data.companyName && (
          <div>
            <p className="font-medium text-gray-600">Nome da Empresa:</p>
            <p className="text-gray-800">{data.companyName}</p>
          </div>
        )}

        {data.role && (
          <div>
            <p className="font-medium text-gray-600">Cargo/Função:</p>
            <p className="text-gray-800">{data.role}</p>
          </div>
        )}

        {data.companyAddress && (
          <div>
            <p className="font-medium text-gray-600">Endereço da Empresa:</p>
            <p className="text-gray-800">{data.companyAddress}</p>
          </div>
        )}

        <div>
          <p className="font-medium text-gray-600">Consentimento LGPD:</p>
          <p className="text-gray-800">{data.lgpdConsent ? 'Autorizado' : 'Não autorizado'}</p>
        </div>

        <div>
          <p className="font-medium text-gray-600">Data do Agendamento:</p>
          <p className="text-gray-800">{data.date.split('-').reverse().join('/')}</p>
        </div>

        {data.selectedTimes.preference && (
          <div>
            <p className="font-medium text-gray-600">Hora de Preferência:</p>
            <p className="text-gray-800">{data.selectedTimes.preference}</p>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={onBack}
          className="bg-gray-300 text-gray-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Voltar
        </button>

        <button
          onClick={onSubmit}
          disabled={isLoading}
          className={`font-bold py-2 px-6 rounded-lg transition-colors ${
            isLoading
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Enviando...' : 'Confirmar Agendamento'}
        </button>
      </div>
    </div>
  );
};

export default Step3Review;
