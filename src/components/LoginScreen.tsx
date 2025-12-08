import React, { useState } from 'react';
import { ChefHat, User, Lock } from 'lucide-react';
import type { UserRole } from '../types';

interface LoginScreenProps {
  onLogin: (role: UserRole, username: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Validaciones hardcodeadas (Simuladas)
    if (username === 'Mesero' && password === '123') {
        onLogin('WAITER', 'Mesero');
    } 
    // AQUÍ ESTABA EL ERROR: Cambiamos 'COOK' por 'KITCHEN'
    else if (username === 'Cocinero' && password === '123') {
        onLogin('KITCHEN', 'Cocinero'); 
    } 
    else if (username === 'Admin' && password === '123') {
        onLogin('ADMIN', 'Admin');
    } 
    else {
        setError('Credenciales incorrectas (Usa: Mesero/123, Cocinero/123, Admin/123)');
    }
  };

  // Función para demo rápida (Botones de abajo)
  const quickLogin = (roleLabel: string) => {
    if (roleLabel === 'Mesero') {
        onLogin('WAITER', 'Mesero');
    }
    // AQUÍ TAMBIÉN: Cambiamos 'COOK' por 'KITCHEN'
    if (roleLabel === 'Cocina') {
        onLogin('KITCHEN', 'Cocinero');
    }
    if (roleLabel === 'Admin') {
        onLogin('ADMIN', 'Admin');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Encabezado Naranja */}
        <div className="bg-orange-500 p-8 text-center">
          <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
            <ChefHat className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">El Refugio</h1>
          <p className="text-orange-100">Sistema de Restaurante</p>
        </div>

        {/* Formulario */}
        <div className="p-8">
          {/* Botones de Acceso Rápido */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <button onClick={() => quickLogin('Mesero')} className="flex flex-col items-center justify-center p-3 border rounded-xl hover:bg-orange-50 hover:border-orange-200 transition group">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition">
                    <LayoutGridIcon />
                </div>
                <span className="text-xs font-bold text-slate-600">Mesero</span>
            </button>
            <button onClick={() => quickLogin('Cocina')} className="flex flex-col items-center justify-center p-3 border rounded-xl hover:bg-orange-50 hover:border-orange-200 transition group">
                <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition">
                    <ChefHatIcon />
                </div>
                <span className="text-xs font-bold text-slate-600">Cocina</span>
            </button>
            <button onClick={() => quickLogin('Admin')} className="flex flex-col items-center justify-center p-3 border rounded-xl hover:bg-orange-50 hover:border-orange-200 transition group">
                <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition">
                    <SettingsIcon />
                </div>
                <span className="text-xs font-bold text-slate-600">Admin</span>
            </button>
          </div>

          <div className="relative flex items-center gap-4 mb-6">
             <div className="h-px bg-slate-200 flex-1"></div>
             <span className="text-xs text-slate-400 font-bold uppercase">O ingresa manualmente</span>
             <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
                <User className="absolute left-3 top-3.5 text-slate-400" size={20}/>
                <input 
                  type="text" 
                  placeholder="Usuario" 
                  className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-slate-400" size={20}/>
                <input 
                  type="password" 
                  placeholder="Contraseña" 
                  className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            
            {error && <div className="text-red-500 text-sm text-center font-bold bg-red-50 p-2 rounded">{error}</div>}

            <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg shadow-lg transition transform active:scale-95">
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Iconos auxiliares para no ensuciar los imports
const LayoutGridIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>;
const ChefHatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" x2="18" y1="17" y2="17"/></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;

export default LoginScreen;