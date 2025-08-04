
import React from 'react';
import { HashRouter, Route, Routes, NavLink } from 'react-router-dom';
import { AppointmentProvider } from './hooks/useAppointments';
import BookingPage from './pages/BookingPage';
import ConfirmationPage from './pages/ConfirmationPage';
import CheckAppointmentPage from './pages/CheckAppointmentPage';
import AdminPage from './pages/AdminPage';
import { Calendar, User, ShieldCheck } from './components/Icons';

const Header = () => (
  <header className="bg-white shadow-md">
    <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-600 text-white p-2 rounded-lg">
          <Calendar className="h-6 w-6" />
        </div>
        <NavLink to="/" className="text-xl font-bold text-gray-800">
          Atende Recentro 2025
        </NavLink>
      </div>
      <div className="flex items-center space-x-4">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
              isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`
          }
        >
          <Calendar className="h-5 w-5" />
          <span>Agendar</span>
        </NavLink>
        <NavLink
          to="/consultar"
          className={({ isActive }) =>
            `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
              isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`
          }
        >
          <User className="h-5 w-5" />
          <span>Consultar</span>
        </NavLink>
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
              isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`
          }
        >
          <ShieldCheck className="h-5 w-5" />
          <span>Admin</span>
        </NavLink>
      </div>
    </nav>
  </header>
);

const Footer = () => (
    <footer className="bg-white mt-12 py-6">
        <div className="container mx-auto px-6 text-center text-gray-500">
            <p>&copy; 2025 Atende Recentro. Todos os direitos reservados.</p>
            <p className="text-sm mt-1">Local: CasaCor PE, Bairro do Recife</p>
        </div>
    </footer>
);


const App = () => {
  return (
    <AppointmentProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Header />
          <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<BookingPage />} />
              <Route path="/confirmacao" element={<ConfirmationPage />} />
              <Route path="/consultar" element={<CheckAppointmentPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </AppointmentProvider>
  );
};

export default App;
