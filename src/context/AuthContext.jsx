import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../services/api';
import { getToken, logout as clearToken, setToken } from '../services/auth';

const USER_KEY = 'exam_portal_user';

const AuthContext = createContext(null);

function readUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearUser() {
  localStorage.removeItem(USER_KEY);
}

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getToken());
  const [user, setUser] = useState(() => readUser());

  useEffect(() => {
    setTokenState(getToken());
    // Refresh user data (XP, etc.) from backend if we have a token
    if (getToken()) {
      apiFetch('/api/auth/me')
        .then(data => {
          if (data.user) {
            setUser(data.user);
            writeUser(data.user);
          }
        })
        .catch(err => {
          console.warn('Failed to refresh user', err);
          // If 401, maybe logout? For now just log.
        });
    }
  }, []);

  const isAuthed = !!token;
  const isAdmin = user?.role === 'admin';

  const auth = useMemo(
    () => ({
      token,
      user,
      isAuthed,
      isAdmin,
      async login(email, password) {
        const data = await apiFetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });
        setToken(data.token);
        writeUser(data.user);
        setTokenState(data.token);
        setUser(data.user);
        return data.user;
      },
      async register(name, email, password, department, college) {
        const data = await apiFetch('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password, department, college })
        });
        setToken(data.token);
        writeUser(data.user);
        setTokenState(data.token);
        setUser(data.user);
        return data.user;
      },
      logout() {
        clearToken();
        clearUser();
        setTokenState(null);
        setUser(null);
      }
    }),
    [token, user, isAuthed, isAdmin]
  );

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
