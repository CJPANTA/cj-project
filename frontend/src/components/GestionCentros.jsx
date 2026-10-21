import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const METODOS = [
  { valor: 'billetera_digital', label: 'Billetera digital', emoji: '📱' },
  { valor: 'transferencia_bancaria', label: 'Transferencia bancaria', emoji: '🏦' },
  { valor: 'efectivo', label: 'Efectivo', emoji: '💵' },
  { valor: 'otro', label: 'Otro', emoji: '📝' },
];

const ESTADO_VISUAL = {
  activo:     { label: 'Activo',     color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', emoji: '🟢' },
  por_vencer: { label: 'Por vencer', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',  emoji: '🟡' },
  vencido:    { label: 'Vencido',    color: 'bg-red-500/20 text-red-400 border-red-500/30',           emoji: '🔴' },
  suspendido: { label: 'Suspendido', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',       emoji: '⏸️' },
  prueba:     { label: 'En prueba',  color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',       emoji: '🔵' },
};

const fmtFecha = (iso) => iso
  ? new Date(iso + (iso.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('es-PE', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  : '—';

export default function GestionCentros({ temaOscuro, onNuevoCentro }) {
  const [centros, setCentros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalPago, setModalPago] = useState(null);
  const [formPago, setFormPago] = useState({ metodo: 'billetera_digital', monto: '', meses: 1, notas: '' });
  const [guardando, setGuardando] = useState(false);

  const bgTarjeta     = temaOscuro ? 'bg-[#0a141d] border-gray-800' : 'bg-white border-gray-300';
  const bgInput       = temaOscuro ? 'bg-black/20 border-gray-700 text-white' : 'bg-white border-gray-300 text-[#0f172a]';
  const textoPrincipal  = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const textoSecundario = temaOscuro ? 'text-gray-400' : 'text-gray-600';
  const bgTablaHead   = temaOscuro ? 'bg-[#0f1a24]' : 'bg-gray-100';
  const bordeFila     = temaOscuro ? 'border-gray-700' : 'border-gray-200';
  const hoverFila     = temaOscuro ? 'hover:bg-[#22d3ee]/5' : 'hover:bg-[#22d3ee]/10';

  const cargar = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('vista_centros_metricas')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setCentros(data || []);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const abrirPago = (centro) => {
    setModalPago(centro);
    setFormPago({ metodo: 'billetera_digital', monto: '', meses: 1, notas: '' });
  };

  const registrarPago = async () => {
    if (!modalPago) return;
    setGuardando(true);
    try {
      const { error } = await supabase.rpc('registrar_pago_centro', {
        p_centro_id: modalPago.id,
        p_monto: formPago.monto ? Number(formPago.monto) : null,
        p_metodo: formPago.metodo,
        p_meses: Number(formPago.meses),
        p_notas: formPago.notas || null,
      });
      if (error) throw error;
      alert('✅ Pago registrado. Plan extendido.');
      setModalPago(null);
      cargar();
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstado = async (centro, nuevoEstado) => {
    const accion = nuevoEstado === 'suspendido' ? 'suspender' : 'reactivar';
    if (!confirm(`¿${accion[0].toUpperCase() + accion.slice(1)} "${centro.nombre}"?`)) return;
    try {
      const { error } = await supabase.rpc('cambiar_estado_centro', {
        p_centro_id: centro.id, p_estado: nuevoEstado,
      });
      if (error) throw error;
      cargar();
    } catch (e) { alert('Error: ' + e.message); }
  };

  const activos    = centros.filter(c => c.estado_visual === 'activo').length;
  const porVencer  = centros.filter(c => c.estado_visual === 'por_vencer').length;
  const vencidos   = centros.filter(c => c.estado_visual === 'vencido').length;
  const suspendidos= centros.filter(c => c.estado_visual === 'suspendido').length;
  const enPrueba   = centros.filter(c => c.estado_visual === 'prueba').length;
  const totalPacientes = centros.reduce((s, c) => s + Number(c.pacientes_total || 0), 0);

  const previewVencimiento = () => {
    if (!modalPago) return '';
    const hoy = new Date();
    const actual = modalPago.fecha_vencimiento ? new Date(modalPago.fecha_vencimiento + 'T00:00:00') : null;
    const base = actual && actual >= hoy ? new Date(actual.getTime() + 24*60*60*1000) : hoy;
    const nuevo = new Date(base);
    nuevo.setMonth(nuevo.getMonth() + Number(formPago.meses));
    nuevo.setDate(nuevo.getDate() - 1);
    return nuevo.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <div className={`${bgTarjeta} rounded-2xl border p-6`}>
      {/* HEADER */}
      <div className="flex justify-between items-start flex-wrap gap-3 mb-4">
        <div>
          <h2 className={`text-xl font-bold ${textoPrincipal}`}>📋 Gestión de Centros</h2>
          <p className={`text-xs ${textoSecundario} mt-1`}>
            {centros.length} centros · {totalPacientes} pacientes totales
          </p>
        </div>
        <button
          onClick={onNuevoCentro}
          className="px-5 py-3 bg-[#22d3ee] text-black font-black rounded-xl text-sm hover:scale-105 transition-all shadow-lg shadow-[#22d3ee]/20"
        >
          ➕ Crear Centro
        </button>
      </div>

      {/* MÉTRICAS */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-6">
        {[
          { label: 'Activos',      valor: activos,     color: 'text-emerald-400' },
          { label: 'Por vencer',   valor: porVencer,   color: 'text-yellow-400' },
          { label: 'Vencidos',     valor: vencidos,    color: 'text-red-400' },
          { label: 'Suspendidos',  valor: suspendidos, color: 'text-gray-400' },
          { label: 'En prueba',    valor: enPrueba,    color: 'text-blue-400' },
          { label: 'Pacientes',    valor: totalPacientes, color: 'text-[#22d3ee]' },
        ].map(m => (
          <div key={m.label} className={`p-3 rounded-xl border ${bordeFila} text-center`}>
            <p className={`text-2xl font-black ${m.color}`}>{m.valor}</p>
            <p className={`text-[10px] font-bold uppercase ${textoSecundario}`}>{m.label}</p>
          </div>
        ))}
      </div>

      {/* TABLA */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#22d3ee] border-t-transparent"></div>
        </div>
      ) : centros.length === 0 ? (
        <div className={`p-8 rounded-2xl border-2 border-dashed text-center ${temaOscuro ? 'border-gray-700' : 'border-gray-300'}`}>
          <p className={`text-sm ${textoSecundario}`}>
            Aún no hay centros. Click en <strong className="text-[#22d3ee]">➕ Crear Centro</strong>.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border">
          <table className="w-full text-sm">
            <thead className={`${bgTablaHead} border-b ${bordeFila}`}>
              <tr>
                {['Centro','Tipo','Estado','Pacientes','Últ. pago','Vence','Acciones'].map(h => (
                  <th key={h} className={`px-4 py-3 text-left font-bold text-[10px] uppercase ${textoSecundario}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {centros.map(c => {
                const ev = ESTADO_VISUAL[c.estado_visual] || ESTADO_VISUAL.prueba;
                const tipoLabel =
                  c.tipo_centro === 'gimnasio_terapeutico' ? '🏋️ Gimnasio' :
                  c.tipo_centro === 'centro_fisioterapeutico' ? '🏥 Centro Fisio' :
                  c.tipo_centro === 'independiente' ? '👤 Independiente' : c.tipo_centro;
                return (
                  <tr key={c.id} className={`border-b ${bordeFila} ${hoverFila}`}>
                    <td className={`px-4 py-3 ${textoPrincipal}`}>
                      <div className="font-bold">{c.nombre}</div>
                      <div className={`text-[10px] font-mono ${textoSecundario}`}>{c.id}</div>
                    </td>
                    <td className={`px-4 py-3 text-xs ${textoSecundario}`}>{tipoLabel}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full border ${ev.color}`}>
                        {ev.emoji} {ev.label}
                      </span>
                    </td>
                    <td className={`px-4 py-3 ${textoPrincipal}`}>
                      <div className="font-black text-[#22d3ee] text-lg">{c.pacientes_total}</div>
                      <div className={`text-[10px] ${textoSecundario}`}>+{c.pacientes_ultimos_30d} este mes</div>
                    </td>
                    <td className={`px-4 py-3 text-xs ${textoSecundario}`}>
                      {c.ultimo_pago_fecha ? (
                        <>
                          <div className={textoPrincipal}>{fmtFecha(c.ultimo_pago_fecha)}</div>
                          <div className="text-[10px] capitalize">
                            {c.ultimo_pago_metodo}{c.ultimo_pago_monto ? ` · S/ ${c.ultimo_pago_monto}` : ''}
                          </div>
                        </>
                      ) : '—'}
                    </td>
                    <td className={`px-4 py-3 text-xs ${textoPrincipal}`}>{fmtFecha(c.fecha_vencimiento)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <button
                          onClick={() => abrirPago(c)}
                          className="px-2 py-1 bg-emerald-500/20 text-emerald-400 font-bold rounded-lg text-[10px] hover:bg-emerald-500 hover:text-white transition-all"
                        >
                          💰 Registrar pago
                        </button>
                        {c.estado_visual === 'suspendido' ? (
                          <button
                            onClick={() => cambiarEstado(c, 'activo')}
                            className="px-2 py-1 bg-blue-500/20 text-blue-400 font-bold rounded-lg text-[10px] hover:bg-blue-500 hover:text-white"
                          >
                            ▶️ Reactivar
                          </button>
                        ) : (
                          <button
                            onClick={() => cambiarEstado(c, 'suspendido')}
                            className="px-2 py-1 bg-yellow-500/20 text-yellow-400 font-bold rounded-lg text-[10px] hover:bg-yellow-500 hover:text-white"
                          >
                            ⏸️ Suspender
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL PAGO */}
      {modalPago && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl ${temaOscuro ? 'bg-[#0a141d] border-gray-700' : 'bg-white border-gray-300'}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className={`text-xl font-black ${textoPrincipal}`}>💰 Registrar Pago</h3>
                <p className={`text-xs ${textoSecundario} mt-1`}>{modalPago.nombre} · {modalPago.id}</p>
              </div>
              <button onClick={() => setModalPago(null)} className={`${textoSecundario} hover:text-red-400 text-xl`}>✕</button>
            </div>

            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoSecundario} mb-2`}>Método</label>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {METODOS.map(m => (
                <button
                  key={m.valor}
                  onClick={() => setFormPago({ ...formPago, metodo: m.valor })}
                  className={`px-3 py-2 rounded-xl text-sm font-bold border transition-all ${
                    formPago.metodo === m.valor
                      ? 'border-[#22d3ee] bg-[#22d3ee]/20 text-[#22d3ee]'
                      : `border-gray-600 ${textoSecundario} hover:border-[#22d3ee]`
                  }`}
                >
                  {m.emoji} {m.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoSecundario} mb-2`}>Monto (S/)</label>
                <input
                  type="number" step="0.01" placeholder="0.00"
                  value={formPago.monto}
                  onChange={e => setFormPago({ ...formPago, monto: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border ${bgInput} text-sm outline-none focus:border-[#22d3ee]`}
                />
              </div>
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoSecundario} mb-2`}>Meses</label>
                <div className="flex gap-1">
                  {[1,3,6,12].map(m => (
                    <button
                      key={m}
                      onClick={() => setFormPago({ ...formPago, meses: m })}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                        formPago.meses === m
                          ? 'border-[#22d3ee] bg-[#22d3ee]/20 text-[#22d3ee]'
                          : `border-gray-600 ${textoSecundario}`
                      }`}
                    >
                      +{m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoSecundario} mb-2`}>Notas (opcional)</label>
              <input
                type="text" placeholder="Ej: op. 12345 · enviado por Jorge"
                value={formPago.notas}
                onChange={e => setFormPago({ ...formPago, notas: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border ${bgInput} text-sm outline-none focus:border-[#22d3ee]`}
              />
            </div>

            <div className="p-3 rounded-xl border border-[#22d3ee]/30 bg-[#22d3ee]/5 mb-4">
              <p className={`text-[10px] font-bold uppercase ${textoSecundario} mb-1`}>Nuevo vencimiento</p>
              <p className={`text-sm font-bold ${textoPrincipal}`}>{previewVencimiento()}</p>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setModalPago(null)}
                className={`px-4 py-2 rounded-xl border text-sm font-bold ${textoPrincipal} ${temaOscuro ? 'border-gray-600 hover:bg-gray-700/30' : 'border-gray-300 hover:bg-gray-100'}`}
              >
                Cancelar
              </button>
              <button
                onClick={registrarPago}
                disabled={guardando}
                className="px-5 py-2 bg-emerald-500 text-white font-black rounded-xl text-sm hover:scale-105 transition-all disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : '✅ Confirmar pago'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}