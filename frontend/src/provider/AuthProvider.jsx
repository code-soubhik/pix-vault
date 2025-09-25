import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(undefined);

// Using localStorage for JWT token
const TOKEN_KEY = 'auth_token';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function hasToken() {
  return !!getToken();
}

export function AuthProvider({ children, onLogin, onLogout, onFetchUser }) {
  const [hasSession, setHasSession] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    const present = hasToken();
    setHasSession(present);
    if (present && typeof onFetchUser === 'function') {
      try {
        const fetchedUser = await onFetchUser();
        setUser(fetchedUser || null);
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [onFetchUser]);

  useEffect(() => {
    let canceled = false;
    (async () => {
      await refreshSession();
      if (!canceled) setLoading(false);
    })();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshSession();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      canceled = true;
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refreshSession]);

  const login = useCallback(async (...args) => {
    // Expect backend to set cookie via Set-Cookie. Ensure requests use credentials: 'include'.
    if (typeof onLogin === 'function') {
      await onLogin(...args);
    }
    await refreshSession();
  }, [onLogin, refreshSession]);

  const logout = useCallback(async (...args) => {
    if (typeof onLogout === 'function') {
      await onLogout(...args);
    }
    await refreshSession();
  }, [onLogout, refreshSession]);

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: hasSession,
    setUser,
    login,
    logout,
    refreshSession,
  }), [user, loading, hasSession, login, logout, refreshSession]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthProvider;


