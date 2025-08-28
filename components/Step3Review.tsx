import React from 'react';
import { AppointmentData } from '../types';

interface Step3Props {
  data: AppointmentData;
  onBack: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const ReviewItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <h4 className="text-sm font-medium text-gray-500">{label}</h4>
    <p className="text-gray-800 font-semibold">{value || 'Não informado'}</p>
  </div>
);

const Step3Review: React.FC<Step3Props> = ({ data, onBack, onSubmit, isLoading }) => {
  if (!data) return null; // evita erro se data estiver undefined

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-gray-700">3. Revise suas Informações</h2>

      <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Dados Pessoais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <ReviewItem label="Nome Completo" value={data.fullName || 'Não informado'} />
          <ReviewItem label="E-mail" value={data.email || 'Não informado'} />
          <ReviewItem label="Telefone" value={data.phone || 'Não informado'} />
          <ReviewItem label="Endereço do Imóvel" value={data.propertyAddress || 'Não informado'} />
        </div>

        {data.profile?.length > 0 && (
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Perfil</h3>
            <p className="text-gray-800 font-semibold mt-2">{data.profile.join(', ')}</p>
          </div>
        )}

        {data.profile?.includes('Pessoa Jurídica') && (
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Dados da Empresa</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-2">
              <ReviewItem label="Nome da Empresa" value={data.companyName || 'Não informado'} />
              <ReviewItem label="Cargo" value={data.role || 'Não informado'} />
              <ReviewItem label="Endereço da Empresa" value={data.companyAddress || 'Não informado'} />
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-200">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Detalhes do Agendamento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-2">
            <ReviewItem
              label="Data"
              value={
                data.date
                  ? new Date(data.date + 'T00:00:00').toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Não informado'
              }
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Órgãos e Horários</h3>
          <div className="mt-2">
            <ul className="list-disc list-inside space-y-1 text-gray-800">
              {data.agencies?.map((agency) => (
                <li key={agency}>
                  {agency} -{' '}
                  <span className="font-semibold">{data.selectedTimes?.[agency] || 'Horário não selecionado'}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
        >
          Voltar
        </button>
        <button
          onClick={onSubmit}
          disabled={isLoading}
          className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:bg-green-400"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Confirmando...
            </>
          ) : (
            'Confirmar Agendamento'
          )}
        </button>
      </div>
    </div>
  );
};

export default Step3Review;
