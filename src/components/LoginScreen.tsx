import React, { useState } from 'react';
import { UserRole } from '../types';
import { Lock, User, ChefHat, LayoutGrid, Settings } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (role: UserRole, username: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'Mesero' && password === '123') onLogin('WAITER', 'Mesero');
    else if (username === 'Cocinero' && password === '123') onLogin('COOK', 'Cocinero');
    else if (username === 'Admin' && password === '123') onLogin('ADMIN', 'Admin');
    else setError('Credenciales incorrectas');
  };

  // Función para demo rápida
  const quickLogin = (role: string) => {
    if (role === 'Mesero') { setUsername('Mesero'); setPassword('123'); onLogin('WAITER', 'Mesero'); }
    if (role === 'Cocina') { setUsername('Cocinero'); setPassword('123'); onLogin('COOK', 'Cocinero'); }
    if (role === 'Admin')  { setUsername('Admin'); setPassword('123'); onLogin('ADMIN', 'Admin'); }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-primary p-8 text-center">
          <h1 className="text-3xl font-bold text-white">El Refugio</h1>
          <p className="text-orange-100">Sistema de Restaurante</p>
        </div>
        
        <div className="p-8">
          {/* BOTONES DE ACCESO RÁPIDO (DEMO) */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <button onClick={() => quickLogin('Mesero')} className="flex flex-col items-center p-2 border rounded-lg hover:bg-orange-50 hover:border-orange-200 transition">
              <div className="bg-blue-100 p-2 rounded-full text-blue-600 mb-1"><LayoutGrid size={20}/></div>
              <span className="text-xs font-bold text-slate-600">Mesero</span>
            </button>
            <button onClick={() => quickLogin('Cocina')} className="flex flex-col items-center p-2 border rounded-lg hover:bg-orange-50 hover:border-orange-200 transition">
              <div className="bg-yellow-100 p-2 rounded-full text-yellow-600 mb-1"><ChefHat size={20}/></div>
              <span className="text-xs font-bold text-slate-600">Cocina</span>
            </button>
            <button onClick={() => quickLogin('Admin')} className="flex flex-col items-center p-2 border rounded-lg hover:bg-orange-50 hover:border-orange-200 transition">
              <div className="bg-slate-100 p-2 rounded-full text-slate-600 mb-1"><Settings size={20}/></div>
              <span className="text-xs font-bold text-slate-600">Admin</span>
            </button>
          </div>

          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-xs">O ingresa manualmente</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-400" size={18} />
              <input type="text" value={username} onChange={e=>setUsername(e.target.value)} className="w-full pl-10 p-3 border rounded-lg" placeholder="Usuario" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full pl-10 p-3 border rounded-lg" placeholder="Contraseña" />
            </div>
            {error && <p className="text-red-500 text-sm text-center font-bold">{error}</p>}
            <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition">Entrar</button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default LoginScreen;