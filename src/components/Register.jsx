import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Auth.css';

const Register = () => {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        { name, email, password }
      );

      alert('Usuario registrado correctamente');
      navigate('/login');

    } catch (error) {
      alert(error.response?.data?.message || 'Error al registrarse');
    }
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
            <label>Nombre completo</label>
            <input name="name" type="text" required />
          </div>

          <div className="auth-field">
            <label>Correo electrónico</label>
            <input name="email" type="email" required />
          </div>

          <div className="auth-field">
            <label>Contraseña</label>
            <input name="password" type="password" required />
          </div>

          <button type="submit" className="auth-button">
            Registrarme
          </button>
        </form>

        <div className="auth-footer-text">
          <span>¿Ya tienes cuenta?</span>
          <Link to="/login" className="auth-link">Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
