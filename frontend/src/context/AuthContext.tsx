import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/authService';
import { useToast } from './ToastContext';
import { safeStorage } from '../utils/storageUtils';

export interface AuthContextValue {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  login: (identifier: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole, userId?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  registerStudent: (data: Partial<User>) => Promise<boolean>;
  registerTeacher: (data: any) => Promise<boolean>;
  registerLibraryOwner: (data: any) => Promise<boolean>;
  updateUserProfile: (data: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const refreshUser = useCallback(async () => {
    try {
      const u = await authService.getCurrentUser();
      setUser(u);
    } catch (e) {
      console.error('Failed to load user', e);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (identifier: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await authService.login(identifier, pass);
      if (res.success && res.user) {
        setUser(res.user);
        showToast(`Welcome back, ${res.user.name}!`, 'success');
        return true;
      } else {
        showToast(res.error || 'Authentication failed', 'error');
        return false;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const registerStudent = async (data: Partial<User>): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await authService.registerStudent(data);
      if (res.success && res.user) {
        setUser(res.user);
        showToast(`Account created! Welcome, ${res.user.name}!`, 'success');
        return true;
      } else {
        showToast(res.error || 'Registration failed', 'error');
        return false;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const registerTeacher = async (data: any): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await authService.registerTeacher(data);
      if (res.success) {
        const u = await authService.getCurrentUser();
        if (u) setUser(u);
        showToast('Teacher application submitted! Pending District Admin review.', 'success');
        return true;
      } else {
        showToast(res.error || 'Teacher registration failed', 'error');
        return false;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const registerLibraryOwner = async (data: any): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await authService.registerLibraryOwner(data);
      if (res.success) {
        const u = await authService.getCurrentUser();
        if (u) setUser(u);
        showToast('Library owner account registered! Status: Pending Approval.', 'success');
        return true;
      } else {
        showToast(res.error || 'Registration failed', 'error');
        return false;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    showToast('You have been logged out safely.', 'info');
  };

  const switchRole = async (targetRole: UserRole, targetUserId?: string) => {
    try {
      const switched = await authService.switchRole(targetRole, targetUserId);
      if (switched) {
        setUser(switched);
        showToast(`Switched active profile to: ${switched.name} (${targetRole})`, 'success');
      } else {
        showToast(`Could not switch role to ${targetRole}`, 'error');
      }
    } catch (err: any) {
      console.warn('Initial switchRole encountered error, attempting volatile cache purge & retry:', err);
      try {
        safeStorage.purgeVolatileCaches();
        const retried = await authService.switchRole(targetRole, targetUserId);
        if (retried) {
          setUser(retried);
          showToast(`Switched active profile to: ${retried.name} (${targetRole})`, 'success');
          return;
        }
      } catch (retryErr) {
        console.error('switchRole recovery failed:', retryErr);
      }
      showToast(`Error switching profile: ${err?.message || String(err)}`, 'error');
    }
  };

  const updateUserProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    setIsLoading(true);
    try {
      const res = await authService.updateUserProfile(user.id, data);
      if (res.success && res.user) {
        setUser(res.user);
        showToast('Profile details updated successfully!', 'success');
        return true;
      } else {
        showToast(res.error || 'Failed to update profile', 'error');
        return false;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        isLoading,
        loading: isLoading,
        login,
        logout,
        switchRole,
        refreshUser,
        registerStudent,
        registerTeacher,
        registerLibraryOwner,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
