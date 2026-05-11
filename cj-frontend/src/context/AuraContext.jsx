import { createContext, useContext, useState, useCallback } from 'react';

const AuraContext = createContext();

export function AuraProvider({ children }) {
  const [contexto, setContexto] = useState({ ciclo: '', materia: '', archivo: '' });

  const actualizarContexto = useCallback((nuevoContexto) => {
    setContexto((prev) => ({ ...prev, ...nuevoContexto }));
  }, []); // Estable, no cambia entre renders

  return (
    <AuraContext.Provider value={{ contexto, actualizarContexto }}>
      {children}
    </AuraContext.Provider>
  );
}

export const useAura = () => {
  const context = useContext(AuraContext);
  if (!context) return { contexto: {}, actualizarContexto: () => {} };
  return context;
};