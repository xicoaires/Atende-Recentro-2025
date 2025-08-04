
import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-white border-t mt-12">
      <div className="container mx-auto px-4 py-6 text-center text-gray-500">
        <p>&copy; {currentYear} Atende Recentro. Todos os direitos reservados.</p>
        <p className="text-sm mt-1">Uma iniciativa para o desenvolvimento do centro do Recife.</p>
      </div>
    </footer>
  );
};

export default Footer;
