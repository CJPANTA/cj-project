import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const AuraContext = createContext();

export const AuraProvider = ({ children }) => {
  const [contexto, setContexto] = useState({
    ciclo: '',
    materia: '',
    archivo: ''
  });

  // NUEVO: estado para el resumen global del ciclo
  const [resumenGlobal, setResumenGlobal] = useState(null);

  // Estabilizar actualizarContexto con useCallback
  const actualizarContexto = useCallback((nuevoContexto) => {
    setContexto(prev => ({ ...prev, ...nuevoContexto }));
  }, []);

  // Estabilizar el valor del contexto con useMemo
  const value = useMemo(() => ({
    contexto,
    actualizarContexto,
    resumenGlobal,
    setResumenGlobal
  }), [contexto, actualizarContexto, resumenGlobal]);

  return (
    <AuraContext.Provider value={value}>
      {children}
    </AuraContext.Provider>
  );
};

export const useAura = () => {
  const context = useContext(AuraContext);
  if (!context) {
    throw new Error('useAura debe usarse dentro de un AuraProvider');
  }
  return context;
};