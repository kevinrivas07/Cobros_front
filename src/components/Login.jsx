import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from 'axios';
import '../styles/Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState(""); // <-- faltaba este estado

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const passwordInput = e.target.password.value;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        { email, password: passwordInput }
      );

      localStorage.setItem('token', res.data.token);
      navigate('/home');

    } catch (error) {
      alert(error.response?.data?.message || 'Credenciales incorrectas');
    }
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
              name="email"
              type="email"
              placeholder="tu@correo.com"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Contraseña:</label>

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}  // <-- ahora sí existe
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
              />

              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <button type="submit" className="auth-button">
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
