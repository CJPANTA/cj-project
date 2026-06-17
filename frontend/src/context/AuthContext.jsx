import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [rol, setRol] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [modoAuditoria, setModoAuditoria] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) cargarPerfil(session.user.id);
      else setCargando(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) await cargarPerfil(session.user.id);
      else {
        setUsuario(null);
        setRol(null);
        setCargando(false);
      }
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  const cargarPerfil = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data && data.estado === 'aprobado') {
      setUsuario({ id: userId, ...data });
      setRol(data.rol);
    } else {
      await supabase.auth.signOut();
      setUsuario(null);
      setRol(null);
    }
    setCargando(false);
  };

  const setModoAuditor = (rolSimulado) => {
    if (usuario?.rol === 1) setModoAuditoria(rolSimulado);
  };

  // Si el director está simulando, usamos ese rol. Si no, el real.
  const rolEfectivo = modoAuditoria !== null ? modoAuditoria : rol;

  return (
    <AuthContext.Provider value={{ usuario, rol: rolEfectivo, rolReal: rol, cargando, modoAuditoria, setModoAuditor }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);