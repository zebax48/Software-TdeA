import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Header from './HeaderI';
import Footer from './FooterI';
import './HeaderI.css';
import './FooterI.css';
import './Login.css';
import './App.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(credentials);
    navigate('/dashboard');
  };

  return (
    <div className="page-container">
      <Header />
      <div className="login-container">
        <div className="login-box">
          <img src="/assets/logoLogin.jpg" alt="Tecnológico de Antioquia" className="logo" />
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                placeholder="Nombre de usuario"
                className="input-field"
              />
              <span className="icon">&#128100;</span> {/* Ícono de usuario */}
            </div>
            <div className="input-group">
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="Contraseña"
                className="input-field"
              />
              <span className="icon">&#128274;</span> {/* Ícono de candado */}
            </div>
            <button type="submit" className="login-button">Ingresar</button>
          </form>
          <a href="/recover" className="recover-link">Recuperar contraseña</a>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default Login;