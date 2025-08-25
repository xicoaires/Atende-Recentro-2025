
import React from 'react';

interface StepperProps {
  steps: string[];
  currentStep: number;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex justify-center items-center w-full">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        const isCompleted = currentStep > stepNumber;

        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold transition-colors duration-300 ${
                  isActive ? 'bg-blue-600' : isCompleted ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                {isCompleted ? '✓' : stepNumber}
              </div>
              <p className={`mt-2 text-sm text-center font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>{step}</p>
            </div>
            {stepNumber < steps.length && (
              <div className={`flex-auto border-t-2 transition-colors duration-300 mx-4 ${isCompleted ? 'border-green-500' : 'border-gray-300'}`}></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Stepper;
