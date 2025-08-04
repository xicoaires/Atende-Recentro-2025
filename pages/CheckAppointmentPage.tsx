
import React, { useState } from 'react';
import { useAppointments } from '../hooks/useAppointments';
import { Appointment } from '../types';
import { Search, XCircle } from '../components/Icons';

const AppointmentDetails = ({ appointment }: { appointment: Appointment }) => (
    <div className="mt-6 text-left bg-blue-50 p-6 rounded-lg border border-blue-200 animate-fade-in">
        <h3 className="text-xl font-semibold text-blue-800 mb-4">Seu Agendamento</h3>
        <div className="space-y-3 text-sm">
            <div className="flex justify-between">
                <span className="font-medium text-gray-600">Nome:</span>
                <span className="font-semibold text-gray-900">{appointment.fullName}</span>
            </div>
            <div className="flex justify-between">
                <span className="font-medium text-gray-600">Dia:</span>
                <span className="font-semibold text-gray-900">{appointment.visitDay}</span>
            </div>
            <div className="flex justify-between">
                <span className="font-medium text-gray-600">Horário:</span>
                <span className="font-semibold text-gray-900">{appointment.visitTime}</span>
            </div>
            <div className="flex justify-between">
                <span className="font-medium text-gray-600">Tipo:</span>
                <span className="font-semibold text-gray-900">{appointment.serviceType}</span>
            </div>
            {appointment.station && (
                <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Órgão:</span>
                    <span className="font-semibold text-gray-900 text-right">{appointment.station}</span>
                </div>
            )}
        </div>
    </div>
);

const CheckAppointmentPage = () => {
    const { findAppointment } = useAppointments();
    const [identifier, setIdentifier] = useState('');
    const [foundAppointment, setFoundAppointment] = useState<Appointment | null>(null);
    const [searched, setSearched] = useState(false);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const appointment = findAppointment(identifier);
        setFoundAppointment(appointment || null);
        setSearched(true);
    };

    return (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Consultar Agendamento</h1>
            <p className="text-gray-600 mb-6">Digite seu CPF ou e-mail para encontrar sua reserva.</p>

            <form onSubmit={handleSearch}>
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={identifier}
                        onChange={(e) => {
                            setIdentifier(e.target.value);
                            setSearched(false);
                            setFoundAppointment(null);
                        }}
                        placeholder="CPF ou E-mail"
                        required
                        className="flex-grow mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button type="submit" className="inline-flex items-center justify-center mt-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <Search className="h-5 w-5" />
                    </button>
                </div>
            </form>

            {searched && (
                foundAppointment ? (
                    <AppointmentDetails appointment={foundAppointment} />
                ) : (
                    <div className="mt-6 flex items-center space-x-3 bg-red-50 p-4 rounded-lg border border-red-200">
                        <XCircle className="h-6 w-6 text-red-500" />
                        <div>
                            <h3 className="text-md font-semibold text-red-800">Nenhum agendamento encontrado</h3>
                            <p className="text-sm text-red-700">Verifique o CPF ou e-mail digitado.</p>
                        </div>
                    </div>
                )
            )}
        </div>
    );
};

export default CheckAppointmentPage;
