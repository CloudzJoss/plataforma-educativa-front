// src/App.js
import React from 'react'; // Ya no necesitamos useEffect aquí para esto
import { useRoutes } from 'react-router-dom';
import routeConfig from './routeConfig.js'; 
import "./App.css"; 

function App() {
    // Solo cargamos las rutas. La seguridad ya está configurada en index.js
    const element = useRoutes(routeConfig); 

    return (
        <div className="App">
            {element}
        </div>
    );
}

export default App;