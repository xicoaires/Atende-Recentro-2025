
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, id, error, ...props }) => {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-gray-700 font-medium mb-1">{label}</label>
      <input
        id={id}
        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all ${error ? 'border-red-500 ring-red-300' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default Input;
