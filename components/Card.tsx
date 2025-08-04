
import React, { ReactNode } from 'react';

interface CardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className }) => {
  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden w-full ${className}`}>
      <div className="bg-blue-700 p-4">
        <h2 className="text-2xl font-bold text-white text-center">{title}</h2>
      </div>
      <div className="p-6 md:p-8">
        {children}
      </div>
    </div>
  );
};

export default Card;
