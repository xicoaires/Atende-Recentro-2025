import React, { useState } from 'react';
import { AppointmentData, ProfileType } from '../types';

interface Step1Props {
  data: AppointmentData;
  updateData: (data: Partial<AppointmentData>) => void;
  onNext: () => void;
}

const Step1PersonalInfo: React.FC<Step1Props> = ({ data, updateData, onNext }) => {
  const [otherProfile, setOtherProfile] = useState('');
  const [errors, setErrors] = useState<{ 
    fullName?: string; 
    email?: string; 
    phone?: string; 
    propertyAddress?: string; 
    lgpd?: string 
  }>({});

  const inputClass = "mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors";

  const handleProfileChange = (profile: string, checked: boolean) => {
    let updatedProfiles = [...data.profile];
    if (checked) {
      updatedProfiles.push(profile as ProfileType);
    } else {
      updatedProfiles = updatedProfiles.filter(p => p !== profile);
      if (profile === 'Outros') setOtherProfile('');
    }
    updateData({ profile: updatedProfiles });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/^(\d{2})(\d)/, '($1) $2');
    value = value.replace(/(\d{5})(\d{1,4})$/, '$1-$2');
    updateData({ phone: value });
  };

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!data.fullName || !data.fullName.trim()) {
      newErrors.fullName = 'Digite seu nome completo';
    }

    if (!data.propertyAddress || !data.propertyAddress.trim()) {
      newErrors.propertyAddress = 'Digite o endereço do imóvel';
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Digite um e-mail válido';
    }

    if (!data.phone || !/^\(\d{2}\) \d{5}-\d{4}$/.test(data.phone)) {
      newErrors.phone = 'Digite um telefone válido';
    }

    if (!data.lgpdConsent) {
      newErrors.lgpd = 'É necessário aceitar a LGPD';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (data.profile.includes('Outros') && !otherProfile.trim()) {
      alert('Por favor, descreva o perfil "Outros".');
      return;
    }
    if (validate()) onNext();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-700 text-center">1. Dados Pessoais</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-600 font-medium">Nome Completo*</label>
          <input
            type="text"
            value={data.fullName}
            onChange={e => updateData({ fullName: e.target.value })}
            className={inputClass}
          />
          {errors.fullName && <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>}
        </div>

        <div>
          <label className="block text-gray-600 font-medium">E-mail*</label>
          <input
            type="email"
            value={data.email}
            onChange={e => updateData({ email: e.target.value })}
            className={inputClass}
          />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-gray-600 font-medium">Telefone*</label>
          <input
            type="tel"
            value={data.phone}
            onChange={handlePhoneChange}
            placeholder="(XX) XXXXX-XXXX"
            className={inputClass}
          />
          {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-gray-600 font-medium">Endereço do Imóvel*</label>
          <input 
            type="text"
            value={data.propertyAddress}
            onChange={e => updateData({ propertyAddress: e.target.value })}
            className={inputClass}
          />
          {errors.propertyAddress && <p className="text-red-600 text-sm mt-1">{errors.propertyAddress}</p>}
        </div>
      </div>

      <div>
        <p className="font-medium text-gray-600">Perfil*</p>
        <div className="mt-2 space-y-2">
          {[ProfileType.Investor, ProfileType.Owner, ProfileType.Architect, ProfileType.Engineer, 'Funcionário Público', 'Outros'].map(profile => (
            <div key={profile} className="flex items-center">
              <input
                type="checkbox"
                checked={data.profile.includes(profile)}
                onChange={e => handleProfileChange(profile, e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label className="ml-2 text-gray-700">{profile}</label>
            </div>
          ))}

          {data.profile.includes('Outros') && (
            <input
              type="text"
              placeholder="Descreva seu perfil"
              value={otherProfile}
              onChange={e => {
                setOtherProfile(e.target.value);
                updateData({ profile: [...data.profile.filter(p => p !== 'Outros'), `Outros: ${e.target.value}`] });
              }}
              className={inputClass}
            />
          )}
        </div>
      </div>

      <div>
        <label className="block text-gray-600 font-medium">Descreva a sua motivação para o Atende Recentro 2025*</label>
        <textarea
          value={data.query}
          onChange={e => updateData({ query: e.target.value })}
          className={inputClass}
          rows={4}
        />
        <p className="text-gray-500 text-sm mt-1">
          * O imóvel será avaliado e a equipe do Recentro irá indicar quais órgãos você precisará passar e encaminhará os horários de atendimento.
        </p>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold text-gray-700">Dados Opcionais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
          <div>
            <label className="block text-gray-600 font-medium">Nome da Empresa</label>
            <input
              type="text"
              value={data.companyName || ''}
              onChange={e => updateData({ companyName: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-gray-600 font-medium">Cargo/Função</label>
            <input
              type="text"
              value={data.role || ''}
              onChange={e => updateData({ role: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-600 font-medium">Endereço da Empresa</label>
            <input
              type="text"
              value={data.companyAddress || ''}
              onChange={e => updateData({ companyAddress: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={data.lgpdConsent}
            onChange={e => updateData({ lgpdConsent: e.target.checked })}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <span className="ml-2 text-gray-700 text-sm">
            Autorizo o uso dos meus dados para fins de comunicação institucional do Recentro, em conformidade com a LGPD. *
          </span>
        </label>
        {errors.lgpd && <p className="text-red-600 text-sm mt-1">{errors.lgpd}</p>}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleNextStep}
          className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Próximo
        </button>
      </div>
    </div>
  );
};

export default Step1PersonalInfo;
