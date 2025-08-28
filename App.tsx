import React, { useState, useCallback } from 'react';
import { AppointmentData } from './types';
import { AGENCIES, EVENT_DATES } from './constants';
import { submitAppointment } from './services/schedulingService';

import Stepper from './components/Stepper';
import Step1PersonalInfo from './components/Step1PersonalInfo';
import Step2Scheduling from './components/Step2Scheduling';
import Step3Review from './components/Step3Review';
import Step4Confirmation from './components/Step4Confirmation';

const initialFormData: AppointmentData = {
  fullName: '',
  email: '',
  phone: '',
  propertyAddress: '',
  profile: [],
  query: '',
  companyName: '',
  role: '',
  companyAddress: '',
  lgpdConsent: false,
  agencies: [],
  date: EVENT_DATES[0],
  selectedTimes: {},
};

function App() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<AppointmentData>(initialFormData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateFormData = useCallback((data: Partial<AppointmentData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  const handleNext = () => setCurrentStep(prev => prev + 1);
  const handleBack = () => setCurrentStep(prev => prev - 1);
  const handleReset = () => {
    setFormData(initialFormData);
    setCurrentStep(1);
    setError(null);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    console.log('Dados enviados para submit:', formData);

    try {
      const response = await submitAppointment(formData);
      console.log('Resposta do submit:', response);

      if (response.success) {
        handleNext();
      } else {
        setError(response.message || 'Erro de validação');
      }
    } catch (e) {
      console.error('Erro inesperado no submit:', e);
      setError('Ocorreu um erro inesperado. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = ['Dados Pessoais', 'Agendamento', 'Revisão', 'Confirmação'];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl w-full">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">📌 Atende Recentro 2025</h1>
          <p className="text-gray-600 mt-2">Agendamento de Atendimento</p>
          <p className="text-sm text-gray-500">7 e 8 de Outubro de 2025 | Complexo Niágara S.A</p>
        </header>

        <Stepper steps={steps} currentStep={currentStep} />

        <main className="mt-8">
          {error && currentStep === 3 && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-6"
              role="alert"
            >
              <strong className="font-bold">Erro!</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
          )}

          {currentStep === 1 && (
            <Step1PersonalInfo data={formData} updateData={updateFormData} onNext={handleNext} />
          )}
          {currentStep === 2 && (
            <Step2Scheduling
              data={formData}
              updateData={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 3 && (
            <Step3Review
              data={formData}
              onBack={handleBack}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          )}
          {currentStep === 4 && <Step4Confirmation onReset={handleReset} email={formData.email} />}
        </main>
      </div>
    </div>
  );
}

export default App;
