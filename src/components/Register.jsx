import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Auth.css'

const Register = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí luego se puede integrar la lógica real de registro
    navigate('/login');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Crear cuenta</h1>
          <p className="auth-subtitle">Regístrate para empezar a gestionar tus préstamos</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="name">Nombre completo</label>
            <input
              id="name"
              type="text"
              placeholder="Tu nombre"
              required
            />
          </div>

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
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>

          <button type="submit" className="auth-button">
            Registrarme
          </button>
        </form>

        <div className="auth-footer-text">
          <span>¿Ya tienes cuenta?</span>
          <Link to="/login" className="auth-link">
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;


