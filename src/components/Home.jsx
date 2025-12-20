import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoanForm from '../components/LoanForm';
import LoanList from '../components/LoanList';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPrestamos: 0,
    totalMonto: 0,
    totalInteres: 0,
    prestamosActivos: 0,
    prestamosTerminados: 0
  });

  useEffect(() => {
    const obtenerPrestamos = async () => {
      try {
        setLoading(true);
        const res = await axios.get('https://cobros-front-eta.vercel.app/api/loans');
        setLoans(res.data);
        calcularEstadisticas(res.data);
      } catch (error) {
        console.error('Error al cargar préstamos:', error);
      } finally {
        setLoading(false);
      }
    };

    obtenerPrestamos();
  }, []);

  // Actualizar estadísticas cuando cambie la lista de préstamos
  useEffect(() => {
    calcularEstadisticas(loans);
  }, [loans]);

  const calcularEstadisticas = (prestamos) => {
    const totalPrestamos = prestamos.length;
    const totalMonto = prestamos.reduce((sum, loan) => sum + loan.monto, 0);
    const totalInteres = prestamos.reduce((sum, loan) => sum + loan.interes, 0);
    const prestamosActivos = prestamos.filter(loan => !loan.terminado).length;
    const prestamosTerminados = prestamos.filter(loan => loan.terminado).length;

    setStats({
      totalPrestamos,
      totalMonto,
      totalInteres,
      prestamosActivos,
      prestamosTerminados
    });
  };

  const handleAddLoan = async () => {
    try {
      // Obtener la lista actualizada de préstamos después de agregar uno nuevo
      const res = await axios.get('https://cobros-front-eta.vercel.app/api/loans');
      setLoans(res.data);
      calcularEstadisticas(res.data);
    } catch (error) {
      console.error('Error al actualizar lista de préstamos:', error);
    }
  };

  const handleLogout = () => {
    // Aquí puedes agregar lógica adicional como limpiar tokens, etc.
    navigate('/login');
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
          <span className="logout-icon">🚪</span>
        </button>
        <h1 className="home-title">Gestión de Préstamos (15%)</h1>
        <p className="home-subtitle">Sistema de administración de préstamos personales</p>
      </header>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Préstamos</h3>
            <p className="stat-number">{stats.totalPrestamos}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Monto Total</h3>
            <p className="stat-number">${stats.totalMonto.toLocaleString('es-CO')}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <h3>Interés Total</h3>
            <p className="stat-number">${stats.totalInteres.toLocaleString('es-CO')}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Préstamos Activos</h3>
            <p className="stat-number">{stats.prestamosActivos}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🏁</div>
          <div className="stat-content">
            <h3>Préstamos Terminados</h3>
            <p className="stat-number">{stats.prestamosTerminados}</p>
          </div>
        </div>
      </div>

      <main className="home-main">
        <section className="form-section">
          <div className="section-header">
            <h2>Registrar Nuevo Préstamo</h2>
            <p>Complete el formulario para agregar un nuevo préstamo</p>
          </div>
          <div className="form-wrapper">
            <LoanForm onAddLoan={handleAddLoan} />
          </div>
        </section>

        <section className="list-section">
          <div className="section-header">
            <h2>Lista de Préstamos</h2>
            <p>Visualice y administre todos los préstamos registrados</p>
          </div>
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Cargando préstamos...</p>
            </div>
          ) : (
            <div className="list-wrapper">
              <LoanList 
                loans={loans} 
                onUpdateLoans={(newLoans) => {
                  setLoans(newLoans);
                  calcularEstadisticas(newLoans);
                }} 
              />
            </div>
          )}
        </section>
      </main>

      <footer className="home-footer">
        <p>Sistema de Gestión de Préstamos © {new Date().getFullYear()}</p>
        <p>Tasa de interés: 15% mensual</p>
      </footer>
    </div>
  );
};

export default Home;