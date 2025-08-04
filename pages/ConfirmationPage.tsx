
import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { Appointment } from '../types';
import { CheckCircle } from '../components/Icons';

const ConfirmationPage = () => {
  const location = useLocation();
  const state = location.state as { appointment: Appointment };

  if (!state || !state.appointment) {
    return <Navigate to="/" replace />;
  }

  const { appointment } = state;

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800">Agendamento Confirmado!</h1>
        <p className="mt-2 text-gray-600">
          Obrigado, {appointment.fullName}. Sua visita está agendada.
        </p>
        <p className="text-sm text-gray-500 mt-2">
            Enviamos uma confirmação para o seu e-mail: {appointment.email}
        </p>
        
        <div className="mt-8 text-left bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Resumo do Agendamento</h2>
          <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">Dia:</span>
                <span className="font-semibold text-gray-900">{appointment.visitDay}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">Horário:</span>
                <span className="font-semibold text-gray-900">{appointment.visitTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">Tipo:</span>
                <span className="font-semibold text-gray-900">{appointment.serviceType}</span>
              </div>
              {appointment.station && (
                <div className="flex justify-between">
                    <span className="font-medium text-gray-500">Órgão:</span>
                    <span className="font-semibold text-gray-900 text-right">{appointment.station}</span>
                </div>
              )}
               <div className="flex justify-between">
                <span className="font-medium text-gray-500">CPF:</span>
                <span className="font-semibold text-gray-900">{appointment.cpf}</span>
              </div>
          </div>
        </div>

        <Link to="/" className="mt-8 inline-block w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Fazer Novo Agendamento
        </Link>
      </div>
    </div>
  );
};

export default ConfirmationPage;
