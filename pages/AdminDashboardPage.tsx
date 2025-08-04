
import React, { useState } from 'react';
import { useAppointments } from '../context/AppointmentContext';
import { Appointment } from '../types';

const EditIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const DeleteIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const ExportIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

const AdminDashboardPage: React.FC = () => {
  const { appointments, deleteAppointment, markAsPresent } = useAppointments();
  const [filter, setFilter] = useState('');

  const filteredAppointments = appointments.filter(a => 
    a.fullName.toLowerCase().includes(filter.toLowerCase()) ||
    a.cpf.includes(filter) ||
    a.email.toLowerCase().includes(filter.toLowerCase())
  ).sort((a,b) => new Date(a.visitDate + 'T' + a.timeslot.split('-')[0]).getTime() - new Date(b.visitDate + 'T' + b.timeslot.split('-')[0]).getTime());

  const exportToCSV = () => {
    const headers = ['ID', 'Nome Completo', 'Email', 'Telefone', 'CPF', 'Endereço do Imóvel', 'Interesse', 'Tipo Atendimento', 'Orgao', 'Data', 'Horario', 'Presente'];
    const rows = filteredAppointments.map(a => [
      a.id,
      `"${a.fullName}"`,
      a.email,
      a.phone,
      a.cpf,
      `"${a.propertyAddress}"`,
      `"${a.mainInterest}"`,
      a.attendanceType,
      a.agency || '',
      a.visitDate,
      a.timeslot,
      a.present ? 'SIM' : 'NAO'
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "agendamentos_atende_recentro.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Note: Edit functionality is complex for a mock setup.
  // We'll provide a placeholder alert.
  const handleEdit = (appointment: Appointment) => {
    alert(`Funcionalidade de edição para ${appointment.fullName}. Em uma aplicação real, abriria um modal de formulário pré-preenchido.`);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o agendamento de ${name}?`)) {
      deleteAppointment(id);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-blue-800">Painel Administrativo</h1>
        <div className="flex items-center gap-4 w-full md:w-auto">
            <input 
              type="text"
              placeholder="Filtrar por nome, CPF, e-mail..."
              className="w-full md:w-64 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            />
            <button onClick={exportToCSV} className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
              <ExportIcon className="w-5 h-5" />
              <span>Exportar</span>
            </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left table-auto">
          <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">CPF</th>
              <th className="p-3">Data/Hora</th>
              <th className="p-3">Tipo</th>
              <th className="p-3 text-center">Presente</th>
              <th className="p-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {filteredAppointments.map(app => (
              <tr key={app.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{app.fullName}</td>
                <td className="p-3">{app.cpf}</td>
                <td className="p-3">{new Date(app.visitDate + 'T00:00:00').toLocaleDateString('pt-BR')} - {app.timeslot}</td>
                <td className="p-3">{app.attendanceType}{app.agency ? ` (${app.agency})` : ''}</td>
                <td className="p-3 text-center">
                  <button onClick={() => markAsPresent(app.id)} className={`p-1 rounded-full ${app.present ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                    <CheckIcon className="w-5 h-5" />
                  </button>
                </td>
                <td className="p-3 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <button onClick={() => handleEdit(app)} className="text-blue-600 hover:text-blue-800 p-1"><EditIcon className="w-5 h-5" /></button>
                    <button onClick={() => handleDelete(app.id, app.fullName)} className="text-red-600 hover:text-red-800 p-1"><DeleteIcon className="w-5 h-5" /></button>
                  </div>
                </td>
              </tr>
            ))}
             {filteredAppointments.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-6 text-gray-500">Nenhum agendamento encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboardPage;