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
    const interes = Math.round(montoNum * 0.15);
    const total = montoNum + interes;
    const fecha = new Date();
    const fechaInicio = fecha.toLocaleDateString();
    const fechaFinal = calcularFechaFinal(fecha, cuotas, frecuencia);

    const nuevoPrestamo = {
      nombre,
      monto: montoNum,
      interes,
      total,
      cuotas: parseInt(cuotas),
      frecuencia,
      fecha: fechaInicio,
      fechaFinal,
      terminado: '',
      pagos: []
    };

    try {
      const res = await axios.post('http://localhost:4000/api/loans', nuevoPrestamo);
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
    <form onSubmit={handleSubmit} className="form">
      <input
        type="text"
        placeholder="Nombre del cliente"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Monto prestado"
        value={monto}
        onChange={e => {
          const soloNumeros = e.target.value.replace(/\D/g, '');
          setMonto(formatNumber(soloNumeros));
        }}
        required
      />
      <input
        type="number"
        placeholder="Número de cuotas"
        value={cuotas}
        onChange={(e) => setCuotas(e.target.value)}
        required
      />
      <select value={frecuencia} onChange={(e) => setFrecuencia(e.target.value)} required>
        <option value="diario">Diario</option>
        <option value="quincenal">Quincenal</option>
        <option value="mensual">Mensual</option>
      </select>
      <button type="submit">Registrar préstamo</button>
    </form>
  );
};

export default LoanForm;
