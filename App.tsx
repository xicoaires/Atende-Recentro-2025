
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppointmentProvider } from './context/AppointmentContext';
import Header from './components/Header';
import Footer from './components/Footer';
import SchedulingPage from './pages/SchedulingPage';
import ConfirmationPage from './pages/ConfirmationPage';
import LookupPage from './pages/LookupPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

const App: React.FC = () => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  return (
    <AppointmentProvider>
      <HashRouter>
        <div className="flex flex-col min-h-screen font-sans text-gray-800">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<SchedulingPage />} />
              <Route path="/confirmation" element={<ConfirmationPage />} />
              <Route path="/lookup" element={<LookupPage />} />
              <Route 
                path="/admin" 
                element={<AdminLoginPage setAuth={setIsAdminAuthenticated} />} 
              />
              <Route 
                path="/admin/dashboard"
                element={isAdminAuthenticated ? <AdminDashboardPage /> : <Navigate to="/admin" />}
              />
               <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </AppointmentProvider>
  );
}

export default App;
