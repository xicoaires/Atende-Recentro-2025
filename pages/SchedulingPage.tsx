
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppointments } from '../context/AppointmentContext';
import { Appointment, AttendanceType, Agency, TimeslotStatus } from '../types';
import { EVENT_DATES, TIMESLOTS, AGENCIES } from '../constants';
import Card from '../components/Card';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';

type FormData = Omit<Appointment, 'id' | 'present'>;
type FormErrors = Partial<Record<keyof FormData, string>>;

const SchedulingPage: React.FC = () => {
  const navigate = useNavigate();
  const { addAppointment, getTimeslotStatus, isDuplicate } = useAppointments();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    cpf: '',
    propertyAddress: '',
    mainInterest: '',
    attendanceType: AttendanceType.GUIDED,
    visitDate: EVENT_DATES[0],
    timeslot: '',
    termsAccepted: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [timeslotStatus, setTimeslotStatus] = useState<TimeslotStatus[]>([]);

  useEffect(() => {
    setTimeslotStatus(getTimeslotStatus(formData.visitDate));
    setFormData(f => ({ ...f, timeslot: '' })); // Reset timeslot on date change
  }, [formData.visitDate, getTimeslotStatus]);
  
  const validate = useCallback(() => {
    const newErrors: FormErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Nome completo é obrigatório.';
    if (!formData.email.trim()) newErrors.email = 'E-mail é obrigatório.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'E-mail inválido.';
    if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório.';
    if (!formData.cpf.trim()) newErrors.cpf = 'CPF é obrigatório.';
    else if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(formData.cpf)) newErrors.cpf = 'CPF inválido (use o formato XXX.XXX.XXX-XX).';
    if (!formData.propertyAddress.trim()) newErrors.propertyAddress = 'Endereço do imóvel é obrigatório.';
    if (!formData.mainInterest.trim()) newErrors.mainInterest = 'Interesse principal é obrigatório.';
    if (formData.attendanceType === AttendanceType.DIRECT && !formData.agency) newErrors.agency = 'Órgão é obrigatório.';
    if (!formData.visitDate) newErrors.visitDate = 'Data da visita é obrigatória.';
    if (!formData.timeslot) newErrors.timeslot = 'Horário é obrigatório.';
    if (!formData.termsAccepted) newErrors.termsAccepted = 'Você deve aceitar os termos.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .substring(0, 14);
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, cpf: formatCPF(e.target.value)}));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    
    if (isDuplicate(formData.cpf, formData.visitDate)) {
        setServerError('Este CPF já possui um agendamento para a data selecionada.');
        return;
    }

    setIsLoading(true);
    const result = await addAppointment(formData);
    setIsLoading(false);

    if (result.success && result.appointment) {
      navigate('/confirmation', { state: { appointment: result.appointment } });
    } else {
      setServerError(result.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card title="Agendamento de Visita - Atende Recentro">
        <p className="mb-6 text-gray-600">
          Preencha o formulário abaixo para garantir sua vaga no evento. O agendamento é individual.
          O evento ocorrerá no Local: CasaCor PE, Bairro do Recife.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input id="fullName" name="fullName" label="Nome Completo" value={formData.fullName} onChange={handleInputChange} error={errors.fullName} required />
          <div className="grid md:grid-cols-2 gap-6">
            <Input id="email" name="email" type="email" label="E-mail" value={formData.email} onChange={handleInputChange} error={errors.email} required />
            <Input id="phone" name="phone" type="tel" label="Telefone" value={formData.phone} onChange={handleInputChange} error={errors.phone} required />
          </div>
          <Input id="cpf" name="cpf" label="CPF (formato: XXX.XXX.XXX-XX)" value={formData.cpf} onChange={handleCpfChange} error={errors.cpf} required />
          <Input id="propertyAddress" name="propertyAddress" label="Endereço do Imóvel" value={formData.propertyAddress} onChange={handleInputChange} error={errors.propertyAddress} required />
          <Input id="mainInterest" name="mainInterest" label="Interesse Principal (ex: isenção IPTU, reforma)" value={formData.mainInterest} onChange={handleInputChange} error={errors.mainInterest} required />
          
          <div className="grid md:grid-cols-2 gap-6">
            <Select id="attendanceType" name="attendanceType" label="Tipo de Atendimento" value={formData.attendanceType} onChange={handleInputChange} error={errors.attendanceType}>
              <option value={AttendanceType.GUIDED}>Fluxo Guiado</option>
              <option value={AttendanceType.DIRECT}>Atendimento Direto</option>
            </Select>
            {formData.attendanceType === AttendanceType.DIRECT && (
              <Select id="agency" name="agency" label="Órgão Desejado" value={formData.agency || ''} onChange={handleInputChange} error={errors.agency}>
                <option value="" disabled>Selecione um órgão</option>
                {AGENCIES.map(agency => <option key={agency} value={agency}>{agency}</option>)}
              </Select>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Select id="visitDate" name="visitDate" label="Dia da Visita" value={formData.visitDate} onChange={handleInputChange} error={errors.visitDate}>
              {EVENT_DATES.map(date => <option key={date} value={date}>{new Date(date + 'T00:00:00').toLocaleDateString('pt-BR')}</option>)}
            </Select>
            <Select id="timeslot" name="timeslot" label="Horário Disponível" value={formData.timeslot} onChange={handleInputChange} error={errors.timeslot} required>
              <option value="" disabled>Selecione um horário</option>
              {timeslotStatus.map(slot => {
                  const isGuided = formData.attendanceType === AttendanceType.GUIDED;
                  const isDisabled = isGuided ? slot.guidedSoldOut : slot.directSoldOut;
                  const label = isDisabled ? `${slot.time} (Esgotado)` : `${slot.time} (${isGuided ? slot.guidedAvailable : slot.directAvailable} vagas)`;
                  return <option key={slot.time} value={slot.time} disabled={isDisabled}>{label}</option>
              })}
            </Select>
          </div>

          <div className="flex items-start">
            <input id="termsAccepted" name="termsAccepted" type="checkbox" checked={formData.termsAccepted} onChange={handleInputChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1" />
            <label htmlFor="termsAccepted" className="ml-2 block text-sm text-gray-900">
              Eu aceito os termos de participação do evento.
            </label>
            {errors.termsAccepted && <p className="text-red-500 text-sm ml-2">{errors.termsAccepted}</p>}
          </div>

          {serverError && <p className="text-red-600 bg-red-100 p-3 rounded-md text-center">{serverError}</p>}
          
          <Button type="submit" isLoading={isLoading} disabled={isLoading}>
            Confirmar Agendamento
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default SchedulingPage;