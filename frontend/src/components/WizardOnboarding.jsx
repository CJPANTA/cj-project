import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const SUPABASE_URL = 'https://xjxsuxtehkdtphvgkvbd.supabase.co';

const normalizar = (t) =>
  (t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

const generarIdCentro = (nombre) => {
  const palabras = (nombre || '').trim().split(/\s+/).filter(w => w.length > 2);
  if (!palabras.length) return 'CJ';
  return palabras.slice(0, 4).map(w => normalizar(w)[0]).join('').toUpperCase() || 'CJ';
};

const generarEmail = (nombreCompleto, dominio) => {
  const partes = (nombreCompleto || '').trim().split(/\s+/);
  if (!partes[0] || !partes[1] || !dominio) return '';
  return `${normalizar(partes[0])}.${normalizar(partes[1])}@${dominio}.com`;
};

const generarPassword = () => {
  return '12345678';
};

const TIPOS = [
  { valor: 'gimnasio_terapeutico',    label: '🏋️ Gimnasio Terapéutico' },
  { valor: 'centro_fisioterapeutico', label: '🏥 Centro Fisioterapéutico' },
  { valor: 'independiente',           label: '👤 Independiente' },
];

export default function WizardOnboarding({ abierto, onCerrar, onCreado, temaOscuro }) {
  const [paso, setPaso] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(null);

  const [centro, setCentro] = useState({
    nombre: '', id: '', idManual: false,
    tipo_centro: 'gimnasio_terapeutico',
    ruc: '', direccion: '', telefono: '',
    email_empresa: '', dominio: '',
  });

  const [admin, setAdmin] = useState({
    nombre_completo: '', tipo_documento: 'DNI', dni: '',
    esLicenciado: true, numero_colegiatura: '',
    telefono: '', nickname: '',
    email: '', emailManual: false,
    password: generarPassword(), prueba_dias: 14,
  });

  useEffect(() => {
    if (abierto) {
      setPaso(1); setError(''); setExito(null);
      setCentro({
        nombre: '', id: '', idManual: false, tipo_centro: 'gimnasio_terapeutico',
        ruc: '', direccion: '', telefono: '', email_empresa: '', dominio: '',
      });
      setAdmin({
        nombre_completo: '', tipo_documento: 'DNI', dni: '', esLicenciado: true,
        numero_colegiatura: '', telefono: '', nickname: '',
        email: '', emailManual: false, password: generarPassword(), prueba_dias: 14,
      });
    }
  }, [abierto]);

  useEffect(() => {
    if (!centro.idManual && centro.nombre) {
      setCentro(c => ({ ...c, id: generarIdCentro(c.nombre) }));
    }
  }, [centro.nombre, centro.idManual]);

  useEffect(() => {
    if (!centro.dominio && centro.id) {
      setCentro(c => ({ ...c, dominio: normalizar(c.id) }));
    }
  }, [centro.id]);

  useEffect(() => {
    if (!admin.emailManual && admin.nombre_completo && centro.dominio) {
      setAdmin(a => ({ ...a, email: generarEmail(a.nombre_completo, centro.dominio) }));
    }
  }, [admin.nombre_completo, centro.dominio, admin.emailManual]);

  if (!abierto) return null;

  const bgModal = temaOscuro ? 'bg-[#0a141d] border-gray-700' : 'bg-white border-gray-300';
  const bgInput = temaOscuro ? 'bg-black/20 border-gray-700 text-white' : 'bg-white border-gray-300 text-[#0f172a]';
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const textoSecundario = temaOscuro ? 'text-gray-400' : 'text-gray-600';
  const labelClass = `block text-[10px] font-bold uppercase tracking-wider ${textoSecundario} mb-1.5`;
  const inputClass = `w-full px-3 py-2 rounded-xl border ${bgInput} text-sm outline-none focus:border-[#22d3ee] transition-colors`;

  const validarPaso1 = () => {
    if (!centro.nombre.trim()) return 'Ingresa el nombre del centro';
    if (!centro.id.trim()) return 'ID del centro requerido';
    if (!centro.tipo_centro) return 'Selecciona el tipo de centro';
    if (!centro.ruc.trim()) return 'RUC requerido';
    if (!centro.direccion.trim()) return 'Dirección requerida';
    return null;
  };

  const validarPaso2 = () => {
    if (!admin.nombre_completo.trim()) return 'Ingresa el nombre del Admin';
    if (!admin.dni.trim()) return 'Documento requerido';
    if (admin.esLicenciado && !admin.numero_colegiatura.trim()) return 'CTMP requerido para licenciado';
    if (!admin.email) return 'Email no generado. Revisa dominio';
    if (admin.password.length < 6) return 'Contraseña debe tener al menos 6 caracteres';
    return null;
  };

  const siguiente = () => {
    setError('');
    const err = paso === 1 ? validarPaso1() : validarPaso2();
    if (err) { setError(err); return; }
    setPaso(paso + 1);
  };

  const crearTodo = async () => {
    setError('');
    setCargando(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sesión expirada. Vuelve a iniciar sesión.');

      const res = await fetch(`${SUPABASE_URL}/functions/v1/super-processor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          centro: {
            id: centro.id.toUpperCase(),
            nombre: centro.nombre,
            tipo_centro: centro.tipo_centro,
            ruc: centro.ruc,
            direccion: centro.direccion,
            telefono: centro.telefono,
            email_empresa: centro.email_empresa,
            dominio: centro.dominio,
            logo_url: `https://raw.githubusercontent.com/CJPANTA/cj-project/main/frontend/public/logos_centros/${centro.id.toUpperCase()}000.png`,
          },
          admin: {
            nombre_completo: admin.nombre_completo,
            email: admin.email,
            password: admin.password,
            telefono: admin.telefono,
            tipo_documento: admin.tipo_documento,
            dni: admin.dni,
            numero_colegiatura: admin.esLicenciado ? admin.numero_colegiatura : null,
            nickname: admin.nickname,
          },
          prueba_dias: admin.prueba_dias,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Error al crear');

      setExito({
        centro_id: data.centro_id,
        email: data.email,
        password: data.password,
        nombre_centro: centro.nombre,
        nombre_admin: admin.nombre_completo,
        telefono_admin: admin.telefono,
      });
      onCreado?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  const mensajeWhatsApp = exito
    ? `¡Hola ${exito.nombre_admin.split(' ')[0]}! 👋\n\nTu acceso al sistema CJ Fisioterapia ya está listo para *${exito.nombre_centro}*:\n\n📧 Email: ${exito.email}\n🔑 Contraseña de acceso: ${exito.password}\n\n🔗 Ingresa aquí: https://cj-project-86im.vercel.app\n\nCualquier consulta o soporte técnico, escríbele al Director General.\n\n¡Bienvenido a bordo! 🚀\n— Equipo CJ Fisioterapia`
    : '';

  const copiarMensaje = () => {
    navigator.clipboard.writeText(mensajeWhatsApp);
    alert('✅ Mensaje copiado al portapapeles');
  };

  const abrirWhatsApp = () => {
    const tel = (exito?.telefono_admin || '').replace(/\D/g, '');
    const base = tel ? `https://wa.me/51${tel}` : 'https://wa.me/';
    window.open(`${base}?text=${encodeURIComponent(mensajeWhatsApp)}`, '_blank');
  };

  if (exito) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
        <div className={`w-full max-w-lg rounded-3xl border p-6 shadow-2xl my-8 ${bgModal}`}>
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className={`text-2xl font-black ${textoPrincipal}`}>¡Todo creado!</h2>
            <p className={`text-sm ${textoSecundario} mt-1`}>
              {exito.nombre_centro} · {exito.centro_id}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#22d3ee]/5 border border-[#22d3ee]/30 mb-4">
            <p className={`text-[10px] font-bold uppercase ${textoSecundario} mb-2`}>Credenciales del Admin</p>
            <div className="space-y-2">
              <div>
                <p className={`text-[10px] ${textoSecundario}`}>Email</p>
                <p className={`text-sm font-mono ${textoPrincipal} break-all`}>{exito.email}</p>
              </div>
              <div>
                <p className={`text-[10px] ${textoSecundario}`}>Contraseña de acceso</p>
                <p className={`text-sm font-mono ${textoPrincipal}`}>{exito.password}</p>
              </div>
              <div>
                <p className={`text-[10px] ${textoSecundario}`}>Teléfono de contacto</p>
                <p className={`text-sm font-mono ${textoPrincipal}`}>{exito.telefono_admin || 'No registrado'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <button onClick={copiarMensaje} className={`px-4 py-2.5 rounded-xl text-xs font-bold border ${temaOscuro ? 'border-gray-600 hover:bg-gray-700/30' : 'border-gray-300 hover:bg-gray-100'} ${textoPrincipal}`}>
              📋 Copiar mensaje
            </button>
            <button onClick={abrirWhatsApp} className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600">
              💬 Enviar por WhatsApp
            </button>
          </div>

          <div className={`p-3 rounded-xl ${temaOscuro ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'} mb-4`}>
            <p className="text-[10px] text-yellow-500 font-bold">
              ⚠️ Esta contraseña no se puede volver a mostrar. Cópiala o envíala ahora.
            </p>
          </div>

          <button onClick={onCerrar} className="w-full px-4 py-3 bg-[#22d3ee] text-black font-black rounded-xl text-sm hover:scale-[1.02] transition-all">
            ✓ Listo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className={`w-full max-w-2xl rounded-3xl border p-6 shadow-2xl my-8 ${bgModal}`}>

        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className={`text-2xl font-black ${textoPrincipal}`}>🚀 Onboarding Manual</h2>
            <p className={`text-xs ${textoSecundario} mt-1`}>Centro + Admin en un solo paso</p>
          </div>
          <button onClick={onCerrar} className={`${textoSecundario} hover:text-red-400 text-xl`}>✕</button>
        </div>

        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="flex-1">
              <div className={`h-1.5 rounded-full transition-all ${paso >= n ? 'bg-[#22d3ee]' : temaOscuro ? 'bg-gray-700' : 'bg-gray-200'}`} />
              <p className={`text-[9px] font-bold uppercase mt-1.5 ${paso >= n ? 'text-[#22d3ee]' : textoSecundario}`}>
                {n === 1 ? 'Centro' : n === 2 ? 'Admin Centro' : 'Confirmar'}
              </p>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
            ⚠️ {error}
          </div>
        )}

        {paso === 1 && (
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Nombre del centro *</label>
              <input type="text" placeholder="Ej: Clínica San Juan" value={centro.nombre} onChange={e => setCentro({ ...centro, nombre: e.target.value })} className={inputClass} autoFocus />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>ID (código) *</label>
                <input type="text" placeholder="CSJ" value={centro.id} onChange={e => setCentro({ ...centro, id: e.target.value.toUpperCase(), idManual: true })} className={`${inputClass} font-mono`} />
              </div>
              <div>
                <label className={labelClass}>Dominio correos *</label>
                <input type="text" placeholder="sanjuan" value={centro.dominio} onChange={e => setCentro({ ...centro, dominio: e.target.value.toLowerCase() })} className={`${inputClass} font-mono`} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Tipo de centro *</label>
              <select value={centro.tipo_centro} onChange={e => setCentro({ ...centro, tipo_centro: e.target.value })} className={`${inputClass} cursor-pointer`}>
                {TIPOS.map(t => <option key={t.valor} value={t.valor}>{t.label}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>RUC *</label>
              <input type="text" placeholder="20123456789" value={centro.ruc} onChange={e => setCentro({ ...centro, ruc: e.target.value })} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Dirección *</label>
              <input type="text" placeholder="Av. Los Álamos 123, Lima" value={centro.direccion} onChange={e => setCentro({ ...centro, direccion: e.target.value })} className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>Teléfono</label>
                <input type="tel" placeholder="987654321" value={centro.telefono} onChange={e => setCentro({ ...centro, telefono: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email empresa</label>
                <input type="email" placeholder="contacto@clinica.com" value={centro.email_empresa} onChange={e => setCentro({ ...centro, email_empresa: e.target.value })} className={inputClass} />
              </div>
            </div>
          </div>
        )}

        {paso === 2 && (
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Nombre completo del Admin *</label>
              <input type="text" placeholder="Ej: Nombres y Apellidos" value={admin.nombre_completo} onChange={e => setAdmin({ ...admin, nombre_completo: e.target.value })} className={inputClass} autoFocus />
              <p className={`text-[9px] ${textoSecundario} mt-1`}>El email se genera automáticamente del nombre</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className={labelClass}>Tipo *</label>
                <select value={admin.tipo_documento} onChange={e => setAdmin({ ...admin, tipo_documento: e.target.value })} className={`${inputClass} cursor-pointer`}>
                  <option value="DNI">DNI</option>
                  <option value="CE">CE</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Número *</label>
                <input type="text" placeholder="00000000" value={admin.dni} onChange={e => setAdmin({ ...admin, dni: e.target.value })} className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Tipo de profesional *</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setAdmin({ ...admin, esLicenciado: true })} className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${admin.esLicenciado ? 'border-[#22d3ee] bg-[#22d3ee]/20 text-[#22d3ee]' : `border-gray-600 ${textoSecundario}`}`}>
                  🦴 Licenciado (con CTMP)
                </button>
                <button onClick={() => setAdmin({ ...admin, esLicenciado: false, numero_colegiatura: '' })} className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${!admin.esLicenciado ? 'border-[#22d3ee] bg-[#22d3ee]/20 text-[#22d3ee]' : `border-gray-600 ${textoSecundario}`}`}>
                  🔧 Técnico (con DNI)
                </button>
              </div>
            </div>

            {admin.esLicenciado && (
              <div>
                <label className={labelClass}>Número CTMP *</label>
                <input type="text" placeholder="12345" value={admin.numero_colegiatura} onChange={e => setAdmin({ ...admin, numero_colegiatura: e.target.value })} className={inputClass} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>Teléfono</label>
                <input type="tel" placeholder="987654321" value={admin.telefono} onChange={e => setAdmin({ ...admin, telefono: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Nickname</label>
                <input type="text" placeholder="Que nombre quieres" value={admin.nickname} onChange={e => setAdmin({ ...admin, nickname: e.target.value })} className={inputClass} maxLength={15} />
              </div>
            </div>

            <div className={`p-3 rounded-xl border border-[#22d3ee]/30 bg-[#22d3ee]/5`}>
              <label className={labelClass}>📧 Email de acceso (auto)</label>
              <input type="email" value={admin.email} onChange={e => setAdmin({ ...admin, email: e.target.value, emailManual: true })} className={`${inputClass} font-mono`} />
              <p className={`text-[9px] ${textoSecundario} mt-1`}>Editable si necesitas otro formato</p>
            </div>

            <div>
              <label className={labelClass}>Contraseña de acceso *</label>
              <div className="flex gap-2">
                <input type="text" value={admin.password} onChange={e => setAdmin({ ...admin, password: e.target.value })} className={`${inputClass} font-mono flex-1`} />
                <button onClick={() => setAdmin({ ...admin, password: generarPassword() })} className={`px-3 py-2 rounded-xl text-xs font-bold border ${temaOscuro ? 'border-gray-600 hover:bg-gray-700/30' : 'border-gray-300 hover:bg-gray-100'} ${textoPrincipal}`} title="Regenerar contraseña">🎲</button>
              </div>
            </div>

            <div>
              <label className={labelClass}>Días de prueba gratuita</label>
              <div className="flex gap-2">
                {[7, 14, 30].map(d => (
                  <button key={d} onClick={() => setAdmin({ ...admin, prueba_dias: d })} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${admin.prueba_dias === d ? 'border-[#22d3ee] bg-[#22d3ee]/20 text-[#22d3ee]' : `border-gray-600 ${textoSecundario}`}`}>
                    {d} días
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {paso === 3 && (
          <div className="space-y-3">
            <div className={`p-4 rounded-xl border ${temaOscuro ? 'bg-[#0f1a24] border-gray-700' : 'bg-gray-50 border-gray-300'}`}>
              <p className={`text-[10px] font-bold uppercase ${textoSecundario} mb-2`}>🏥 Centro</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className={textoSecundario}>Nombre:</span> <span className={textoPrincipal}>{centro.nombre}</span></div>
                <div><span className={textoSecundario}>ID:</span> <span className={`${textoPrincipal} font-mono`}>{centro.id}</span></div>
                <div><span className={textoSecundario}>RUC:</span> <span className={textoPrincipal}>{centro.ruc}</span></div>
                <div><span className={textoSecundario}>Tipo:</span> <span className={textoPrincipal}>{TIPOS.find(t => t.valor === centro.tipo_centro)?.label}</span></div>
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${temaOscuro ? 'bg-[#0f1a24] border-gray-700' : 'bg-gray-50 border-gray-300'}`}>
              <p className={`text-[10px] font-bold uppercase ${textoSecundario} mb-2`}>👤 Admin Centro</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="col-span-2"><span className={textoSecundario}>Nombre:</span> <span className={textoPrincipal}>{admin.nombre_completo}</span></div>
                <div className="col-span-2"><span className={textoSecundario}>Email:</span> <span className={`${textoPrincipal} font-mono`}>{admin.email}</span></div>
                <div className="col-span-2"><span className={textoSecundario}>Contraseña:</span> <span className={`${textoPrincipal} font-mono`}>{admin.password}</span></div>
                <div><span className={textoSecundario}>Tipo:</span> <span className={textoPrincipal}>{admin.esLicenciado ? 'Licenciado' : 'Técnico'}</span></div>
                <div><span className={textoSecundario}>Prueba:</span> <span className={textoPrincipal}>{admin.prueba_dias} días</span></div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30">
              <p className={`text-[10px] font-bold text-blue-400`}>
                ℹ️ Al confirmar: se crea el centro en modo PRUEBA, se crea el usuario Admin aprobado, y se le asigna al centro. Al terminar verás las credenciales para copiar o enviar por WhatsApp.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between gap-2 mt-6">
          <button onClick={() => paso === 1 ? onCerrar() : setPaso(paso - 1)} disabled={cargando} className={`px-5 py-2.5 rounded-xl text-sm font-bold border ${temaOscuro ? 'border-gray-600 hover:bg-gray-700/30' : 'border-gray-300 hover:bg-gray-100'} ${textoPrincipal} disabled:opacity-50`}>
            {paso === 1 ? 'Cancelar' : '← Atrás'}
          </button>

          {paso < 3 ? (
            <button onClick={siguiente} className="px-6 py-2.5 bg-[#22d3ee] text-black font-black rounded-xl text-sm hover:scale-105 transition-all">
              Siguiente →
            </button>
          ) : (
            <button onClick={crearTodo} disabled={cargando} className="px-6 py-2.5 bg-emerald-500 text-white font-black rounded-xl text-sm hover:scale-105 transition-all disabled:opacity-50">
              {cargando ? '⏳ Creando...' : '✅ Crear Centro + Admin'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}