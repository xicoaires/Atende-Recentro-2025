
import React, { useState } from 'react';
import { useAppointments } from '../context/AppointmentContext';
import { Appointment } from '../types';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const LookupPage: React.FC = () => {
  const { findAppointment } = useAppointments();
  const [identifier, setIdentifier] = useState('');
  const [foundAppointment, setFoundAppointment] = useState<Appointment | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFoundAppointment(undefined); // Reset previous search
    setTimeout(() => { // Simulate search delay
        const result = findAppointment(identifier);
        setFoundAppointment(result || null); // null indicates not found
        setIsLoading(false);
    }, 500);
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <Card title="Consultar Agendamento">
        <p className="mb-6 text-gray-600">
          Digite seu CPF ou e-mail utilizado no agendamento para consultar os detalhes.
        </p>
        <form onSubmit={handleSearch} className="space-y-4">
          <Input 
            id="identifier"
            name="identifier"
            label="CPF ou E-mail"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
          <Button type="submit" isLoading={isLoading} disabled={isLoading}>
            Consultar
          </Button>
        </form>

        {foundAppointment !== undefined && (
          <div className="mt-8 border-t pt-6">
            {foundAppointment ? (
              <div>
                <h4 className="text-lg font-semibold text-gray-700">Detalhes do seu Agendamento:</h4>
                 <div className="mt-4 bg-gray-50 p-4 rounded-lg space-y-2 text-gray-800">
                    <p><strong>Nome:</strong> {foundAppointment.fullName}</p>
                    <p><strong>CPF:</strong> {foundAppointment.cpf}</p>
                    <p><strong>Endereço do Imóvel:</strong> {foundAppointment.propertyAddress}</p>
                    <p><strong>Data:</strong> {new Date(foundAppointment.visitDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                    <p><strong>Horário:</strong> {foundAppointment.timeslot}</p>
                    <p><strong>Tipo:</strong> {foundAppointment.attendanceType}</p>
                    {foundAppointment.agency && <p><strong>Órgão:</strong> {foundAppointment.agency}</p>}
                </div>
              </div>
            ) : (
              <div className="text-center text-red-600 bg-red-50 p-4 rounded-md">
                Nenhum agendamento encontrado para o CPF ou e-mail informado.
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default LookupPage;