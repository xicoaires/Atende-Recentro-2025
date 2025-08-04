
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  children: React.ReactNode;
  error?: string;
}

const Select: React.FC<SelectProps> = ({ label, id, children, error, ...props }) => {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-gray-700 font-medium mb-1">{label}</label>
      <select
        id={id}
        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 bg-white transition-all ${error ? 'border-red-500 ring-red-300' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default Select;
