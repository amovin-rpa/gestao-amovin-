import React, { useState } from 'react';
import { useStore } from '../store';
import { Eye, EyeOff, Shield, Users, Stethoscope } from 'lucide-react';
import { AMOVIN_LOGO_SRC } from '../assets/logo';

const DEFAULT_ADMIN_LOGIN = 'admin';
const DEFAULT_ADMIN_PASSWORD = 'amovin2026';

export default function Login() {
  const login = useStore((state) => state.login);
  const professionals = useStore((state) => state.professionals);
  const [activeTab, setActiveTab] = useState<'admin' | 'recepcao' | 'consulta'>('admin');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(activeTab === 'consulta' ? 'Por favor, insira seu login profissional.' : 'Por favor, insira seu nome.');
      return;
    }
    if (activeTab === 'admin') {
      if (!password.trim()) {
        setError('Informe a senha do administrador.');
        return;
      }

      const isDefaultAdmin = name.trim().toLowerCase() === DEFAULT_ADMIN_LOGIN && password === DEFAULT_ADMIN_PASSWORD;
      const adminProfessional = professionals.find(
        (prof) =>
          prof.login?.toLowerCase() === name.trim().toLowerCase() &&
          prof.password === password &&
          (prof.accessRole || 'consulta') === 'admin'
      );

      if (isDefaultAdmin) {
        login('admin', 'Administrador Amovin');
        return;
      }

      if (adminProfessional) {
        login('admin', adminProfessional.name, adminProfessional.specialty, adminProfessional.id);
        return;
      }

      setError('Login ou senha de administrador inválido.');
      return;
    }

    if (activeTab === 'consulta' || password.trim()) {
      if (!password.trim()) {
        setError('Por favor, insira sua senha.');
        return;
      }

      const professional = professionals.find(
        (prof) =>
          prof.login?.toLowerCase() === name.trim().toLowerCase() &&
          prof.password === password &&
          (prof.accessRole || 'consulta') === activeTab
      );

      if (!professional) {
        setError('Login, senha ou ambiente de acesso invalido. Confira o cadastro do profissional.');
        return;
      }

      login(professional.accessRole || 'consulta', professional.name, professional.specialty, professional.id);
      return;
    }
    
    login(activeTab, name);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <img src={AMOVIN_LOGO_SRC} alt="Logo Amovin" className="mx-auto h-28 w-auto object-contain" />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Gestao Amovin Integrado
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ficha de Registro do Beneficiário
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/90 py-8 px-4 shadow-2xl shadow-yellow-900/10 ring-1 ring-yellow-200 sm:rounded-2xl sm:px-10">
          
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex flex-col items-center p-3 rounded-lg ${activeTab === 'admin' ? 'bg-blue-100 text-blue-700 border-2 border-blue-500' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border-2 border-transparent'}`}
            >
              <Shield size={24} />
              <span className="text-xs mt-1 font-semibold">Administrador</span>
            </button>
            <button
              onClick={() => setActiveTab('recepcao')}
              className={`flex flex-col items-center p-3 rounded-lg ${activeTab === 'recepcao' ? 'bg-green-100 text-green-700 border-2 border-green-500' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border-2 border-transparent'}`}
            >
              <Users size={24} />
              <span className="text-xs mt-1 font-semibold">Recepção</span>
            </button>
            <button
              onClick={() => setActiveTab('consulta')}
              className={`flex flex-col items-center p-3 rounded-lg ${activeTab === 'consulta' ? 'bg-purple-100 text-purple-700 border-2 border-purple-500' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border-2 border-transparent'}`}
            >
              <Stethoscope size={24} />
              <span className="text-xs mt-1 font-semibold">Consulta</span>
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {activeTab === 'admin' ? 'Login do Administrador' : activeTab === 'consulta' ? 'Login do Profissional' : 'Seu Nome ou Login'}
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha {activeTab === 'recepcao' && <span className="text-xs font-normal text-gray-500">(opcional para acesso livre)</span>}
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required={activeTab === 'consulta' || activeTab === 'admin'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha cadastrada pelo administrador"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-900"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  {showPassword ? 'Ocultar senha' : 'Visualizar senha'}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Use o login e a senha definidos pelo administrador.
              </p>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-gray-950 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Entrar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}