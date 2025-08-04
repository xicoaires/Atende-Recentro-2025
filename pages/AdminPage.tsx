
import React, { useState, useMemo } from 'react';
import { useAppointments } from '../hooks/useAppointments';
import { Appointment, ServiceType } from '../types';
import { EVENT_DATES, TIME_SLOTS } from '../constants';
import { Download, Pencil, Trash } from '../components/Icons';

const AdminPage = () => {
  const { appointments, toggleCheckIn, deleteAppointment } = useAppointments();
  const [filterDay, setFilterDay] = useState('');
  const [filterTime, setFilterTime] = useState('');
  const [filterType, setFilterType] = useState('');

  const filteredAppointments = useMemo(() => {
    return appointments
      .filter(a => (filterDay ? a.visitDay === filterDay : true))
      .filter(a => (filterTime ? a.visitTime === filterTime : true))
      .filter(a => (filterType ? a.serviceType === filterType : true))
      .sort((a,b) => new Date(a.visitDay).getTime() - new Date(b.visitDay).getTime() || a.visitTime.localeCompare(b.visitTime));
  }, [appointments, filterDay, filterTime, filterType]);
  
  const exportToCSV = () => {
    const headers = [
        "ID", "Nome Completo", "Email", "Telefone", "CPF", "Interesse Principal", 
        "Endereço do Imóvel", "Tipo de Atendimento", "Órgão", "Dia", "Horário", "Presente"
    ];
    const rows = filteredAppointments.map(app => [
        app.id,
        `"${app.fullName}"`,
        `"${app.email}"`,
        `"${app.phone}"`,
        `"${app.cpf}"`,
        `"${app.mainInterest}"`,
        `"${app.propertyAddress}"`,
        app.serviceType,
        `"${app.station || 'N/A'}"`,
        app.visitDay,
        app.visitTime,
        app.checkedIn ? 'Sim' : 'Não'
    ].join(','));
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "agendamentos_atende_recentro.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };


  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Painel Administrativo</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie os agendamentos do evento. Total de {filteredAppointments.length} registros encontrados.
          </p>
        </div>
        <button
            onClick={exportToCSV}
            className="mt-4 sm:mt-0 inline-flex items-center gap-x-2 rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
            <Download className="h-5 w-5" />
            Exportar CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
          <div>
              <label htmlFor="filterDay" className="block text-sm font-medium text-gray-700">Filtrar por Dia</label>
              <select id="filterDay" value={filterDay} onChange={e => setFilterDay(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                  <option value="">Todos os Dias</option>
                  {EVENT_DATES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
          </div>
          <div>
              <label htmlFor="filterTime" className="block text-sm font-medium text-gray-700">Filtrar por Horário</label>
              <select id="filterTime" value={filterTime} onChange={e => setFilterTime(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                  <option value="">Todos os Horários</option>
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
          </div>
          <div>
              <label htmlFor="filterType" className="block text-sm font-medium text-gray-700">Filtrar por Tipo</label>
              <select id="filterType" value={filterType} onChange={e => setFilterType(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                  <option value="">Todos os Tipos</option>
                  <option value={ServiceType.GUIDED}>{ServiceType.GUIDED}</option>
                  <option value={ServiceType.DIRECT}>{ServiceType.DIRECT}</option>
              </select>
          </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome / Contato</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agendamento</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo / Órgão</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Presença</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAppointments.map(app => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{app.fullName}</div>
                  <div className="text-sm text-gray-500">{app.email}</div>
                  <div className="text-sm text-gray-500">{app.cpf}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{app.visitDay}</div>
                  <div className="text-sm text-gray-500">{app.visitTime}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${app.serviceType === ServiceType.GUIDED ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                    {app.serviceType}
                  </span>
                  {app.station && <div className="text-sm text-gray-500 mt-1 max-w-xs truncate">{app.station}</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input type="checkbox" className="h-5 w-5 text-blue-600 rounded cursor-pointer focus:ring-blue-500" checked={app.checkedIn} onChange={() => toggleCheckIn(app.id)} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button onClick={() => alert('Função de editar a ser implementada.')} className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"><Pencil className="h-5 w-5" /></button>
                    <button onClick={() => window.confirm('Tem certeza que deseja excluir este agendamento?') && deleteAppointment(app.id)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"><Trash className="h-5 w-5" /></button>
                  </div>
                </td>
              </tr>
            ))}
             {filteredAppointments.length === 0 && (
              <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-500">
                      Nenhum agendamento encontrado para os filtros selecionados.
                  </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPage;
