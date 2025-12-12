import React, { useState } from 'react';
import { authService } from '../services/authService';
import { Wrench, ArrowRight, Monitor, User as UserIcon, Trash2 } from 'lucide-react';
import { User, UserRole } from '../types';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('MANAGER');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    setIsSubmitting(true);
    // Simulate API delay
    await new Promise(r => setTimeout(r, 600)); 
    
    const user = await authService.login(name, role);
    onLogin(user);
  };

  const handleGuestAccess = () => {
    onLogin({id: 'public', username: 'guest', name: 'Guest', role: 'CUSTOMER'});
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to clear all local demo data? This cannot be undone.')) {
        localStorage.clear();
        window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
            <div className="bg-blue-600 p-3 rounded-xl text-white mb-4 shadow-lg shadow-blue-200">
                <Wrench size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">AutoFlow Garage</h1>
            <p className="text-slate-500">Service Management System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
                <div className="relative">
                    <UserIcon size={18} className="absolute left-3 top-3 text-slate-400" />
                    <input 
                        type="text" 
                        required
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="e.g. John Doe"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Role</label>
                <select 
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={role}
                    onChange={e => setRole(e.target.value as UserRole)}
                >
                    <option value="MANAGER">Manager (Shop Overview)</option>
                    <option value="LEADER">Bay Leader (Mechanic)</option>
                    <option value="CUSTOMER">Customer (Booking)</option>
                </select>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-md mt-4"
            >
                {isSubmitting ? 'Signing in...' : <>Enter Dashboard <ArrowRight size={18} /></>}
            </button>
        </form>

        <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400">Or</span>
            </div>
        </div>

        <button
            onClick={handleGuestAccess}
            className="w-full bg-slate-50 border border-slate-200 text-slate-600 hover:bg-white hover:text-blue-600 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
        >
            <Monitor size={18} />
            View Public Board
        </button>

        <div className="mt-8 flex justify-center">
             <button onClick={handleResetData} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
                <Trash2 size={12} /> Reset Demo Data
             </button>
        </div>
      </div>
    </div>
  );
};

export default LoginView;