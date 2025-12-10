import React, { useState } from 'react';
import axios from 'axios';
import '../styles/LoanList.css';

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

const LoanList = ({ loans, onUpdateLoans }) => {
  const [nuevoPago, setNuevoPago] = useState({});

  const totalPagado = (pagos) => pagos.reduce((acc, pago) => acc + (pago.abono || 0), 0);
  const totalIntereses = (pagos) => pagos.reduce((acc, pago) => acc + (pago.interes || 0), 0);

  const calcularCuota = (loan) => {
    if (!loan.cuotas || loan.cuotas === 0) return 0;
    return Math.ceil(loan.total / loan.cuotas);
  };

  const handlePagoChange = (index, field, value) => {
    const soloNumeros = value.replace(/\D/g, '');
    setNuevoPago({
      ...nuevoPago,
      [index]: {
        ...nuevoPago[index],
        [field]: formatNumber(soloNumeros)
      }
    });
  };

  const handleAgregarPago = async (index) => {
    const pago = nuevoPago[index] || {};
    const total = parseNumber(pago.total);
    const interes = pago.interes ? parseNumber(pago.interes) : 0;
    const abono = pago.abono ? parseNumber(pago.abono) : 0;

    if (!total || total <= 0) return;
    if ((interes < 0 || abono < 0) || (interes + abono !== total) || (interes === 0 && abono === 0)) return;

    const fecha = new Date().toLocaleDateString();
    const id = loans[index]._id;

    try {
      await axios.post(`http://cobros-back.vercel.app/api/loans/${id}/payments`, {
        total,
        interes,
        abono,
        fecha
      });

      const res = await axios.get('http://cobros-back.vercel.app/api/loans');
      onUpdateLoans(res.data);
      setNuevoPago({ ...nuevoPago, [index]: {} });
    } catch (err) {
      console.error('Error al agregar pago:', err);
    }
  };

  const handleGuardarTerminado = async (index) => {
    const id = loans[index]._id;
    try {
      await axios.patch(`http://cobros-back.vercel.app/api/loans/${id}/terminar`, {
        terminado: 'Terminado'
      });

      const res = await axios.get('http://cobros-back.vercel.app/api/loans');
      onUpdateLoans(res.data);
    } catch (err) {
      console.error('Error al marcar como terminado:', err);
    }
  };

  return (
    <div className="loan-list">
      <h2>Préstamos Registrados</h2>
      <div className="loan-list-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Monto</th>
              <th>Interés</th>
              <th>Total</th>
              <th>Cuotas</th>
              <th>Frecuencia</th>
              <th>Cuota</th>
              <th>Fecha inicio</th>
              <th>Fecha final</th>
              <th>Pagos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan, index) => {
              const pagado = totalPagado(loan.pagos);
              const estaPagado = pagado >= loan.total;

              return (
                <tr key={index}>
                  <td>{loan.nombre}</td>
                  <td>${loan.monto.toLocaleString('es-CO')}</td>
                  <td>${loan.interes.toLocaleString('es-CO')}</td>
                  <td>${loan.total.toLocaleString('es-CO')}</td>
                  <td>{loan.cuotas}</td>
                  <td>{loan.frecuencia.charAt(0).toUpperCase() + loan.frecuencia.slice(1)}</td>
                  <td>${calcularCuota(loan).toLocaleString('es-CO')}</td>
                  <td>{loan.fecha}</td>
                  <td>{loan.fechaFinal}</td>
                  <td>
                    <div className="pagos-section">
                      <ul>
                        {loan.pagos.map((p, i) => (
                          <li key={i}>
                            {p.fecha}: <b>${p.total?.toLocaleString('es-CO')}</b> (
                            <span style={{ color: '#007bff' }}>Interés: ${p.interes?.toLocaleString('es-CO')}</span>,{" "}
                            <span style={{ color: '#28a745' }}>Abono: ${p.abono?.toLocaleString('es-CO')}</span>)
                          </li>
                        ))}
                      </ul>
                      <div className="total-pagado">
                        Total abonos: ${totalPagado(loan.pagos).toLocaleString('es-CO')}<br />
                        Total intereses: ${totalIntereses(loan.pagos).toLocaleString('es-CO')}<br />
                        <span style={{ color: '#d35400' }}>
                          Resta deuda: ${Math.max(loan.monto - totalPagado(loan.pagos), 0).toLocaleString('es-CO')}
                        </span>
                      </div>
                      <div className="pago-form">
                        <input
                          type="text"
                          placeholder="Total pago"
                          value={nuevoPago[index]?.total || ''}
                          onChange={e => handlePagoChange(index, 'total', e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Interés"
                          value={nuevoPago[index]?.interes || ''}
                          onChange={e => handlePagoChange(index, 'interes', e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Abono deuda"
                          value={nuevoPago[index]?.abono || ''}
                          onChange={e => handlePagoChange(index, 'abono', e.target.value)}
                        />
                        <button onClick={() => handleAgregarPago(index)}>
                          Agregar pago
                        </button>
                      </div>
                    </div>
                  </td>
                  <td>
                    {estaPagado && !loan.terminado && (
                      <div className="terminar-section">
                        <button
                          onClick={() => handleGuardarTerminado(index)}
                          style={{
                            backgroundColor: '#28a745',
                            color: '#fff',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '5px'
                          }}
                        >
                          Marcar como Terminado
                        </button>
                      </div>
                    )}
                    {loan.terminado && (
                      <span className="terminado-label">✅ Terminado: {loan.terminado}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoanList;
