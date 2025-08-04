
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppointments } from '../hooks/useAppointments';
import { ServiceType } from '../types';
import { EVENT_DATES, STATIONS, TIME_SLOTS } from '../constants';
import { ChevronDown } from '../components/Icons';

const BookingPage = () => {
  const navigate = useNavigate();
  const { addAppointment, getAvailableSlots } = useAppointments();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    cpf: '',
    mainInterest: '',
    propertyAddress: '',
    serviceType: ServiceType.GUIDED,
    station: '',
    visitDay: EVENT_DATES[0],
    visitTime: '',
    termsAccepted: false,
  });

  const [availableSlots, setAvailableSlots] = useState(getAvailableSlots(formData.visitDay, formData.serviceType));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAvailableSlots(getAvailableSlots(formData.visitDay, formData.serviceType));
    setFormData(f => ({ ...f, visitTime: '' }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.visitDay, formData.serviceType]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!formData.termsAccepted) {
        setError('Você deve aceitar os termos de participação.');
        return;
    }
    if (formData.serviceType === ServiceType.DIRECT && !formData.station) {
        setError('Por favor, selecione o órgão desejado.');
        return;
    }
    if (!formData.visitTime) {
        setError('Por favor, selecione um horário.');
        return;
    }
    
    setLoading(true);
    try {
      const newAppointment = await addAppointment({
        ...formData,
        station: formData.serviceType === ServiceType.GUIDED ? undefined : formData.station,
      });
      navigate('/confirmacao', { state: { appointment: newAppointment } });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro desconhecido.');
      }
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Agende sua Visita</h1>
      <p className="text-gray-600 mb-8">Preencha o formulário para garantir sua vaga no Atende Recentro 2025.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Nome completo</label>
                <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
                <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone</label>
                <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="(81) 99999-9999" />
            </div>
            <div>
                <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">CPF</label>
                <input type="text" name="cpf" id="cpf" value={formData.cpf} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="000.000.000-00" />
            </div>
            <div className="md:col-span-2">
                <label htmlFor="mainInterest" className="block text-sm font-medium text-gray-700">Interesse principal</label>
                <textarea name="mainInterest" id="mainInterest" value={formData.mainInterest} onChange={handleInputChange} required rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="Ex: Isenção de IPTU, reforma, licenciamento, compra de imóvel, etc."></textarea>
            </div>
            <div className="md:col-span-2">
                <label htmlFor="propertyAddress" className="block text-sm font-medium text-gray-700">Endereço do imóvel de interesse no Centro</label>
                <input type="text" name="propertyAddress" id="propertyAddress" value={formData.propertyAddress} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
        </div>

        <fieldset className="space-y-4">
            <legend className="text-lg font-medium text-gray-900">Detalhes do Agendamento</legend>
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de atendimento</label>
                <div className="mt-2 flex space-x-4">
                    <label className="flex items-center">
                        <input type="radio" name="serviceType" value={ServiceType.GUIDED} checked={formData.serviceType === ServiceType.GUIDED} onChange={handleInputChange} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                        <span className="ml-2 text-sm text-gray-700">{ServiceType.GUIDED}</span>
                    </label>
                    <label className="flex items-center">
                        <input type="radio" name="serviceType" value={ServiceType.DIRECT} checked={formData.serviceType === ServiceType.DIRECT} onChange={handleInputChange} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                        <span className="ml-2 text-sm text-gray-700">{ServiceType.DIRECT}</span>
                    </label>
                </div>
            </div>

            {formData.serviceType === ServiceType.DIRECT && (
                <div>
                    <label htmlFor="station" className="block text-sm font-medium text-gray-700">Órgão desejado</label>
                    <div className="relative mt-1">
                        <select id="station" name="station" value={formData.station} onChange={handleInputChange} required className="appearance-none w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                            <option value="" disabled>Selecione um órgão</option>
                            {STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown className="h-5 w-5 text-gray-400 absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>
            )}

            <div>
                <label htmlFor="visitDay" className="block text-sm font-medium text-gray-700">Dia da visita</label>
                <div className="relative mt-1">
                    <select id="visitDay" name="visitDay" value={formData.visitDay} onChange={handleInputChange} className="appearance-none w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                        {EVENT_DATES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <ChevronDown className="h-5 w-5 text-gray-400 absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Horário disponível</label>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {availableSlots.map(slot => (
                        <label key={slot.time} className={`relative p-3 border rounded-md text-center cursor-pointer transition-all ${
                            formData.visitTime === slot.time ? 'bg-blue-600 border-blue-600 text-white' : 
                            slot.available ? 'bg-white border-gray-300 hover:border-blue-500' : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                        }`}>
                            <input type="radio" name="visitTime" value={slot.time} disabled={!slot.available} checked={formData.visitTime === slot.time} onChange={handleInputChange} className="sr-only" />
                            <span className="block text-sm font-semibold">{slot.time}</span>
                            <span className={`block text-xs mt-1 ${formData.visitTime === slot.time ? 'text-blue-100' : slot.available ? 'text-gray-500' : 'text-gray-400'}`}>
                                {slot.message}
                            </span>
                        </label>
                    ))}
                </div>
            </div>
        </fieldset>

        <div className="flex items-start">
            <div className="flex items-center h-5">
                <input id="termsAccepted" name="termsAccepted" type="checkbox" checked={formData.termsAccepted} onChange={handleInputChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
            </div>
            <div className="ml-3 text-sm">
                <label htmlFor="termsAccepted" className="font-medium text-gray-700">Aceito os termos de participação do evento.</label>
            </div>
        </div>

        <div>
            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed">
                {loading ? 'Agendando...' : 'Confirmar Agendamento'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default BookingPage;
