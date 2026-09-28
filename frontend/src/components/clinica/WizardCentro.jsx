// ============================================================
// src/components/clinica/WizardCentro.jsx
// Wizard de 3 pasos para crear un centro completo
// ============================================================
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { agregarVarios } from '../../utils/aparatologia';

const TIPOS_CENTRO = [
  { valor: 'gimnasio_terapeutico', label: '🏋️ Gimnasio Terapéutico' },
  { valor: 'centro_fisioterapeutico', label: '🏥 Centro Fisioterapéutico' },
  { valor: 'independiente', label: '👤 Consultorio Independiente' },
];

export default function WizardCentro({ abierto, onCerrar, onCreado, temaOscuro }) {
  const [paso, setPaso] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [catalogo, setCatalogo] = useState([]);

  // ===== PASO 1: Datos legales =====
  const [datos, setDatos] = useState({
    id: '',
    nombre: '',
    ruc: '',
    direccion: '',
    telefono: '',
    email: '',
    tipo_centro: 'centro_fisioterapeutico',
  });

  // ===== PASO 2: Admin Centro =====
  const [emailAdmin, setEmailAdmin] = useState('');
  const [buscandoAdmin, setBuscandoAdmin] = useState(false);
  const [adminEncontrado, setAdminEncontrado] = useState(null);
  const [adminError, setAdminError] = useState(null);
  const [asignarAdmin, setAsignarAdmin] = useState(true);

  // ===== PASO 3: Aparatología =====
  const [agentesSeleccionados, setAgentesSeleccionados] = useState([]);

  // ===== CARGAR CATÁLOGO =====
  useEffect(() => {
    if (!abierto) return;
    fetch('/data/catalogo_agentes_fisicos.json')
      .then((r) => r.json())
      .then((data) => {
        setCatalogo(data || []);
        // Por defecto: todos seleccionados
        setAgentesSeleccionados((data || []).map((a) => a.id));
      })
      .catch((e) => console.error('Error cargando catálogo:', e));
  }, [abierto]);

  // ===== RESET al cerrar =====
  useEffect(() => {
    if (!abierto) {
      setPaso(1);
      setDatos({ id: '', nombre: '', ruc: '', direccion: '', telefono: '', email: '', tipo_centro: 'centro_fisioterapeutico' });
      setEmailAdmin('');
      setAdminEncontrado(null);
      setAdminError(null);
      setAsignarAdmin(true);
      setError(null);
    }
  }, [abierto]);

  // ============================================================
  // BUSCAR ADMIN POR EMAIL
  // ============================================================
  const buscarAdmin = async () => {
    if (!emailAdmin.trim()) {
      setAdminError('Escribe un email para buscar.');
      return;
    }
    setBuscandoAdmin(true);
    setAdminError(null);
    setAdminEncontrado(null);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nombre_completo, email, rol, tipo_profesional, centro_id')
        .eq('email', emailAdmin.trim().toLowerCase())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setAdminError(
          `El usuario "${emailAdmin}" no está registrado. Pídele que se registre primero en la app, o crea el centro sin admin y asígnalo después desde el Panel del Director.`
        );
      } else if (data.rol === 1) {
        setAdminError(`"${data.nombre_completo}" es Director Global. No se puede reasignar como Admin Centro.`);
      } else {
        setAdminEncontrado(data);
      }
    } catch (err) {
      console.error('Error buscando admin:', err);
      setAdminError('Error al buscar: ' + err.message);
    } finally {
      setBuscandoAdmin(false);
    }
  };

  // ============================================================
  // VALIDACIONES
  // ============================================================
  const validarPaso1 = () => {
    if (!datos.id.trim()) return 'El código del centro es obligatorio.';
    if (datos.id.length < 3) return 'El código debe tener al menos 3 caracteres.';
    if (!/^[A-Z0-9]+$/.test(datos.id)) return 'El código solo admite letras mayúsculas y números.';
    if (!datos.nombre.trim()) return 'El nombre del centro es obligatorio.';
    if (datos.ruc && !/^\d{11}$/.test(datos.ruc)) return 'El RUC debe tener 11 dígitos.';
    return null;
  };

  const irAPaso2 = () => {
    const err = validarPaso1();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setPaso(2);
  };

  const irAPaso3 = () => {
    if (asignarAdmin && !adminEncontrado) {
      setError('Marca la casilla "Omitir asignación" o busca un admin válido.');
      return;
    }
    setError(null);
    setPaso(3);
  };

  // ============================================================
  // GUARDAR TODO
  // ============================================================
  const guardar = async () => {
    setGuardando(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Crear centro
      const centroId = datos.id.trim().toUpperCase();
      const logoUrl = `https://raw.githubusercontent.com/CJPANTA/cj-project/main/frontend/public/logo_centros/${centroId}.png`;

      const { error: errCentro } = await supabase.from('centros').insert([{
        id: centroId,
        nombre: datos.nombre.trim(),
        ruc: datos.ruc.trim() || null,
        direccion: datos.direccion.trim() || null,
        telefono: datos.telefono.trim() || null,
        email: datos.email.trim() || null,
        tipo_centro: datos.tipo_centro,
        logo_url: logoUrl,
        created_by: user?.id || null,
      }]);

      if (errCentro) {
        if (errCentro.code === '23505') throw new Error(`Ya existe un centro con el código "${centroId}".`);
        throw errCentro;
      }

      // 2. Asignar admin (si aplica)
      if (asignarAdmin && adminEncontrado) {
        const { error: errAdmin } = await supabase
          .from('profiles')
          .update({
            rol: 7,
            centro_id: centroId,
            tipo_profesional: adminEncontrado.tipo_profesional || 'licenciado',
            estado: 'aprobado',
          })
          .eq('id', adminEncontrado.id);

        if (errAdmin) throw errAdmin;
      }

      // 3. Insertar aparatología
      if (agentesSeleccionados.length > 0) {
        const agentes = catalogo.filter((a) => agentesSeleccionados.includes(a.id));
        await agregarVarios(centroId, agentes);
      }

      onCreado?.();
      onCerrar?.();
    } catch (err) {
      console.error('Error en wizard:', err);
      setError('Error al crear: ' + err.message);
    } finally {
      setGuardando(false);
    }
  };

  // ============================================================
  // ESTILOS
  // ============================================================
  const bgModal = temaOscuro ? 'bg-[#0a141d] border-gray-800' : 'bg-white border-gray-300';
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const textoSecundario = temaOscuro ? 'text-gray-400' : 'text-gray-600';
  const bgInput = temaOscuro
    ? 'bg-black/20 border-white/10 text-white'
    : 'bg-gray-100 border-gray-300 text-[#0f172a]';
  const bgSeccion = temaOscuro ? 'bg-black/20 border-gray-800' : 'bg-gray-50 border-gray-200';

  if (!abierto) return null;

  // ============================================================
  // HEADER DE PASOS
  // ============================================================
  const HeaderPasos = () => (
    <div className="flex items-center justify-between mb-6">
      {[
        { n: 1, label: 'Datos legales' },
        { n: 2, label: 'Admin Centro' },
        { n: 3, label: 'Aparatología' },
      ].map(({ n, label }, i) => (
        <div key={n} className="flex items-center flex-1">
          <div className={`flex items-center gap-2 ${paso >= n ? 'opacity-100' : 'opacity-40'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
              paso > n
                ? 'bg-emerald-500 text-white'
                : paso === n
                ? 'bg-[#22d3ee] text-black'
                : `${temaOscuro ? 'bg-gray-700 text-gray-400' : 'bg-gray-300 text-gray-500'}`
            }`}>
              {paso > n ? '✓' : n}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} hidden sm:inline`}>
              {label}
            </span>
          </div>
          {i < 2 && (
            <div className={`flex-1 h-0.5 mx-2 ${paso > n ? 'bg-emerald-500' : temaOscuro ? 'bg-gray-700' : 'bg-gray-300'}`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className={`relative w-full max-w-3xl rounded-3xl border ${bgModal} p-6 shadow-2xl my-8`}>

        {/* HEADER */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className={`text-2xl font-black ${textoPrincipal}`}>🏥 Crear Centro</h2>
            <p className={`text-xs ${textoSecundario} mt-1`}>
              Paso {paso} de 3 — Configuración completa en un solo flujo
            </p>
          </div>
          <button onClick={onCerrar} className={`${textoSecundario} hover:text-red-400 text-2xl leading-none`}>✕</button>
        </div>

        <HeaderPasos />

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
            ⚠️ {error}
          </div>
        )}

        {/* ============================================================ */}
        {/* PASO 1 — DATOS LEGALES                                        */}
        {/* ============================================================ */}
        {paso === 1 && (
          <div className={`${bgSeccion} rounded-2xl border p-4 grid grid-cols-1 md:grid-cols-2 gap-4`}>
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
                Código del centro <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={datos.id}
                onChange={(e) => setDatos({ ...datos, id: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
                placeholder="Ej: CAKJ, CPP, CJ001"
                maxLength={10}
                className={`w-full px-4 py-2 rounded-xl border ${bgInput} text-sm font-mono font-bold uppercase outline-none focus:border-[#22d3ee]`}
              />
              <p className={`text-[10px] ${textoSecundario} mt-1`}>
                Solo letras mayúsculas y números. Se usa para identificar el centro.
              </p>
            </div>

            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
                Tipo de centro <span className="text-red-400">*</span>
              </label>
              <select
                value={datos.tipo_centro}
                onChange={(e) => setDatos({ ...datos, tipo_centro: e.target.value })}
                className={`w-full px-4 py-2 rounded-xl border ${bgInput} text-sm cursor-pointer outline-none focus:border-[#22d3ee]`}
              >
                {TIPOS_CENTRO.map((t) => (
                  <option key={t.valor} value={t.valor}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
                Nombre del centro <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={datos.nombre}
                onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
                placeholder="Ej: Centro Académico Kinesiología Jesús"
                className={`w-full px-4 py-2 rounded-xl border ${bgInput} text-sm outline-none focus:border-[#22d3ee]`}
              />
            </div>

            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
                RUC <span className={`${textoSecundario} normal-case font-normal`}>(opcional, 11 dígitos)</span>
              </label>
              <input
                type="text"
                value={datos.ruc}
                onChange={(e) => setDatos({ ...datos, ruc: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                placeholder="20512345678"
                maxLength={11}
                className={`w-full px-4 py-2 rounded-xl border ${bgInput} text-sm font-mono outline-none focus:border-[#22d3ee]`}
              />
            </div>

            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
                Teléfono <span className={`${textoSecundario} normal-case font-normal`}>(opcional)</span>
              </label>
              <input
                type="tel"
                value={datos.telefono}
                onChange={(e) => setDatos({ ...datos, telefono: e.target.value })}
                placeholder="+51 999 999 999"
                className={`w-full px-4 py-2 rounded-xl border ${bgInput} text-sm outline-none focus:border-[#22d3ee]`}
              />
            </div>

            <div className="md:col-span-2">
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
                Dirección <span className={`${textoSecundario} normal-case font-normal`}>(opcional)</span>
              </label>
              <input
                type="text"
                value={datos.direccion}
                onChange={(e) => setDatos({ ...datos, direccion: e.target.value })}
                placeholder="Av. Principal 123, Lima"
                className={`w-full px-4 py-2 rounded-xl border ${bgInput} text-sm outline-none focus:border-[#22d3ee]`}
              />
            </div>

            <div className="md:col-span-2">
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
                Email de contacto <span className={`${textoSecundario} normal-case font-normal`}>(opcional)</span>
              </label>
              <input
                type="email"
                value={datos.email}
                onChange={(e) => setDatos({ ...datos, email: e.target.value })}
                placeholder="contacto@tucentro.com"
                className={`w-full px-4 py-2 rounded-xl border ${bgInput} text-sm outline-none focus:border-[#22d3ee]`}
              />
              <p className={`text-[10px] ${textoSecundario} mt-1`}>
                Este email es solo de contacto del centro (aparece en documentos). No se usa para login.
              </p>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* PASO 2 — ADMIN CENTRO                                         */}
        {/* ============================================================ */}
        {paso === 2 && (
          <div className={`${bgSeccion} rounded-2xl border p-4`}>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={asignarAdmin}
                onChange={(e) => setAsignarAdmin(e.target.checked)}
                className="accent-[#22d3ee] w-4 h-4"
              />
              <label className={`text-xs font-bold uppercase tracking-wider ${textoPrincipal} cursor-pointer`}>
                Asignar un Admin Centro ahora
              </label>
            </div>

            {asignarAdmin && (
              <>
                <p className={`text-[11px] ${textoSecundario} mb-3`}>
                  Busca por email de un usuario <strong>ya registrado</strong> en la app. Se le asignará rol <strong>Admin Centro (7)</strong> y este centro.
                </p>

                <div className="flex gap-2 mb-3">
                  <input
                    type="email"
                    value={emailAdmin}
                    onChange={(e) => {
                      setEmailAdmin(e.target.value);
                      setAdminEncontrado(null);
                      setAdminError(null);
                    }}
                    placeholder="admin.cakj@cjfisio.com"
                    className={`flex-1 px-4 py-2 rounded-xl border ${bgInput} text-sm outline-none focus:border-[#22d3ee]`}
                  />
                  <button
                    type="button"
                    onClick={buscarAdmin}
                    disabled={buscandoAdmin}
                    className="px-4 py-2 bg-[#22d3ee] text-black font-black rounded-xl text-xs hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {buscandoAdmin ? '⏳' : '🔍 Buscar'}
                  </button>
                </div>

                {adminError && (
                  <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-[11px]">
                    ⚠️ {adminError}
                  </div>
                )}

                {adminEncontrado && (
                  <div className={`p-3 rounded-xl border-2 border-emerald-500/40 ${temaOscuro ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-emerald-400 text-lg">✓</span>
                      <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                        Usuario encontrado
                      </span>
                    </div>
                    <p className={`text-sm font-bold ${textoPrincipal}`}>{adminEncontrado.nombre_completo}</p>
                    <p className={`text-[10px] ${textoSecundario}`}>
                      Rol actual: {adminEncontrado.rol === 7 ? 'Admin Centro' : adminEncontrado.rol === 3 ? 'Licenciado' : adminEncontrado.rol === 2 ? 'Estudiante' : `Rol ${adminEncontrado.rol}`}
                      {adminEncontrado.centro_id && ` · Centro actual: ${adminEncontrado.centro_id}`}
                    </p>
                    {adminEncontrado.centro_id && adminEncontrado.centro_id !== datos.id.toUpperCase() && (
                      <p className="text-[10px] text-yellow-400 mt-1">
                        ⚠️ Este usuario ya está en otro centro. Se reasignará al nuevo.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            {!asignarAdmin && (
              <div className={`p-3 rounded-xl ${temaOscuro ? 'bg-black/30' : 'bg-gray-100'} text-xs ${textoSecundario}`}>
                ℹ️ El centro se creará sin admin. Podrás asignarlo más adelante desde el Panel del Director.
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* PASO 3 — APARATOLOGÍA                                         */}
        {/* ============================================================ */}
        {paso === 3 && (
          <div className={`${bgSeccion} rounded-2xl border p-4`}>
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${textoPrincipal}`}>
                  Aparatología inicial
                </p>
                <p className={`text-[10px] ${textoSecundario} mt-0.5`}>
                  Marca los equipos que el centro tiene. Podrás editarlos después.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAgentesSeleccionados(catalogo.map((a) => a.id))}
                  className="text-[10px] font-bold px-2 py-1 rounded-lg bg-[#22d3ee]/20 text-[#22d3ee] hover:bg-[#22d3ee] hover:text-black transition-all"
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setAgentesSeleccionados([])}
                  className="text-[10px] font-bold px-2 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                >
                  Ninguno
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
              {catalogo.map((ag) => {
                const checked = agentesSeleccionados.includes(ag.id);
                return (
                  <label
                    key={ag.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      checked
                        ? 'bg-[#22d3ee]/10 border-[#22d3ee]/40'
                        : `${temaOscuro ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'}`
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setAgentesSeleccionados((prev) =>
                          prev.includes(ag.id)
                            ? prev.filter((x) => x !== ag.id)
                            : [...prev, ag.id]
                        );
                      }}
                      className="accent-[#22d3ee] w-4 h-4 mt-0.5 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold ${textoPrincipal}`}>{ag.nombre}</p>
                      <p className={`text-[10px] ${textoSecundario} mt-0.5`}>{ag.descripcion}</p>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className={`mt-3 p-3 rounded-xl ${temaOscuro ? 'bg-black/20' : 'bg-white'} flex justify-between items-center`}>
              <span className={`text-xs ${textoSecundario}`}>
                Seleccionados:
              </span>
              <span className="text-sm font-black text-[#22d3ee]">
                {agentesSeleccionados.length} de {catalogo.length}
              </span>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* FOOTER                                                        */}
        {/* ============================================================ */}
        <div className="flex justify-between gap-3 mt-6 pt-4 border-t border-gray-700/30">
          <button
            type="button"
            onClick={() => paso > 1 ? setPaso(paso - 1) : onCerrar()}
            disabled={guardando}
            className={`px-5 py-2 rounded-xl border text-sm font-bold ${
              temaOscuro
                ? 'border-gray-600 hover:bg-gray-700/30 text-white'
                : 'border-gray-300 hover:bg-gray-100 text-[#0f172a]'
            } disabled:opacity-50`}
          >
            {paso === 1 ? 'Cancelar' : '← Atrás'}
          </button>

          {paso === 1 && (
            <button
              type="button"
              onClick={irAPaso2}
              className="px-6 py-2 bg-[#22d3ee] text-black font-black rounded-xl text-sm hover:scale-105 transition-all"
            >
              Siguiente →
            </button>
          )}

          {paso === 2 && (
            <button
              type="button"
              onClick={irAPaso3}
              className="px-6 py-2 bg-[#22d3ee] text-black font-black rounded-xl text-sm hover:scale-105 transition-all"
            >
              Siguiente →
            </button>
          )}

          {paso === 3 && (
            <button
              type="button"
              onClick={guardar}
              disabled={guardando}
              className="px-6 py-2 bg-emerald-500 text-white font-black rounded-xl text-sm hover:scale-105 transition-all disabled:opacity-50"
            >
              {guardando ? '⏳ Creando...' : '✨ Crear Centro'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}