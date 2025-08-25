
import React from 'react';

interface Step4Props {
  onReset: () => void;
  email: string;
}

const Step4Confirmation: React.FC<Step4Props> = ({ onReset, email }) => {
  return (
    <div className="text-center py-10">
      <div className="mx-auto w-20 h-20 flex items-center justify-center bg-green-100 rounded-full">
        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mt-6">Agendamento Confirmado!</h2>
      <p className="text-gray-600 mt-2">
        Sua solicitação de atendimento foi recebida com sucesso.
      </p>
      <p className="text-gray-600 mt-1">
        Enviamos um e-mail de confirmação para <span className="font-semibold text-gray-800">{email}</span> com todos os detalhes.
      </p>
      <div className="mt-8">
        <button
          onClick={onReset}
          className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Fazer Novo Agendamento
        </button>
      </div>
    </div>
  );
};

export default Step4Confirmation;
