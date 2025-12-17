import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Auth.css';

const Login = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí luego se puede integrar la lógica real de autenticación
    navigate('/home');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Cobros</h1>
          <p className="auth-subtitle">Inicia sesión para gestionar tus préstamos</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              placeholder="tu@correo.com"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="Tu contraseña"
              required
            />
          </div>

          <button type="submit" className="auth-button">
            Iniciar sesión
          </button>
        </form>

        <div className="auth-footer-text">
          <span>¿No tienes cuenta?</span>
          <Link to="/register" className="auth-link">
            Crear una cuenta
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;


