import React, { useState, useEffect } from 'react';
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
  const [expandedLoan, setExpandedLoan] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalPagado = (pagos) => pagos.reduce((acc, pago) => acc + (pago.abono || 0), 0);
  const totalIntereses = (pagos) => pagos.reduce((acc, pago) => acc + (pago.interes || 0), 0);

  const calcularCuota = (loan) => {
    if (!loan.cuotas || loan.cuotas === 0) return 0;
    return Math.ceil(loan.total / loan.cuotas);
  };

  const toggleExpandLoan = (index) => {
    setExpandedLoan(expandedLoan === index ? null : index);
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
      await axios.post(`https://cobros-back.vercel.app/api/loans/${id}/payments`, {
        total,
        interes,
        abono,
        fecha
      });

      const res = await axios.get('https://cobros-back.vercel.app/api/loans');
      onUpdateLoans(res.data);
      setNuevoPago({ ...nuevoPago, [index]: {} });
    } catch (err) {
      console.error('Error al agregar pago:', err);
    }
  };

  const handleGuardarTerminado = async (index) => {
    const id = loans[index]._id;
    try {
      await axios.patch(`https://cobros-back.vercel.app/api/loans/${id}/terminar`, {
        terminado: 'Terminado'
      });

      const res = await axios.get('https://cobros-back.vercel.app/api/loans');
      onUpdateLoans(res.data);
    } catch (err) {
      console.error('Error al marcar como terminado:', err);
    }
  };

  const handleEliminarPrestamo = async (index) => {
    const loan = loans[index];
    const confirmar = window.confirm(
      `¿Estás seguro de que deseas eliminar el préstamo de "${loan.nombre}"? Esta acción no se puede deshacer.`
    );

    if (!confirmar) return;

    const id = loan._id;
    try {
      await axios.delete(`https://cobros-back.vercel.app/api/loans/${id}`);
      
      const res = await axios.get('https://cobros-back.vercel.app/api/loans');
      onUpdateLoans(res.data);
      alert('Préstamo eliminado exitosamente.');
    } catch (err) {
      console.error('Error al eliminar préstamo:', err);
      alert('Error al eliminar el préstamo. Por favor, intenta nuevamente.');
    }
  };

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  // Función para obtener el estado del préstamo
  const getLoanStatus = (loan) => {
    const pagado = totalPagado(loan.pagos);
    const totalRestante = Math.max(loan.monto - pagado, 0);

    if (loan.terminado) return { text: 'Terminado', color: '#28a745' };
    if (totalRestante === 0) return { text: 'Pagado', color: '#007bff' };
    if (totalRestante < loan.monto * 0.5) return { text: 'En progreso', color: '#ffc107' };
    return { text: 'Activo', color: '#dc3545' };
  };

  return (
    <div className="loan-list-container">
      <h2 className="loan-list-title">Préstamos Registrados</h2>

      {/* Contenedor principal con scroll */}
      <div className="loan-list-content-wrapper">
        {isMobile ? (
          // Vista móvil - Tarjetas
          <div className="loan-cards">
            {loans.map((loan, index) => {
              const status = getLoanStatus(loan);
              const pagado = totalPagado(loan.pagos);
              const estaPagado = pagado >= loan.total;
              const isExpanded = expandedLoan === index;

              return (
                <div key={index} className={`loan-card ${isExpanded ? 'expanded' : ''}`}>
                  <div className="loan-card-header">
                    <div onClick={() => toggleExpandLoan(index)} style={{ flex: 1, cursor: 'pointer' }}>
                      <div className="loan-card-title">
                        <h3>{loan.nombre}</h3>
                        <span className="loan-status" style={{ backgroundColor: status.color }}>
                          {status.text}
                        </span>
                      </div>
                      <div className="loan-card-amount">
                        <span className="total-amount">${loan.total.toLocaleString('es-CO')}</span>
                        <span className="expand-icon">{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </div>
                    <button
                      className="btn-delete-mobile"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEliminarPrestamo(index);
                      }}
                      title="Eliminar préstamo"
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="loan-card-summary">
                    <div className="summary-row">
                      <span className="summary-label">Monto:</span>
                      <span className="summary-value">${loan.monto.toLocaleString('es-CO')}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Interés:</span>
                      <span className="summary-value">${loan.interes.toLocaleString('es-CO')}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Cuotas:</span>
                      <span className="summary-value">{loan.cuotas} ({loan.frecuencia})</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="loan-card-details">
                      {/* Detalles del préstamo */}
                      <div className="detail-section">
                        <h4>Detalles del Préstamo</h4>
                        <div className="detail-grid">
                          <div className="detail-item">
                            <span className="detail-label">Cuota mensual:</span>
                            <span className="detail-value">${calcularCuota(loan).toLocaleString('es-CO')}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Fecha inicio:</span>
                            <span className="detail-value">{loan.fecha}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Fecha final:</span>
                            <span className="detail-value">{loan.fechaFinal}</span>
                          </div>
                        </div>
                      </div>

                      {/* Historial de pagos */}
                      <div className="detail-section">
                        <h4>Historial de Pagos</h4>
                        {loan.pagos.length > 0 ? (
                          <div className="pagos-list">
                            {loan.pagos.map((p, i) => (
                              <div key={i} className="pago-item">
                                <div className="pago-header">
                                  <span className="pago-fecha">{p.fecha}</span>
                                  <span className="pago-total">${p.total?.toLocaleString('es-CO')}</span>
                                </div>
                                <div className="pago-details">
                                  <span className="pago-interes">Interés: ${p.interes?.toLocaleString('es-CO')}</span>
                                  <span className="pago-abono">Abono: ${p.abono?.toLocaleString('es-CO')}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="no-pagos">No hay pagos registrados</p>
                        )}

                        <div className="resumen-pagos">
                          <div className="resumen-item">
                            <span>Total abonos:</span>
                            <strong>${totalPagado(loan.pagos).toLocaleString('es-CO')}</strong>
                          </div>
                          <div className="resumen-item">
                            <span>Total intereses:</span>
                            <strong>${totalIntereses(loan.pagos).toLocaleString('es-CO')}</strong>
                          </div>
                          <div className="resumen-item destacado">
                            <span>Deuda restante:</span>
                            <strong>
                              ${
                                Math.max(
                                  loan.total - totalPagado(loan.pagos),
                                  0
                                ).toLocaleString('es-CO')
                              }
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* Formulario para nuevo pago */}
                      <div className="detail-section">
                        <h4>Agregar Pago</h4>
                        <div className="pago-form-mobile">
                          <div className="form-group">
                            <label>Total pago</label>
                            <input
                              type="text"
                              placeholder="Ej: 100.000"
                              value={nuevoPago[index]?.total || ''}
                              onChange={e => handlePagoChange(index, 'total', e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label>Interés</label>
                            <input
                              type="text"
                              placeholder="Ej: 15.000"
                              value={nuevoPago[index]?.interes || ''}
                              onChange={e => handlePagoChange(index, 'interes', e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label>Abono deuda</label>
                            <input
                              type="text"
                              placeholder="Ej: 85.000"
                              value={nuevoPago[index]?.abono || ''}
                              onChange={e => handlePagoChange(index, 'abono', e.target.value)}
                            />
                          </div>
                          <button
                            className="btn-add-payment"
                            onClick={() => handleAgregarPago(index)}
                          >
                            Agregar pago
                          </button>
                        </div>
                      </div>

                      {/* Botón para marcar como terminado */}
                      {estaPagado && !loan.terminado && (
                        <div className="terminar-section">
                          <button
                            className="btn-terminar"
                            onClick={() => handleGuardarTerminado(index)}
                          >
                            ✅ Marcar como Terminado
                          </button>
                        </div>
                      )}

                      {loan.terminado && (
                        <div className="terminado-info">
                          <span className="terminado-label">✅ Terminado: {loan.terminado}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          // Vista desktop/tablet - Tabla
          <div className="loan-list-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  {!isTablet && <th>Monto</th>}
                  {!isTablet && <th>Interés</th>}
                  <th>Total</th>
                  <th>Cuotas</th>
                  {!isTablet && <th>Frecuencia</th>}
                  <th>Cuota</th>
                  {!isTablet && <th>Fecha inicio</th>}
                  {!isTablet && <th>Fecha final</th>}
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan, index) => {
                  const status = getLoanStatus(loan);
                  const pagado = totalPagado(loan.pagos);
                  const estaPagado = pagado >= loan.total;
                  const isExpanded = expandedLoan === index;

                  return (
                    <React.Fragment key={index}>
                      <tr className={isExpanded ? 'expanded-row' : ''}>
                        <td>{loan.nombre}</td>
                        {!isTablet && <td>${loan.monto.toLocaleString('es-CO')}</td>}
                        {!isTablet && <td>${loan.interes.toLocaleString('es-CO')}</td>}
                        <td>${loan.total.toLocaleString('es-CO')}</td>
                        <td>{loan.cuotas}</td>
                        {!isTablet && <td>{loan.frecuencia.charAt(0).toUpperCase() + loan.frecuencia.slice(1)}</td>}
                        <td>${calcularCuota(loan).toLocaleString('es-CO')}</td>
                        {!isTablet && <td>{loan.fecha}</td>}
                        {!isTablet && <td>{loan.fechaFinal}</td>}
                        <td>
                          <span className="status-badge" style={{ backgroundColor: status.color }}>
                            {status.text}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <div className="actions-buttons">
                            <button
                              className="btn-toggle-details"
                              onClick={() => toggleExpandLoan(index)}
                            >
                              {isExpanded ? 'Ocultar detalles' : 'Ver detalles'}
                            </button>
                            <button
                              className="btn-delete"
                              onClick={() => handleEliminarPrestamo(index)}
                              title="Eliminar préstamo"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="details-row">
                          <td colSpan={isTablet ? 6 : 11}>
                            <div className="expanded-details">
                              {/* Detalles adicionales para tablet */}
                              {isTablet && (
                                <div className="tablet-details">
                                  <div className="detail-row">
                                    <span>Monto:</span> ${loan.monto.toLocaleString('es-CO')}
                                  </div>
                                  <div className="detail-row">
                                    <span>Interés:</span> ${loan.interes.toLocaleString('es-CO')}
                                  </div>
                                  <div className="detail-row">
                                    <span>Frecuencia:</span> {loan.frecuencia}
                                  </div>
                                  <div className="detail-row">
                                    <span>Fecha inicio:</span> {loan.fecha}
                                  </div>
                                  <div className="detail-row">
                                    <span>Fecha final:</span> {loan.fechaFinal}
                                  </div>
                                </div>
                              )}

                              {/* Historial de pagos */}
                              <div className="pagos-section">
                                <h4>Historial de Pagos</h4>
                                {loan.pagos.length > 0 ? (
                                  <div className="pagos-table">
                                    <div className="pagos-header">
                                      <span>Fecha</span>
                                      <span>Total</span>
                                      <span>Interés</span>
                                      <span>Abono</span>
                                    </div>
                                    {loan.pagos.map((p, i) => (
                                      <div key={i} className="pago-row">
                                        <span>{p.fecha}</span>
                                        <span>${p.total?.toLocaleString('es-CO')}</span>
                                        <span className="interes-amount">${p.interes?.toLocaleString('es-CO')}</span>
                                        <span className="abono-amount">${p.abono?.toLocaleString('es-CO')}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="no-pagos">No hay pagos registrados</p>
                                )}

                                <div className="resumen-pagos">
                                  <div className="resumen-item">
                                    <span>Total abonos:</span>
                                    <strong>${totalPagado(loan.pagos).toLocaleString('es-CO')}</strong>
                                  </div>
                                  <div className="resumen-item">
                                    <span>Total intereses:</span>
                                    <strong>${totalIntereses(loan.pagos).toLocaleString('es-CO')}</strong>
                                  </div>
                                  <div className="resumen-item destacado">
                                    <span>Deuda restante:</span>
                                    <strong>
                                      ${
                                        Math.max(
                                          loan.total - totalPagado(loan.pagos),
                                          0
                                        ).toLocaleString('es-CO')
                                      }
                                    </strong>
                                  </div>
                                </div>
                              </div>

                              {/* Formulario para nuevo pago */}
                              <div className="pago-form">
                                <h4>Agregar Nuevo Pago</h4>
                                <div className="form-inputs">
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
                                  <button
                                    className="btn-add-payment"
                                    onClick={() => handleAgregarPago(index)}
                                  >
                                    Agregar pago
                                  </button>
                                </div>
                              </div>

                              {/* Botón para marcar como terminado */}
                              <div className="terminar-section">
                                {estaPagado && !loan.terminado && (
                                  <button
                                    className="btn-terminar"
                                    onClick={() => handleGuardarTerminado(index)}
                                  >
                                    ✅ Marcar como Terminado
                                  </button>
                                )}

                                {loan.terminado && (
                                  <span className="terminado-label">✅ Terminado: {loan.terminado}</span>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {loans.length === 0 && (
          <div className="no-loans">
            <p>No hay préstamos registrados</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanList;