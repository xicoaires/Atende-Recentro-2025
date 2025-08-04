
import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { Appointment } from '../types';
import Card from '../components/Card';

const CheckCircleIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ConfirmationPage: React.FC = () => {
  const location = useLocation();
  const appointment = location.state?.appointment as Appointment | undefined;

  if (!appointment) {
    return <Navigate to="/" />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card title="Agendamento Confirmado!">
        <div className="text-center">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800">Obrigado, {appointment.fullName}!</h3>
          <p className="text-gray-600 mt-2">Seu agendamento foi realizado com sucesso. Uma confirmação foi enviada para o seu e-mail.</p>
        </div>

        <div className="mt-8 border-t pt-6 space-y-4">
          <h4 className="text-lg font-semibold text-gray-700">Detalhes do Agendamento:</h4>
          <div className="text-gray-800 space-y-2">
            <p><strong>CPF:</strong> {appointment.cpf}</p>
            <p><strong>Endereço do Imóvel:</strong> {appointment.propertyAddress}</p>
            <p><strong>Data:</strong> {new Date(appointment.visitDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
            <p><strong>Horário:</strong> {appointment.timeslot}</p>
            <p><strong>Tipo:</strong> {appointment.attendanceType}</p>
            {appointment.agency && <p><strong>Órgão:</strong> {appointment.agency}</p>}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-md hover:bg-blue-700 transition-colors">
            Voltar ao Início
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ConfirmationPage;