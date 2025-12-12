import React, { useEffect, useState } from 'react';
import { garageService } from '../services/garageService';
import { AppNotification, User } from '../types';
import { X, Bell } from 'lucide-react';

interface NotificationSystemProps {
  currentUser: User | null;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ currentUser }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const unsubscribe = garageService.subscribe('notification', (data) => {
      const notif = data as AppNotification;
      
      // Filter logic: show if intended for everyone, or specifically for this role/user
      const isForMyRole = notif.recipientRole && notif.recipientRole === currentUser?.role;
      const isForMe = notif.recipientUserId && notif.recipientUserId === currentUser?.id;
      
      if (!notif.recipientRole && !notif.recipientUserId) {
         addNotification(notif);
      } else if (isForMyRole || isForMe) {
         addNotification(notif);
      }
    });

    return unsubscribe;
  }, [currentUser]);

  const addNotification = (notif: AppNotification) => {
    setNotifications(prev => [notif, ...prev]);
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      removeNotification(notif.id);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      {notifications.map(notif => (
        <div 
          key={notif.id}
          className={`
            p-4 rounded-lg shadow-lg border-l-4 flex justify-between items-start animate-slide-up
            ${notif.type === 'warning' ? 'bg-white border-amber-500 text-amber-900' : ''}
            ${notif.type === 'info' ? 'bg-white border-blue-500 text-slate-800' : ''}
            ${notif.type === 'success' ? 'bg-white border-green-500 text-slate-800' : ''}
          `}
        >
            <div className="flex gap-3">
                <Bell size={18} className="mt-1 opacity-70" />
                <div>
                    <p className="text-sm font-medium">{notif.message}</p>
                    <p className="text-xs opacity-60 mt-1">{new Date(notif.timestamp).toLocaleTimeString()}</p>
                </div>
            </div>
            <button onClick={() => removeNotification(notif.id)} className="opacity-50 hover:opacity-100">
                <X size={16} />
            </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;