import { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL as CENTRAL_API_BASE_URL } from '../config';

const AuthContext = createContext(null);

const API_BASE_URL = `${CENTRAL_API_BASE_URL}/auth`;

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('adminUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const savedToken = localStorage.getItem('adminToken');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/me`, {
          headers: {
            'Authorization': `Bearer ${savedToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem('adminUser', JSON.stringify(data.user));
          }
        } else {
          // Token invalid or expired
          logout();
        }
      } catch (err) {
        console.error('Auth verification error:', err);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Login failed. Please check your credentials.'
        };
      }

      // Save token and user details
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));

      return {
        success: true,
        user: data.user,
        message: data.message
      };
    } catch (err) {
      console.error('Login request error:', err);
      return {
        success: false,
        message: 'Unable to connect to authentication server. Please check backend.'
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  };

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        loading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
