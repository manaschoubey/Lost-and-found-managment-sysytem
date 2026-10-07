import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    const fullName = localStorage.getItem('fullName');
    const role = localStorage.getItem('role');

    if (token && email) {
      setUser({ token, email, fullName, role });
    }
    setLoading(false);
  }, []);

  const loginUser = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('email', data.email);
    localStorage.setItem('fullName', data.fullName);
    localStorage.setItem('role', data.role);
    setUser(data);
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('fullName');
    localStorage.removeItem('role');
    setUser(null);
  };

  const isAdmin = () => user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}
