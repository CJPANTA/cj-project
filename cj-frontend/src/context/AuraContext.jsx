import { createContext, useContext, useState } from 'react';

const AuraContext = createContext();

export function AuraProvider({ children }) {
  const [contexto, setContexto] = useState({ ciclo: '', curso: '', archivo: '' });

  const actualizarContexto = (nuevoContexto) => {
    setContexto((prev) => ({ ...prev, ...nuevoContexto }));
  };

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