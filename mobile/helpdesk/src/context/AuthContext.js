import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [logged, setLogged] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('token');
      setLogged(!!token);
      setReady(true);
    })();
  }, []);

  if (!ready) return null;

  return (
    <AuthContext.Provider value={{ logged, setLogged }}>
      {children}
    </AuthContext.Provider>
  );
}
