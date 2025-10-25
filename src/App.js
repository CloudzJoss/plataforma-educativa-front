//src/App.js
import "./App.css";
import { Routes, Route } from 'react-router-dom'; 

// Estas importaciones AHORA SÍ funcionarán
import HomePage from "./pages/HomePage"; 
import Dashboard from "./pages/Dashboard"; 

// import ProtectedRoute from "./components/ProtectedRoute"; 

function App() {
  return (
    <Routes> 
      
      {/* RUTA PÚBLICA */}
      <Route 
        path="/" 
        element={<HomePage />} 
      />

      {/* RUTA DASHBOARD */}
      <Route 
        path="/dashboard" 
        element={<Dashboard />} 
      />
      
    </Routes>
  );
}

export default App;
