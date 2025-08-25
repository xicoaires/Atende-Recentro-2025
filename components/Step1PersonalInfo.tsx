import React, { useState } from 'react';
import { AppointmentData, ProfileType } from '../types';
import { PROFILE_OPTIONS } from '../constants';

interface Step1Props {
  data: AppointmentData;
  updateData: (data: Partial<AppointmentData>) => void;
  onNext: () => void;
}

const Step1PersonalInfo: React.FC<Step1Props> = ({ data, updateData, onNext }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!data.fullName.trim()) newErrors.fullName = 'Nome completo é obrigatório.';
    if (!data.email.trim()) {
      newErrors.email = 'E-mail é obrigatório.';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = 'Formato de e-mail inválido.';
    }
    if (!data.phone.trim()) newErrors.phone = 'Telefone é obrigatório.';
    if (!data.propertyAddress.trim()) newErrors.propertyAddress = 'Endereço do imóvel é obrigatório.';
    if (!data.lgpdConsent) newErrors.lgpdConsent = 'Você deve aceitar os termos.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextClick = () => {
    if (validate()) {
      onNext();
    }
  };

  const handleProfileChange = (profile: ProfileType) => {
    const newProfile = data.profile.includes(profile)
      ? data.profile.filter(p => p !== profile)
      : [...data.profile, profile];
    updateData({ profile: newProfile });
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-700">1. Seus Dados</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Nome completo*</label>
          <input type="text" id="fullName" value={data.fullName} onChange={e => updateData({ fullName: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
          {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail*</label>
          <input type="email" id="email" value={data.email} onChange={e => updateData({ email: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone*</label>
          <input type="tel" id="phone" placeholder="(99) 99999-9999" value={data.phone} onChange={e => updateData({ phone: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>
         <div>
          <label htmlFor="propertyAddress" className="block text-sm font-medium text-gray-700">Endereço do imóvel para atendimento*</label>
          <input type="text" id="propertyAddress" value={data.propertyAddress} onChange={e => updateData({ propertyAddress: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
          {errors.propertyAddress && <p className="text-red-500 text-xs mt-1">{errors.propertyAddress}</p>}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Perfil (pode marcar mais de uma opção)</label>
        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          {PROFILE_OPTIONS.map(option => (
            <div key={option} className="flex items-center">
              <input id={option} type="checkbox" checked={data.profile.includes(option)} onChange={() => handleProfileChange(option)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <label htmlFor={option} className="ml-2 block text-sm text-gray-900">{option}</label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="query" className="block text-sm font-medium text-gray-700">Dúvida ou Orientação (descrição breve)</label>
        <textarea id="query" rows={3} value={data.query} onChange={e => updateData({ query: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
      </div>

      <h3 className="text-lg font-semibold text-gray-700 pt-4 border-t">Dados Opcionais</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Nome da Empresa</label>
          <input type="text" id="companyName" value={data.companyName} onChange={e => updateData({ companyName: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">Cargo/Função</label>
          <input type="text" id="role" value={data.role} onChange={e => updateData({ role: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700">Endereço da Empresa</label>
          <input type="text" id="companyAddress" value={data.companyAddress} onChange={e => updateData({ companyAddress: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
        </div>
      </div>

      <div className="mt-6">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input id="lgpd" name="lgpd" type="checkbox" checked={data.lgpdConsent} onChange={e => updateData({ lgpdConsent: e.target.checked })} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="lgpd" className="font-medium text-gray-700">Consentimento (LGPD)*</label>
              <p className="text-gray-500">Autorizo o uso dos meus dados para fins de comunicação institucional do Recentro, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD).</p>
            </div>
          </div>
          {errors.lgpdConsent && <p className="text-red-500 text-xs mt-1">{errors.lgpdConsent}</p>}
        </div>

      <div className="flex justify-end mt-8">
        <button onClick={handleNextClick} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400">
          Próximo
        </button>
      </div>
    </div>
  );
};

export default Step1PersonalInfo;
