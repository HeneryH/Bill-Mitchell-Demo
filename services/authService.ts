import { User, UserRole } from '../types';

const STORAGE_KEY = 'autoflow_user';

class AuthService {
  
  /**
   * Mock login that saves user to local storage.
   * Replaces external OIDC provider for demo purposes.
   */
  async login(name: string, role: UserRole): Promise<User> {
    const user: User = {
        id: `user-${Date.now()}`,
        username: name.toLowerCase().replace(/\s/g, ''),
        name: name,
        role: role,
        assignedBayId: role === 'LEADER' ? 1 : undefined
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  }

  async logout(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
    // Reload page to clear app state
    window.location.reload(); 
  }

  async getUser(): Promise<User | null> {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    try {
        return JSON.parse(stored) as User;
    } catch (e) {
        return null;
    }
  }

  // --- Legacy Methods from previous OIDC implementation (kept for type safety if used elsewhere) ---
  isCallback(): boolean {
    return false;
  }

  async handleCallback(): Promise<User | null> {
    return null;
  }
}

export const authService = new AuthService();