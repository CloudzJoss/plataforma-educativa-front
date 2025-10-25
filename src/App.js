//src/App.js
import "./App.css";
import { Routes, Route } from 'react-router-dom'; 

// 1. 🚨 CORREGIMOS LAS RUTAS DE IMPORTACIÓN
import HomePage from "./pages/HomePage"; 
import Dashboard from "./pages/Dashboard"; 

// 2. 🚨 IMPORTAMOS EL GUARDIÁN DESDE SU CARPETA
import ProtectedRoute from "./security/ProtectedRoute"; 

function App() {
  return (
    <Routes> 
      
      {/* RUTA PÚBLICA */}
      <Route 
        path="/" 
        element={<HomePage />} 
      />

      {/* RUTA PROTEGIDA */}
      <Route 
        path="/dashboard" 
        element={
          // 3. 🚨 ENVOLVEMOS EL DASHBOARD CON EL GUARDIÁN
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
    </Routes>
  );
}

export default App;

