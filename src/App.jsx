import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Home from './components/Home'
import Login from './components/Login'
import Register from './components/Register'

const PrivateRoute = ({ children }) => {
  const isAuth = localStorage.getItem('auth') === 'true'
  return isAuth ? children : <Navigate to="/login" replace />
}

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />

        {/* Ruta inicial */}
        <Route
          path="/"
          element={
            localStorage.getItem('auth') === 'true'
              ? <Navigate to="/home" replace />
              : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </Router>
  )
}

export default App
