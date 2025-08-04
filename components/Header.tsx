
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
        <Link to="/" className="text-2xl md:text-3xl font-bold text-blue-800 hover:text-blue-600 transition-colors">
          Atende Recentro
        </Link>
        {!isAdminPage && (
          <nav className="mt-4 md:mt-0">
            <ul className="flex space-x-4 md:space-x-6 text-lg">
              <li><Link to="/" className="text-gray-600 hover:text-blue-700 transition-colors">Agendamento</Link></li>
              <li><Link to="/lookup" className="text-gray-600 hover:text-blue-700 transition-colors">Consultar</Link></li>
              <li><Link to="/admin" className="text-gray-600 hover:text-blue-700 transition-colors">Admin</Link></li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
