import React, { useState, useEffect } from 'react';
import { authService } from './services/authService';
import { User } from './types';
import LoginView from './views/LoginView';
import ManagerDashboard from './views/ManagerDashboard';
import BayLeaderView from './views/BayLeaderView';
import CustomerView from './views/CustomerView';
import PublicView from './views/PublicView';
import NotificationSystem from './components/NotificationSystem';
import { LayoutDashboard, Users, Monitor, Wrench, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
        // 1. Check if we are returning from Authentik (Callback)
        if (authService.isCallback()) {
            try {
                const loggedInUser = await authService.handleCallback();
                if (loggedInUser) {
                    setUser(loggedInUser);
                    // Clear the code from URL for cleanliness
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            } catch (e) {
                console.error("Callback error", e);
            }
        } 
        // 2. Check if we already have a session
        else {
            const currentUser = await authService.getUser();
            if (currentUser) {
                setUser(currentUser);
            }
        }
        setIsLoading(false);
    };

    initAuth();
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    // If it's the public guest hack, just clear state
    if (user?.id === 'public') {
        setUser(null);
        return;
    }
    // Otherwise perform OIDC logout
    authService.logout();
    setUser(null);
  };

  if (isLoading) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
              <div className="loader mb-4"></div>
              <p className="text-slate-500 font-medium">Authenticating...</p>
          </div>
      );
  }

  if (!user) {
    return <LoginView onLogin={handleLogin} />;
  }

  // If user is the specific 'guest' for public view
  if (user.id === 'public') {
      return (
          <>
            <PublicView />
            <button 
                onClick={handleLogout}
                className="fixed top-4 right-4 bg-white text-slate-800 px-4 py-2 rounded-lg shadow-lg text-sm font-bold hover:bg-slate-100 z-50"
            >
                Exit Public View
            </button>
          </>
      )
  }

  const renderView = () => {
    switch (user.role) {
      case 'MANAGER':
        return <ManagerDashboard />;
      case 'LEADER':
        return <BayLeaderView user={user} />;
      case 'CUSTOMER':
        return <CustomerView user={user} />;
      default:
        // Fallback for unmapped roles
        return <CustomerView user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <NotificationSystem currentUser={user} />
      
      {/* Sidebar Navigation */}
      <aside className="bg-slate-900 text-slate-300 w-full md:w-64 flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Wrench size={20} />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">AutoFlow</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <div className="px-3 py-2 bg-slate-800 rounded-lg mb-6">
             <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Signed in as</p>
             <p className="font-bold text-white truncate">{user.name}</p>
             <p className="text-xs text-blue-400 font-mono mt-1">{user.role}</p>
          </div>
          
          {user.role === 'MANAGER' && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-900/50">
                <LayoutDashboard size={18} />
                <span>Manager Dashboard</span>
            </div>
          )}

          {user.role === 'LEADER' && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-900/50">
                <Users size={18} />
                <span>My Bay</span>
            </div>
          )}

           {(user.role === 'CUSTOMER' || user.role === undefined) && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-900/50">
                <Monitor size={18} />
                <span>My Service</span>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto h-screen relative">
        {renderView()}
      </main>
    </div>
  );
};

export default App;