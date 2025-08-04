
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ADMIN_CREDENTIALS } from '../constants';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

interface AdminLoginPageProps {
  setAuth: (isAuth: boolean) => void;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ setAuth }) => {
  const navigate = useNavigate();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login === ADMIN_CREDENTIALS.login && password === ADMIN_CREDENTIALS.password) {
      setAuth(true);
      navigate('/admin/dashboard');
    } else {
      setError('Credenciais inválidas. Tente novamente.');
      setAuth(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card title="Acesso Administrativo">
        <form onSubmit={handleLogin} className="space-y-6">
          <Input 
            id="login" 
            name="login" 
            label="Usuário"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required 
          />
          <Input 
            id="password" 
            name="password" 
            type="password"
            label="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          {error && <p className="text-red-500 text-center">{error}</p>}
          <Button type="submit">Entrar</Button>
        </form>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
