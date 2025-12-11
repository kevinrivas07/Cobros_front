import React, { useState } from 'react';
import axios from 'axios';
import '../styles/LoanForm.css';

function formatNumber(num) {
  if (num === undefined || num === null || num === '') return '';
  const parts = num.toString().replace(/\D/g, '').split("");
  let result = "";
  let count = 0;
  for (let i = parts.length - 1; i >= 0; i--) {
    result = parts[i] + result;
    count++;
    if (count % 3 === 0 && i !== 0) {
      result = "." + result;
    }
  }
  return result;
}

function parseNumber(str) {
  if (!str) return '';
  return parseInt(str.replace(/\./g, '')) || '';
}

const LoanForm = ({ onAddLoan }) => {
  const [nombre, setNombre] = useState('');
  const [monto, setMonto] = useState('');
  const [cuotas, setCuotas] = useState('');
  const [frecuencia, setFrecuencia] = useState('mensual');

  const calcularFechaFinal = (fechaInicio, cuotas, frecuencia) => {
    const fecha = new Date(fechaInicio);
    const cantidadCuotas = parseInt(cuotas);

    switch (frecuencia) {
      case 'diario':
        fecha.setDate(fecha.getDate() + cantidadCuotas);
        break;
      case 'quincenal':
        fecha.setDate(fecha.getDate() + cantidadCuotas * 15);
        break;
      case 'mensual':
        fecha.setMonth(fecha.getMonth() + cantidadCuotas);
        break;
      default:
        break;
    }

    return fecha.toLocaleDateString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const montoNum = parseNumber(monto);
    const cantidadCuotas = parseInt(cuotas);

    // 🧮 Tasa base mensual: 15%
    const tasaMensual = 0.15;
    let tasaAplicada = tasaMensual;

    // Ajuste de la tasa según frecuencia
    switch (frecuencia) {
      case 'quincenal':
        tasaAplicada = tasaMensual / 2; // 7.5%
        break;
      case 'diario':
        tasaAplicada = tasaMensual / 30; // 0.5%
        break;
      case 'mensual':
      default:
        tasaAplicada = tasaMensual;
        break;
    }

    // 🧮 Calcular interés total
    const interes = Math.round(montoNum * tasaAplicada * cantidadCuotas);
    const total = montoNum + interes;
    const cuota = Math.ceil(total / cantidadCuotas);

    const fecha = new Date();
    const fechaInicio = fecha.toLocaleDateString();
    const fechaFinal = calcularFechaFinal(fecha, cuotas, frecuencia);

    const nuevoPrestamo = {
      nombre,
      monto: montoNum,
      interes,
      total,
      cuota,
      cuotas: cantidadCuotas,
      frecuencia,
      fecha: fechaInicio,
      fechaFinal,
      terminado: '',
      pagos: []
    };

    try {
      const res = await axios.post('https://cobros-back.vercel.app//api/loans', nuevoPrestamo);
      alert('Préstamo guardado exitosamente.');
      if (onAddLoan) onAddLoan(res.data);
    } catch (err) {
      console.error('Error al guardar préstamo:', err);
      alert('Error al guardar el préstamo');
    }

    // Limpiar inputs
    setNombre('');
    setMonto('');
    setCuotas('');
    setFrecuencia('mensual');
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="form">
        <h2 className="form-title">Registrar Nuevo Préstamo</h2>
        <div className="form-group">
          <label htmlFor="nombre" className="form-label">Nombre del cliente</label>
          <input
            id="nombre"
            type="text"
            placeholder="Ingrese nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="monto" className="form-label">Monto prestado</label>
          <input
            id="monto"
            type="text"
            placeholder="Ej: 1.000.000"
            value={monto}
            onChange={(e) => {
              const soloNumeros = e.target.value.replace(/\D/g, '');
              setMonto(formatNumber(soloNumeros));
            }}
            required
            className="form-input"
          />
        </div>
        
        <div className="form-row">
          <div className="form-group form-col">
            <label htmlFor="cuotas" className="form-label">Número de cuotas</label>
            <input
              id="cuotas"
              type="number"
              placeholder="Ej: 12"
              value={cuotas}
              onChange={(e) => setCuotas(e.target.value)}
              required
              className="form-input"
              min="1"
            />
          </div>
          
          <div className="form-group form-col">
            <label htmlFor="frecuencia" className="form-label">Frecuencia de pago</label>
            <select 
              id="frecuencia" 
              value={frecuencia} 
              onChange={(e) => setFrecuencia(e.target.value)} 
              required
              className="form-select"
            >
              <option value="diario">Diario</option>
              <option value="quincenal">Quincenal</option>
              <option value="mensual">Mensual</option>
            </select>
          </div>
        </div>
        
        <button type="submit" className="form-button">Registrar préstamo</button>
      </form>
    </div>
  );
};

export default LoanForm;