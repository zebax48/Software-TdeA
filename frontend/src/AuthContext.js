import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const savedAuth = localStorage.getItem('auth');
    return savedAuth ? JSON.parse(savedAuth) : {
      token: null, 
      username: null, 
      cc: null, 
      nombres: null, 
      apellidos: null, 
      celular: null, 
      correo: null, 
      role: null
    };
  });

  useEffect(() => {
    localStorage.setItem('auth', JSON.stringify(auth));
  }, [auth]);

  const login = async (credentials) => {
    try {
      const response = await axios.post('http://localhost:5000/api/users/login', credentials);
      const userData = {
        token: response.data.token,
        username: response.data.username,
        cc: response.data.cc,
        nombres: response.data.nombres,
        apellidos: response.data.apellidos,
        celular: response.data.celular,
        correo: response.data.correo,
        role: response.data.role
      };
      setAuth(userData);
      localStorage.setItem('auth', JSON.stringify(userData)); // Guardar en localStorage
      console.log('Datos almacenados:', userData);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      window.alert('Usuario o contraseña incorrecta');
    }
  };

  const logout = async () => {
    try {
      const { username, token } = auth;
      console.log('Usuario a cerrar sesión:', username, "Token:", token);
      await axios.get(`http://localhost:5000/api/users/logout/${username}`, {
        headers: {
          Authorization: auth.token,
        },
      });
      const emptyAuth = {
        token: null,
        username: null,
        cc: null,
        nombres: null,
        apellidos: null,
        celular: null,
        correo: null,
        role: null
      };
      setAuth(emptyAuth);
      localStorage.removeItem('auth');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };


  const register = async (credentials) => {
    try {
      const response = await axios.post('http://localhost:5000/api/users/register', credentials);
      const userData = {
        token: response.data.token,
        username: response.data.username,
        cc: response.data.cc,
        nombres: response.data.nombres,
        apellidos: response.data.apellidos,
        celular: response.data.celular,
        correo: response.data.correo,
        role: response.data.role
      };
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      window.alert('Ocurrió un error al registrar el usuario');
    }
  };

  const value = {
    auth,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};