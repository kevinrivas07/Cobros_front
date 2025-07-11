import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LoanForm from '../components/LoanForm';
import LoanList from '../components/LoanList';
import '../styles/Home.css';

const Home = () => {
  const [loans, setLoans] = useState([]);

  useEffect(() => {
    const obtenerPrestamos = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/loans');
        setLoans(res.data);
      } catch (error) {
        console.error('Error al cargar préstamos:', error);
      }
    };

    obtenerPrestamos();
  }, []);

  const handleAddLoan = async (loan) => {
    try {
      await axios.post('http://localhost:4000/api/loans', {
        ...loan,
        pagos: [],
        terminado: '',
      });
      const res = await axios.get('http://localhost:4000/api/loans');
      setLoans(res.data);
    } catch (error) {
      console.error('Error al guardar préstamo:', error);
    }
  };

  return (
    <div className="container">
      <h1>Gestión de Préstamos (15%)</h1>
      <LoanForm onAddLoan={handleAddLoan} />
      <LoanList loans={loans} onUpdateLoans={setLoans} />
    </div>
  );
};

export default Home;
