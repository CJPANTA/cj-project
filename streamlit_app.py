import streamlit as st
import pandas as pd
import os
import datetime
import unicodedata
import base64
import random
from supabase import create_client, Client

# --- 1. CONFIGURACIÓN DE PÁGINA ---
st.set_page_config(page_title="Ecosistema CJ | Fisioterapia", page_icon="logos_cj_circular.png", layout="wide")

# --- PARCHE DE LIMPIEZA VISUAL (PANTALLA LIMPIA PARA CELULAR) ---
st.markdown('''
    <style>
        #MainMenu {visibility: hidden;} 
        footer {visibility: hidden;} 
        .stDeployButton {display: none !important;}
        [data-testid="stAppDeployButton"] {display: none !important;}
        div[class^="viewerBadge"] {display: none !important;}
        .block-container {padding-top: 3rem; padding-bottom: 0rem;}
    </style>
''', unsafe_allow_html=True)

# --- 2. FUNCIONES AUXILIARES (BLINDADAS) ---
def quitar_tildes(texto):
    if not isinstance(texto, str): return str(texto)
    return "".join(c for c in unicodedata.normalize('NFD', texto) if unicodedata.category(c) != 'Mn')

# --- CONEXIÓN A SUPABASE ---
@st.cache_resource
def init_connection():
    url = st.secrets["SUPABASE_URL"]
    key = st.secrets["SUPABASE_KEY"]
    return create_client(url, key)

try:
    supabase = init_connection()
except Exception as e:
    st.error(f"Error de conexión a la Base de Datos: {e}")

def busqueda_inteligente(df, termino):
    if not termino: return df
    terminos = quitar_tildes(termino).lower().split()
    def coincide(fila):
        texto_fila = quitar_tildes(" ".join([str(val) for val in fila.values])).lower()
        return all(t in texto_fila for t in terminos)
    return df[df.apply(coincide, axis=1)]

def obtener_pdf_local(ruta_archivo):
    """Lee el archivo localmente para que la descarga sea infalible"""
    if os.path.exists(ruta_archivo):
        with open(ruta_archivo, "rb") as f:
            return f.read()
    return None

def visor_pdf_limpio(url_cruda):
    """Usa el motor de Google Docs como traductor limpio"""
    url_visor = f"https://docs.google.com/viewer?url={url_cruda}&embedded=true"
    st.markdown(f'''
        <div style="border:2px solid #00B4D8; border-radius:10px; margin-top:15px; overflow:hidden;">
            <iframe src="{url_visor}" width="100%" height="800px" style="border:none;"></iframe>
        </div>
    ''', unsafe_allow_html=True)

# --- 3. RUTAS DE ARCHIVOS LOCALES (EL MAPA) ---
BASE_PATH = os.path.dirname(__file__)
RUTA_CARRION = os.path.join(BASE_PATH, "BASE_DATOS", "01_CARRION")
RUTA_MUSCULOS = os.path.join(BASE_PATH, "BASE_DATOS", "03_CONFIG", "musculos_maestro.csv")
RUTA_HUESOS = os.path.join(BASE_PATH, "BASE_DATOS", "03_CONFIG", "huesos_maestro.csv")
RUTA_DIC = os.path.join(BASE_PATH, "BASE_DATOS", "03_CONFIG", "diccionario_maestro.csv")
RUTA_MASO = os.path.join(BASE_PATH, "BASE_DATOS", "03_CONFIG", "masoterapia_maestro.csv")
RUTA_PATOLOGIAS = os.path.join(BASE_PATH, "BASE_DATOS", "03_CONFIG", "patologias_maestro.csv")
RUTA_LIBROS_CSV = os.path.join(BASE_PATH, "BASE_DATOS", "03_CONFIG", "libros_maestro.csv")

# --- 4. CONEXIÓN A SUPABASE ---
try:
    supabase: Client = create_client(st.secrets["SUPABASE_URL"], st.secrets["SUPABASE_KEY"])
except Exception as e:
    st.error(f"Error de conexión con la nube: {e}")
    st.stop()

# --- 5. ESCUDO DE PERSISTENCIA (TOKEN EN URL) ---
if "autenticado" not in st.session_state:
    st.session_state.autenticado = False

# Rescate instantáneo si presionas F5
if not st.session_state.autenticado and "session_token" in st.query_params:
    try:
        token = st.query_params["session_token"]
        correo_recuperado = base64.b64decode(token).decode("utf-8")
        res = supabase.table("usuarios").select("*").eq("correo", correo_recuperado).execute()
        if res.data:
            user = res.data[0]
            if user['rol'] != "Pendiente":
                st.session_state.autenticado = True
                st.session_state.rol = user['rol']
                st.session_state.usuario_nombre = user.get('nombre', correo_recuperado)
                st.rerun()
    except:
        pass

# --- 6. PANTALLA DE LOGIN Y REGISTRO ---
def pantalla_login():
    st.write("<br><br>", unsafe_allow_html=True)
    c1, c2, c3 = st.columns([1, 2, 1])
    with c2:
        if os.path.exists("logo_cj.jpg"):
            st.image("logo_cj.jpg", use_container_width=True)
        st.markdown('<h2 style="color:#00B4D8; text-align:center;">ACCESO AL SISTEMA</h2>', unsafe_allow_html=True)
        
        with st.form("form_login_cj"):
            email = st.text_input("Correo Electrónico").strip()
            pw = st.text_input("Contraseña", type="password").strip()
            if st.form_submit_button("🔓 INICIAR SESIÓN", use_container_width=True):
                res = supabase.table("usuarios").select("*").eq("correo", email).eq("password", pw).execute()
                if res.data:
                    u = res.data[0]
                    if u['rol'] == "Pendiente":
                        st.warning("⏳ Tu cuenta está en revisión por el administrador.")
                    else:
                        st.session_state.autenticado = True
                        st.session_state.rol = u['rol']
                        st.session_state.usuario_nombre = u.get('nombre', email)
                        # CREAMOS EL ESCUDO F5 AQUI
                        token = base64.b64encode(email.encode("utf-8")).decode("utf-8")
                        st.query_params["session_token"] = token
                        st.rerun()
                else:
                    st.error("❌ Credenciales incorrectas.")
        
        st.markdown("<hr style='opacity:0.2;'>", unsafe_allow_html=True)
        with st.expander("📝 ¿ERES NUEVO? SOLICITAR ACCESO AQUÍ"):
            with st.form("form_registro_nuevo"):
                new_nombre = st.text_input("Nombre Completo")
                new_email = st.text_input("Correo Electrónico").strip()
                new_pw = st.text_input("Crea tu Contraseña", type="password").strip()
                
                if st.form_submit_button("ENVIAR SOLICITUD", use_container_width=True):
                    if new_nombre and new_email and new_pw:
                        try:
                            supabase.table("usuarios").insert({
                                "nombre": new_nombre.strip(), 
                                "correo": new_email, 
                                "password": new_pw, 
                                "rol": "Pendiente"
                            }).execute()
                            st.success("✅ ¡Solicitud enviada! Avisa al administrador.")
                        except:
                            st.error("❌ Ese correo ya existe o hubo un error en la nube.")
                    else:
                        st.warning("Completa todos los campos.")

# --- BARRERA DE SEGURIDAD (Si no está autenticado, detiene la app aquí) ---
if not st.session_state.autenticado:
    pantalla_login()
    st.stop()

# ====================================================================
# --- 7. SIDEBAR Y MENÚ (Zona segura) ---
# ====================================================================

with st.sidebar:
        if os.path.exists("logo_cj.jpg"): st.image("logo_cj.jpg")
        st.markdown(f"""
        <div style="background:#0f172a; padding:10px; border-radius:8px; border:1px solid #00B4D8; text-align:center;">
            <p style="margin:0; font-size:12px;">Usuario: <b>{st.session_state.usuario_nombre}</b></p>
            <p style="margin:0; font-size:11px; color:#00B4D8;">ROL: {str(st.session_state.rol).upper()}</p>
        </div>
        """, unsafe_allow_html=True)
        
        # 1. ORDEN MAESTRO EXACTO
        orden_maestro = [
            "🏠 INICIO",
            "📚 BIBLIOTECA DE LIBROS",
            "📖 REPOSITORIO CARRION", 
            "🎓 REPASO CICLOS V-VI", 
            "🦴 DICCIONARIO TÉCNICO", 
            "🎮 MODO EXAMEN", 
            "🏥 PATOLOGÍAS", 
            "📝 FICHA CLÍNICA", 
            "📋 EXPEDIENTES",
            "💆 MASOTERAPIA",
            "🖼️ MULTIMEDIA Y REDES",
            "👥 GESTIÓN DE USUARIOS"
        ]
        
        # 2. ASIGNACIÓN DE PERMISOS POR ROL
        permisos = ["🏠 INICIO"]
        rol = st.session_state.rol
        
        if rol in ["Estudiante", "Hibrido", "Administrador"]:
            permisos.extend(["🎮 MODO EXAMEN", "📖 REPOSITORIO CARRION", "📚 BIBLIOTECA DE LIBROS", "🦴 DICCIONARIO TÉCNICO", "🖼️ MULTIMEDIA Y REDES"])
            
        if rol in ["Colaborador", "Hibrido", "Administrador"]:
            permisos.extend(["🏥 PATOLOGÍAS", "📝 FICHA CLÍNICA", "📋 EXPEDIENTES", "🖼️ MULTIMEDIA Y REDES"])
            
        if rol == "Administrador":
            permisos.extend(["💆 MASOTERAPIA", "👥 GESTIÓN DE USUARIOS"])

        # 3. CONSTRUCTOR DEL MENÚ
        menu_final = [opcion for opcion in orden_maestro if opcion in permisos]
        menu = st.radio("SECCIONES AUTORIZADAS:", menu_final)
        
        st.divider()
        st.link_button("💡 Buzón de Sugerencias", "https://forms.gle/LP5k11Bm5aBGD2Tm8", use_container_width=True)
        
        if st.button("🚪 CERRAR SESIÓN"):
            st.session_state.autenticado = False
            st.rerun()

# ====================================================================
# --- 8. MÓDULOS DE LA APLICACIÓN ---
# ====================================================================

# --- 6. VISTAS DEL SISTEMA ---
if menu == "🏠 INICIO":
        # --- 1. CARGA DE DATOS PARA CONTADORES Y ORÁCULO ---
        ruta_base = "BASE_DATOS/03_CONFIG/"
        
        @st.cache_data
        def cargar_datos_mando(archivo):
            try:
                try: return pd.read_csv(f"{ruta_base}{archivo}", sep=";", encoding="utf-8-sig")
                except: return pd.read_csv(f"{ruta_base}{archivo}", sep=";", encoding="latin-1")
            except: return pd.DataFrame()

        df_h_full = cargar_datos_mando("huesos_maestro.csv")
        df_m_full = cargar_datos_mando("musculos_maestro.csv")
        df_p_full = cargar_datos_mando("patologias_maestro.csv")

        # --- 2. GESTIÓN DE VISTA INTERNA ---
        if 'sub_vista' not in st.session_state:
            st.session_state.sub_vista = "Principal"

        def ir_a(vista):
            st.session_state.sub_vista = vista

        # --- 3. CABECERA DE ESTADO ---
        st.markdown(f"""
            <div style="background-color: #065F46; padding: 10px; border-radius: 8px; text-align: center; margin-bottom: 15px; border: 1px solid #10B981;">
                <span style="color: #A7F3D0; font-weight: bold;">🟢 SISTEMA CJ ACTIVO:</span> 
                <span style="color: #FFFFFF; font-size: 14px;"> Conectado a Repositorio Global (Ciclos 1-4)</span>
            </div>
        """, unsafe_allow_html=True)

        # ==========================================
        # VISTA A: CENTRO DE MANDO
        # ==========================================
        if st.session_state.sub_vista == "Principal":
            st.title("⚙️ Centro de Mando CJ")
            
            # --- EL ORÁCULO GLOBAL ---
            with st.container(border=True):
                st.subheader("🔮 El Oráculo")
                busqueda = st.text_input("Buscador Inteligente:", placeholder="Ej: Fémur, Deltoides, Lumbalgia...")
                
                if busqueda:
                    res_h = busqueda_inteligente(df_h_full, busqueda) if not df_h_full.empty else pd.DataFrame()
                    res_m = busqueda_inteligente(df_m_full, busqueda) if not df_m_full.empty else pd.DataFrame()
                    res_p = busqueda_inteligente(df_p_full, busqueda) if not df_p_full.empty else pd.DataFrame()

                    if not res_h.empty or not res_m.empty or not res_p.empty:
                        for _, r in res_h.head(2).iterrows():
                            st.info(f"🦴 **Hueso:** {str(r.iloc[2]).upper()} ({r['Region']})")
                        for _, r in res_m.head(2).iterrows():
                            st.success(f"💪 **Músculo:** {str(r.iloc[2]).upper()} ({r['Region']})")
                        for _, r in res_p.head(2).iterrows():
                            st.warning(f"🩺 **Patología:** {str(r.iloc[1]).upper()} ({r['Region']})")
                    else:
                        st.error("Sin coincidencias en la base de datos.")

            st.markdown("### Bases de Datos en Tiempo Real")
            
            # ✨ MAGIA RECUPERADA: ESTILO DE BOTONES GIGANTES ✨
            st.markdown("""
                <style>
                div.stButton > button {
                    height: 140px; border-radius: 12px; border: 1px solid #3B82F6;
                    background-color: #1E293B; color: white; font-size: 18px; font-weight: bold;
                    line-height: 1.2; transition: 0.3s;
                }
                div.stButton > button:hover { border-color: #FACC15; background-color: #0F172A; }
                </style>
            """, unsafe_allow_html=True)

            c_h, c_m, c_p = len(df_h_full), len(df_m_full), len(df_p_full)
            col_a, col_b, col_c = st.columns(3)
            with col_a:
                if st.button(f"🦴\nBASE ÓSEA\n({c_h} Huesos)", use_container_width=True):
                    ir_a("Huesos"); st.rerun()
            with col_b:
                if st.button(f"💪\nATLAS MUSCULAR\n({c_m} Músculos)", use_container_width=True):
                    ir_a("Musculos"); st.rerun()
            with col_c:
                if st.button(f"🩺\nGUÍA CLÍNICA\n({c_p} Patologías)", use_container_width=True):
                    ir_a("Patologias"); st.rerun()

            st.divider()

            # ✨ MAGIA RECUPERADA: TARJETAS 3D FLIP ✨
            st.markdown("### Recursos Complementarios")
            st.markdown("""
                <style>
                .flip-card { background-color: transparent; width: 100%; height: 180px; perspective: 1000px; }
                .flip-card-inner { position: relative; width: 100%; height: 100%; text-align: center; transition: transform 0.6s; transform-style: preserve-3d; }
                .flip-card:hover .flip-card-inner { transform: rotateY(180deg); }
                .flip-card-front, .flip-card-back { position: absolute; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; border-radius: 15px; padding: 20px; display: flex; flex-direction: column; justify-content: center; align-items: center; border: 1px solid #4B5563; }
                .flip-card-front { background-color: #111827; color: white; }
                .flip-card-back { background-color: #1e3a8a; color: white; transform: rotateY(180deg); }
                </style>
            """, unsafe_allow_html=True)

            c1, c2, c3 = st.columns(3)
            with c1:
                st.markdown('<div class="flip-card"><div class="flip-card-inner"><div class="flip-card-front"><h3>📚 Biblioteca</h3><p>Libros y 4 Ciclos</p></div><div class="flip-card-back"><h4>VE A REPOSITORIO</h4><p>Material Carrión</p></div></div></div>', unsafe_allow_html=True)
            with c2:
                st.markdown('<div class="flip-card"><div class="flip-card-inner"><div class="flip-card-front"><h3>📖 Conceptos</h3><p>Diccionario Técnico</p></div><div class="flip-card-back"><h4>100 TÉRMINOS</h4><p>Usa el menú lateral</p></div></div></div>', unsafe_allow_html=True)
            with c3:
                st.markdown('<div class="flip-card"><div class="flip-card-inner"><div class="flip-card-front"><h3>🔬 Evidencia</h3><p>Artículos Científicos</p></div><div class="flip-card-back"><h4>SUGIÉREME</h4><p>Revistas - En crecimiento</p></div></div></div>', unsafe_allow_html=True)

        # ==========================================
        # VISTA B: FILTROS (DISEÑO UI/UX AVANZADO)
        # ==========================================
        elif st.session_state.sub_vista == "Huesos":
            st.markdown("<style>div.stButton > button { height: auto; font-size: 16px; }</style>", unsafe_allow_html=True)
            if st.button("⬅️ Regresar"): ir_a("Principal"); st.rerun()
            st.title("🦴 Explorador Óseo")
            div_h = st.radio("División:", ["Axial", "Apendicular"], horizontal=True)
            reg_h = st.selectbox("Selecciona Región:", df_h_full['Region'].unique() if not df_h_full.empty else [])
            res_h = df_h_full[df_h_full['Region'] == reg_h] if not df_h_full.empty else pd.DataFrame()
            for _, row in res_h.iterrows():
                with st.expander(f"🦴 {str(row.iloc[2]).upper()}"):
                    cols = st.columns(2)
                    for i, (k, v) in enumerate(row.items()):
                        if pd.notna(v) and k not in ['ID', 'Region']:
                            cols[i % 2].markdown(f"**{k.replace('_',' ')}:** {v}")

        elif st.session_state.sub_vista == "Musculos":
            st.markdown("<style>div.stButton > button { height: auto; font-size: 16px; }</style>", unsafe_allow_html=True)
            if st.button("⬅️ Regresar"): ir_a("Principal"); st.rerun()
            st.title("💪 Atlas Muscular")
            reg_m = st.selectbox("Región Corporal:", df_m_full['Region'].unique() if not df_m_full.empty else [])
            res_m = df_m_full[df_m_full['Region'] == reg_m] if not df_m_full.empty else pd.DataFrame()
            for _, row in res_m.iterrows():
                with st.expander(f"💪 {str(row.iloc[2]).upper()}"):
                    cols = st.columns(2)
                    for i, (k, v) in enumerate(row.items()):
                        if pd.notna(v) and k not in ['ID', 'Region']:
                            cols[i % 2].markdown(f"**{k.replace('_',' ')}:** {v}")

        elif st.session_state.sub_vista == "Patologias":
            st.markdown("<style>div.stButton > button { height: auto; font-size: 16px; }</style>", unsafe_allow_html=True)
            if st.button("⬅️ Regresar"): ir_a("Principal"); st.rerun()
            st.title("🩺 Guía de Patologías")
            reg_p = st.selectbox("Zona de Dolor:", df_p_full['Region'].unique() if not df_p_full.empty else [])
            res_p = df_p_full[df_p_full['Region'] == reg_p] if not df_p_full.empty else pd.DataFrame()
            for _, row in res_p.iterrows():
                with st.expander(f"🏥 {str(row.iloc[1]).upper()}"):
                    cols = st.columns(2)
                    for i, (k, v) in enumerate(row.items()):
                        if pd.notna(v) and k not in ['ID', 'Region']:
                            cols[i % 2].markdown(f"**{k.replace('_',' ')}:** {v}")

elif menu == "🖼️ MULTIMEDIA Y REDES":
    # --- CSS PERSONALIZADO PARA TARJETAS UNIFORMES Y LINKS ---
    st.markdown("""
        <style>
        /* Contenedor de la Tarjeta Multimedia */
        .card-container {
            perspective: 1000px;
            width: 100%;
            height: 250px;
            margin-bottom: 20px;
        }
        .card-inner {
            position: relative;
            width: 100%;
            height: 100%;
            text-align: center;
            transition: transform 0.6s;
            transform-style: preserve-3d;
            cursor: pointer;
        }
        .card-container:hover .card-inner { transform: rotateY(180deg); }
        .card-front, .card-back {
            position: absolute;
            width: 100%;
            height: 100%;
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            border-radius: 12px;
            border: 1px solid #3B82F6;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 10px;
        }
        .card-front { background-color: #1E293B; color: white; }
        .card-back { 
            background-color: #0F172A; 
            transform: rotateY(180deg); 
            overflow: hidden;
        }
        .card-back img {
            width: 100%;
            height: 100%;
            object-fit: cover; /* Ajuste uniforme sin deformar */
        }
        
        /* Estilo para las Tarjetas de Enlaces (Links) */
        .link-card {
            background: #1E293B;
            border: 1px solid #00B4D8;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 10px;
            transition: 0.3s;
            text-decoration: none !important;
            display: block;
        }
        .link-card:hover {
            border-color: #FACC15;
            background: #0F172A;
            transform: translateY(-3px);
        }
        .link-title { color: #00B4D8; font-weight: bold; font-size: 16px; margin-bottom: 5px; }
        .link-desc { color: #94A3B8; font-size: 13px; }
        </style>
    """, unsafe_allow_html=True)

    st.title("🖼️ CENTRAL MULTIMEDIA Y REDES")
    st.markdown("Gestión de activos visuales y enlaces dinámicos con visualización uniforme.")
    
    t1, t2 = st.tabs(["📸 Galería de Tarjetas", "🔗 Directorio de Enlaces"])
    
    # --- PESTAÑA 1: GALERÍA DE TARJETAS GIRATORIAS ---
    with t1:
        ruta_multimedia = "BASE_DATOS/05_MULTIMEDIA/"
        
        if os.path.exists(ruta_multimedia):
            archivos = [f for f in os.listdir(ruta_multimedia) if os.path.isfile(os.path.join(ruta_multimedia, f))]
            imagenes = [img for img in archivos if img.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]
            
            if imagenes:
                cols = st.columns(3)
                for i, img_nombre in enumerate(imagenes):
                    with cols[i % 3]:
                        nombre_limpio = img_nombre.split('.')[0].replace('_', ' ').title()
                        path_img = f"{ruta_multimedia}{img_nombre}"
                        
                        # Generamos la Tarjeta Flip (HTML)
                        # Nota: La imagen se carga via base64 para asegurar visualización estable
                        with open(path_img, "rb") as img_file:
                            encoded_img = base64.b64encode(img_file.read()).decode()
                        
                        st.markdown(f"""
                            <div class="card-container">
                                <div class="card-inner">
                                    <div class="card-front">
                                        <div style="font-size: 40px;">🖼️</div>
                                        <div style="margin-top:10px; font-weight:bold;">{nombre_limpio}</div>
                                        <div style="font-size:10px; color:#94A3B8; margin-top:5px;">Pasa el mouse para previsualizar</div>
                                    </div>
                                    <div class="card-back">
                                        <img src="data:image/jpeg;base64,{encoded_img}">
                                    </div>
                                </div>
                            </div>
                        """, unsafe_allow_html=True)
                        
                        # Botón para ver en grande (Lógica Streamlit)
                        with st.popover("🔍 Ver imagen completa", use_container_width=True):
                            st.image(path_img, caption=nombre_limpio)
            else:
                st.warning("No hay imágenes en la carpeta '05_MULTIMEDIA'.")
        else:
            st.error("Ruta de multimedia no encontrada.")

    # --- PESTAÑA 2: ENLACES COMO TARJETAS INTERACTIVAS ---
    with t2:
        st.subheader("Directorio de Enlaces")
        ruta_links = "BASE_DATOS/03_CONFIG/enlaces_maestro.csv"
        
        if os.path.exists(ruta_links):
            try:
                df_links = pd.read_csv(ruta_links, sep=";", encoding="utf-8-sig")
                if not df_links.empty:
                    for _, fila in df_links.iterrows():
                        # Creamos la tarjeta de link personalizada
                        st.markdown(f"""
                            <a href="{fila['link']}" target="_blank" class="link-card">
                                <div class="link-title">🚀 {fila['titulo']}</div>
                                <div class="link-desc">Haga clic para abrir este recurso en una nueva pestaña.</div>
                            </a>
                        """, unsafe_allow_html=True)
                else:
                    st.info("El archivo de enlaces está vacío.")
            except Exception as e:
                st.error(f"Error al leer enlaces: {e}")


# ... tu código de elif menu == "🎮 MODO EXAMEN": o "Fichas Clínicas" sigue aquí ...

elif menu == "🎮 MODO EXAMEN":
    st.markdown('<h1 class="titulo-cj">ARENA DE PRÁCTICA</h1>', unsafe_allow_html=True)
    if 'score' not in st.session_state:
        st.session_state.score = 0
        st.session_state.preguntas = 0
    if 'stats_niveles' not in st.session_state:
        st.session_state.stats_niveles = {"Nivel 1": [0, 0], "Nivel 2": [0, 0], "Nivel 3": [0, 0], "Nivel 4": [0, 0], "Nivel 5": [0, 0]}
    if 'answered' not in st.session_state:
        st.session_state.answered = False

    tab_juego, tab_stats = st.tabs(["📝 LA ARENA", "📈 MI EVOLUCIÓN"])
    
    with tab_juego:
        if os.path.exists(RUTA_MUSCULOS) and os.path.exists(RUTA_HUESOS):
            df_m = pd.read_csv(RUTA_MUSCULOS, sep=';', encoding='latin-1')
            df_h = pd.read_csv(RUTA_HUESOS, sep=';', encoding='latin-1')

            nivel = st.selectbox("Selecciona tu Nivel:", [
                "💀 Nivel 1 (Pollito): Trivia Ósea", 
                "💪 Nivel 2 (Básico): Identidad Muscular", 
                "🐣 Nivel 3 (Intermedio): Orígenes", 
                "📚 Nivel 4 (Avanzado): Inserciones", 
                "🧠 Nivel 5 (Experto): Inervaciones",
                "🚧 (Próximamente) Farmacología y Linfo"
            ])

            nivel_base = "Nivel 1" if "Nivel 1" in nivel else "Nivel 2" if "Nivel 2" in nivel else "Nivel 3" if "Nivel 3" in nivel else "Nivel 4" if "Nivel 4" in nivel else "Nivel 5"

            if "Próximamente" in nivel:
                st.warning("🚧 **¡Área en Construcción!** Estamos preparando el material de Farmacología y Drenaje Linfático.")
            else:
                usar_huesos = "Nivel 1" in nivel

                if 'nivel_actual' not in st.session_state or st.session_state.nivel_actual != nivel:
                    st.session_state.nivel_actual = nivel
                    if 'q_actual' in st.session_state: del st.session_state.q_actual
                    st.session_state.answered = False

                if 'q_actual' not in st.session_state:
                    if usar_huesos:
                        correcto = df_h.sample(1).iloc[0]
                        pista = correcto.get('Pista_Trivia', correcto.iloc[4]) 
                        texto_preg = f"🤔 **Adivinanza:** {pista}"
                        resp_correcta = str(correcto.iloc[2]).upper()
                        opciones_falsas = df_h[df_h.iloc[:, 2] != correcto.iloc[2]].sample(3).iloc[:, 2].tolist()
                        dato_extra = f"🦴 **{resp_correcta}**: Su función biomecánica es: {correcto.iloc[6]}."
                    else:
                        correcto = df_m.sample(1).iloc[0]
                        dato_clinico = correcto.get('Dato_Clinico_Clave', f"Inervado por: {correcto.iloc[5]}")
                        
                        if "Nivel 2" in nivel:
                            texto_preg = f"¿Qué músculo nace en **{correcto.iloc[3]}** y se inserta en **{correcto.iloc[4]}**?"
                            resp_correcta = str(correcto.iloc[2]).upper()
                            opciones_falsas = df_m[df_m.iloc[:, 2] != correcto.iloc[2]].sample(3).iloc[:, 2].tolist()
                            dato_extra = f"💪 **{resp_correcta}**: {dato_clinico}"
                        else:
                            idx = 3 if "Nivel 3" in nivel else 4 if "Nivel 4" in nivel else 5
                            t_p = "el ORIGEN" if idx==3 else "la INSERCIÓN" if idx==4 else "la INERVACIÓN"
                            texto_preg = f"¿Cuál es {t_p} del músculo **{str(correcto.iloc[2]).upper()}**?"
                            resp_correcta = str(correcto.iloc[idx])
                            opciones_falsas = df_m[df_m.iloc[:, 2] != correcto.iloc[2]].sample(3).iloc[:, idx].tolist()
                            dato_extra = f"✅ Dato Clínico: {dato_clinico}"

                    todas_opciones = [str(x).upper() for x in opciones_falsas] + [resp_correcta.upper()]
                    random.shuffle(todas_opciones)
                    st.session_state.q_actual = {'pregunta': texto_preg, 'correcta': resp_correcta.upper(), 'opciones': todas_opciones, 'extra': dato_extra}
                    st.session_state.answered = False

                q = st.session_state.q_actual
                st.markdown(f"<h3 style='text-align: center;'>{q['pregunta']}</h3>", unsafe_allow_html=True)
                st.write("") 

                if not st.session_state.answered:
                    for opcion in q['opciones']:
                        texto_btn = "Sin datos" if pd.isna(opcion) or str(opcion) == "NAN" else str(opcion)
                        if st.button(texto_btn, use_container_width=True, key=opcion):
                            st.session_state.preguntas += 1
                            st.session_state.stats_niveles[nivel_base][1] += 1 
                            if opcion == q['correcta']:
                                st.session_state.score += 1
                                st.session_state.stats_niveles[nivel_base][0] += 1
                            st.session_state.user_choice = opcion
                            st.session_state.answered = True
                            st.rerun() 
                else:
                    if st.session_state.user_choice == q['correcta']:
                        st.success(f"¡CORRECTO! 🎉 {q['extra']}")
                    else:
                        st.error(f"INCORRECTO 💀. Elegiste '{st.session_state.user_choice}'. La respuesta era: **{q['correcta']}**")
                    
                    if st.button("➡️ Siguiente Pregunta", use_container_width=True, type="primary"):
                        del st.session_state.q_actual 
                        st.session_state.answered = False
                        st.rerun()

    with tab_stats:
        st.markdown("### 📈 Tu Rendimiento en esta Sesión")
        c1, c2, c3 = st.columns(3)
        efectividad_total = int((st.session_state.score / st.session_state.preguntas) * 100) if st.session_state.preguntas > 0 else 0
        c1.metric("🎯 Aciertos Totales", st.session_state.score)
        c2.metric("📝 Preguntas Respondidas", st.session_state.preguntas)
        c3.metric("🔥 Efectividad General", f"{efectividad_total}%")
        
        st.progress(efectividad_total / 100.0)
        st.divider()
        
        st.markdown("#### Desglose por Niveles")
        for niv, datos in st.session_state.stats_niveles.items():
            aciertos, intentos = datos[0], datos[1]
            if intentos > 0:
                porcentaje = int((aciertos / intentos) * 100)
                st.write(f"**{niv}**: {aciertos} aciertos de {intentos} intentos ({porcentaje}%)")
                color = "red" if porcentaje < 50 else "orange" if porcentaje < 80 else "green"
                st.markdown(f"""
                <div style="width: 100%; background-color: #122235; border-radius: 5px; margin-bottom: 15px;">
                  <div style="width: {porcentaje}%; height: 15px; background-color: {color}; border-radius: 5px;"></div>
                </div>
                """, unsafe_allow_html=True)
        
        if st.session_state.preguntas == 0:
            st.info("Aún no has respondido ninguna pregunta. ¡Ve a la pestaña de La Arena para empezar!")
            
        st.divider()
        if st.button("🔄 Reiniciar Todas las Estadísticas", use_container_width=True):
            st.session_state.score = 0
            st.session_state.preguntas = 0
            for niv in st.session_state.stats_niveles:
                st.session_state.stats_niveles[niv] = [0, 0]
            if 'q_actual' in st.session_state: del st.session_state.q_actual
            st.session_state.answered = False
            st.rerun()

elif menu == "📖 REPOSITORIO CARRION":
    st.markdown('<h1 class="titulo-cj">REPOSITORIO CARRION</h1>', unsafe_allow_html=True)
    
    if os.path.exists(RUTA_CARRION):
        ciclos = sorted([d for d in os.listdir(RUTA_CARRION) if os.path.isdir(os.path.join(RUTA_CARRION, d))])
        tabs = st.tabs([c.upper() for c in ciclos])
        
        for i, ciclo in enumerate(ciclos):
            with tabs[i]:
                ruta_c = os.path.join(RUTA_CARRION, ciclo)
                mats = sorted([d for d in os.listdir(ruta_c) if os.path.isdir(os.path.join(ruta_c, d))])
                mat_sel = st.selectbox("Materia:", mats, key=f"s_{ciclo}")
                
                ruta_final = os.path.join(ruta_c, mat_sel)
                archs = sorted([f for f in os.listdir(ruta_final) if f.lower().endswith('.pdf')])
                
                if archs:
                    a_ver = st.selectbox("Sesión:", archs, key=f"v_{mat_sel}")
                    ruta_local_pdf = os.path.join(ruta_final, a_ver)
                    
                    # 1. Limpieza de espacios obligatoria para Google
                    c_seguro = ciclo.replace(" ", "%20")
                    m_segura = mat_sel.replace(" ", "%20")
                    a_seguro = a_ver.replace(" ", "%20")
                    
                    # 2. URL cruda directa del servidor de GitHub
                    url_cruda = f"https://raw.githubusercontent.com/CJPANTA/cj-project/main/BASE_DATOS/01_CARRION/{c_seguro}/{m_segura}/{a_seguro}"
                    
                    c1, c2 = st.columns(2)
                    
                    # BOTÓN 1: DESCARGA LOCAL INFALIBLE
                    datos_binarios = obtener_pdf_local(ruta_local_pdf)
                    if datos_binarios:
                        c1.download_button("📥 DESCARGAR PDF", data=datos_binarios, file_name=a_ver, mime="application/pdf", use_container_width=True)
                    else:
                        c1.error("Archivo no encontrado")
                    
                    # BOTÓN 2: VER ONLINE (En la misma página)
                    if c2.button("👁️ VER EN PANTALLA", key=f"btn_ver_{a_ver}", use_container_width=True):
                        st.session_state.pdf_limpio_url = url_cruda
                        st.rerun()
                else:
                    st.info("No hay archivos en esta carpeta.")

        # --- ÁREA DE LECTURA (Limpieza total) ---
        if 'pdf_limpio_url' in st.session_state:
            st.write("---")
            if st.button("❌ CERRAR LECTOR", type="primary", use_container_width=True):
                del st.session_state.pdf_limpio_url
                st.rerun()
            
            # Llamamos al motor de Google Docs
            visor_pdf_limpio(st.session_state.pdf_limpio_url)
            
    else:
        st.error("Carpeta de base de datos no detectada.")

elif menu == "📚 BIBLIOTECA DE LIBROS":
    st.markdown('<h1 class="titulo-cj">ESTANTERÍA VIRTUAL CJ</h1>', unsafe_allow_html=True)
    
    RUTA_SISTEMAS = os.path.join(BASE_PATH, "BASE_DATOS", "02_SISTEMAS")

    if os.path.exists(RUTA_LIBROS_CSV):
        try:
            df_libros = pd.read_csv(RUTA_LIBROS_CSV, sep=';', encoding='latin-1', on_bad_lines='skip').fillna("")
            busq_libro = st.text_input("🔍 Buscar libro o autor:")
            
            res_libros = busqueda_inteligente(df_libros, busq_libro) if busq_libro else df_libros
            
            cols_grid = st.columns(2)
            
            for idx, libro in res_libros.iterrows():
                with cols_grid[idx % 2]:
                    with st.container(border=True):
                        filas = libro.tolist()
                        titulo_raw = str(filas[0]).strip()
                        autor = str(filas[1]).strip()
                        cat = str(filas[3]).strip()
                        
                        titulo_limpio = titulo_raw.replace('.pdf', '').replace('_', ' ')
                        st.markdown(f"<p style='color:#00B4D8; font-weight:bold; margin-bottom:0; font-size:18px;'>📖 {titulo_limpio}</p>", unsafe_allow_html=True)
                        st.caption(f"👤 {autor} | 🏷️ {cat}")

                        es_pesado = "netter" in titulo_raw.lower() or "atlas" in titulo_raw.lower()
                        
                        nombre_pdf = titulo_raw if titulo_raw.lower().endswith('.pdf') else f"{titulo_raw}.pdf"
                        ruta_fisica = os.path.join(RUTA_SISTEMAS, nombre_pdf)

                        # Enlaces para el motor interno y descarga
                        a_seguro = nombre_pdf.replace(" ", "%20")
                        url_cruda = f"https://raw.githubusercontent.com/CJPANTA/cj-project/main/BASE_DATOS/02_SISTEMAS/{a_seguro}"

                        if os.path.exists(ruta_fisica):
                            c1, c2 = st.columns(2)
                            
                            # BOTÓN 1: Descarga
                            pdf_bin = obtener_pdf_local(ruta_fisica)
                            c1.download_button("📥 DESCARGAR", data=pdf_bin, file_name=nombre_pdf, mime="application/pdf", key=f"dl_{idx}", use_container_width=True)
                            
                            # BOTÓN 2: Leer (Vuelve a ser integrado)
                            if c2.button("👁️ LEER", key=f"view_{idx}", use_container_width=True):
                                st.session_state.pdf_limpio_url = url_cruda
                                st.rerun()
                            
                            if es_pesado:
                                st.markdown("<div style='background:#342a12; padding:8px; border-radius:5px; border-left:4px solid #f4d06f;'><p style='margin:0; font-size:11px; color:#f4d06f;'>⚠️ <b>VERSIÓN PESADA:</b> Si no carga en pantalla, usa el botón DESCARGAR.</p></div>", unsafe_allow_html=True)
                        else:
                            st.error(f"Archivo no encontrado en /02_SISTEMAS")

        except Exception as e:
            st.error(f"Error en estantería: {e}")
            
        # --- ÁREA DE LECTURA (EL VISOR QUE REVIVE) ---
        if 'pdf_limpio_url' in st.session_state:
            st.write("---")
            if st.button("❌ CERRAR LECTOR", type="primary", use_container_width=True):
                del st.session_state.pdf_limpio_url
                st.rerun()
            
            # Llamamos al motor que ya funcionó en el repositorio
            visor_pdf_limpio(st.session_state.pdf_limpio_url)
            
    else:
        st.error("No se encontró libros_maestro.csv")

elif menu == "🦴 DICCIONARIO TÉCNICO":
    st.markdown('<h1 class="titulo-cj">DICCIONARIO MAESTRO</h1>', unsafe_allow_html=True)
    
    css_tarjetas = """
    <style>
    .flip-card {
      background-color: transparent;
      width: 100%;
      height: 220px;
      perspective: 1000px;
      margin-bottom: 20px;
    }
    .flip-card-inner {
      position: relative;
      width: 100%;
      height: 100%;
      text-align: center;
      transition: transform 0.6s;
      transform-style: preserve-3d;
      cursor: pointer;
    }
    .flip-card:hover .flip-card-inner, .flip-card:active .flip-card-inner {
      transform: rotateY(180deg);
    }
    .flip-card-front, .flip-card-back {
      position: absolute;
      width: 100%;
      height: 100%;
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
      border-radius: 15px;
      padding: 15px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      box-shadow: 0 4px 8px 0 rgba(0,0,0,0.5);
    }
    .flip-card-front {
      background-color: #122235;
      border: 2px solid #00B4D8;
    }
    .flip-card-back {
      background-color: #00B4D8;
      color: #122235;
      transform: rotateY(180deg);
      border: 2px solid #F4D06F;
      overflow-y: auto;
    }
    .titulo-tarjeta {
        color: #F4D06F;
        font-size: 22px;
        font-weight: bold;
        margin: 0;
        text-transform: uppercase;
    }
    .texto-vuelta {
        font-size: 15px;
        font-weight: 600;
        line-height: 1.4;
    }
    .hint {
        color: #888;
        font-size: 12px;
        margin-top: 15px;
    }
    </style>
    """
    st.markdown(css_tarjetas, unsafe_allow_html=True)

    if os.path.exists(RUTA_DIC):
        try:
            df_dic = pd.read_csv(RUTA_DIC, sep=';', encoding='latin-1', on_bad_lines='skip').fillna("")
            
            busq_dic = st.text_input("Buscar en el diccionario (ej. Goniómetro, Cifosis):")
            
            if busq_dic:
                res_dic = busqueda_inteligente(df_dic, busq_dic)
            else:
                res_dic = df_dic
                
            st.markdown(f"**Términos en la base de datos:** {len(res_dic)}")
            
            if res_dic.empty:
                st.warning("No se encontró el término. Intenta con otra palabra.")
            else:
                cols_dic = st.columns(3)
                
                for idx, fila in res_dic.head(100).iterrows():
                    valores = fila.tolist()
                    col0 = str(valores[0]).strip()
                    
                    if len(valores) >= 3 and (col0.isdigit() or col0.upper().startswith('D0') or len(col0) <= 5):
                        concepto = str(valores[1]).strip()
                        definicion = str(valores[2]).strip()
                    elif len(valores) >= 2:
                        concepto = str(valores[0]).strip()
                        definicion = str(valores[1]).strip()
                    else:
                        concepto = "Desconocido"
                        definicion = "Sin definición"
                    
                    with cols_dic[idx % 3]:
                        tarjeta_html = f"""
                        <div class="flip-card">
                          <div class="flip-card-inner">
                            <div class="flip-card-front">
                              <p class="titulo-tarjeta">{concepto}</p>
                              <p class="hint">👉 Toca para girar</p>
                            </div>
                            <div class="flip-card-back">
                              <p class="texto-vuelta">{definicion}</p>
                            </div>
                          </div>
                        </div>
                        """
                        st.markdown(tarjeta_html, unsafe_allow_html=True)
                    
                if len(res_dic) > 100:
                    st.info("Mostrando los primeros 100 resultados. Usa el buscador para encontrar palabras específicas.")
                    
        except Exception as e:
            st.error(f"Error interno al procesar el archivo: {e}")
    else:
        st.error("Archivo diccionario_maestro.csv no encontrado.")

elif menu == "🏥 PATOLOGÍAS":
    st.markdown('<h1 class="titulo-cj">TABLERO CLÍNICO DE PATOLOGÍAS</h1>', unsafe_allow_html=True)
    if os.path.exists(RUTA_PATOLOGIAS):
        df_p = pd.read_csv(RUTA_PATOLOGIAS, sep=';', encoding='latin-1')
        col_nombre = 'Nombre_Patologia' if 'Nombre_Patologia' in df_p.columns else df_p.columns[1]
        p_s = st.selectbox("Buscar Patología:", df_p[col_nombre].unique())
        d = df_p[df_p[col_nombre] == p_s].iloc[0]
        
        st.markdown(f"### 📋 {str(p_s).upper()}")
        
        def get_val(claves, default="Dato no registrado"):
            for col in df_p.columns:
                for clave in claves:
                    if clave.lower() in col.lower():
                        val = str(d[col])
                        if val.lower() != 'nan' and val.strip() != '':
                            return val
            return default

        with st.container(border=True):
            st.markdown("#### 🩺 Evaluación Clínica")
            st.write(f"**Músculos Implicados:** {get_val(['músculo', 'musculo', 'implicados'])}")
            st.write(f"**Tipo de Dolor / Zona:** {get_val(['dolor', 'zona'])}")
            
        with st.container(border=True):
            st.markdown("#### ⚡ Intervención Fisioterapéutica (Agentes)")
            st.info(f"**Modo Sugerido:** {get_val(['modo', 'sugerido'])}\n\n**Parámetros:** {get_val(['parámetro', 'parametro', 'hz'])}\n\n**📍 Ubicación Electrodos:** {get_val(['ubicación', 'ubicacion', 'electrodo'])}\n\n**Objetivo:** {get_val(['objetivo'])}")
             
        with st.container(border=True):
            st.markdown("#### 🏋️ Terapia Activa y Complementaria")
            st.success(f"**🤝 Terapia Complementaria:** {get_val(['complementaria', 'ideal'])}")
            st.success(f"**🏋️ Ejercicio Activo:** {get_val(['ejercicio', 'movimiento', 'activa'])}")
            st.success(f"**🧠 Lógica de Combinación:** {get_val(['lógica', 'logica', 'combinacion'])}")
            st.success(f"**⏱️ Notas sobre tiempo:** {get_val(['tiempo', 'notas'])}")

elif menu == "📝 FICHA CLÍNICA":
    st.title("📝 Ingreso de Nueva Ficha Clínica")
    st.markdown("Complete los campos para registrar un nuevo paciente en la base de datos.")

    # Usamos st.form para que no se recargue la página con cada tecla que presionas
    with st.form("formulario_nueva_ficha", clear_on_submit=True):
        
        st.subheader("1. Datos de Filiación")
        c1, c2, c3 = st.columns(3)
        dni = c1.text_input("DNI *", max_chars=8, placeholder="Ej: 12345678")
        nombres = c2.text_input("Nombres *")
        apellidos = c3.text_input("Apellidos *")

        c4, c5, c6, c7 = st.columns(4)
        edad = c4.number_input("Edad", min_value=0, max_value=120, step=1)
        sexo = c5.selectbox("Sexo", ["Masculino", "Femenino", "Otro"])
        ocupacion = c6.text_input("Ocupación")
        celular = c7.text_input("Celular")

        st.divider()

        st.subheader("2. Triage y Signos Vitales")
        t1, t2, t3, t4 = st.columns(4)
        pa_sistolica = t1.number_input("PA Sistólica (mmHg)", min_value=0, step=1, value=120)
        pa_diastolica = t2.number_input("PA Diastólica (mmHg)", min_value=0, step=1, value=80)
        fc_lpm = t3.number_input("Frec. Cardíaca (bpm)", min_value=0, step=1, value=70)
        fr_rpm = t4.number_input("Frec. Respiratoria (rpm)", min_value=0, step=1, value=16)

        t5, t6, t7, t8 = st.columns(4)
        spo2 = t5.number_input("SpO2 (%)", min_value=0, max_value=100, step=1, value=98)
        temp = t6.number_input("Temperatura (°C)", min_value=30.0, max_value=45.0, step=0.1, value=36.5)
        peso = t7.number_input("Peso (kg)", min_value=0.0, step=0.1, value=70.0)
        talla = t8.number_input("Talla (cm)", min_value=0, step=1, value=170)

        st.divider()

        st.subheader("3. Anamnesis y Diagnóstico")
        motivo = st.text_area("Motivo de Consulta *", placeholder="¿Por qué acude a terapia?")
        antecedentes = st.text_input("Antecedentes Patológicos", placeholder="Alergias, cirugías, enfermedades...")
        
        d1, d2 = st.columns(2)
        medicacion = d1.text_input("Medicación Actual")
        diag_med = d2.text_input("Diagnóstico Médico (Si trae receta)")
        
        diag_fisio = st.text_input("Diagnóstico Fisioterapéutico preliminar")
        eva = st.slider("EVA Inicial (Nivel de Dolor 0-10)", 0, 10, 5)

        st.divider()

        st.subheader("4. Plan de Tratamiento")
        p1, p2, p3, p4 = st.columns(4)
        fecha = p1.date_input("Fecha de Ingreso")
        sesiones = p2.number_input("Sesiones Proyectadas", min_value=1, step=1, value=10)
        costo = p3.number_input("Costo por Sesión (S/)", min_value=0.0, step=1.0, value=50.0)
        consentimiento = p4.selectbox("Consentimiento Firmado", ["Si", "No"])
        
        obs = st.text_area("Observaciones Adicionales")

        # Botón de envío
        submit_btn = st.form_submit_button("💾 Guardar Paciente en Base de Datos", type="primary", use_container_width=True)

        if submit_btn:
            if not dni or not nombres or not apellidos or not motivo:
                st.error("⚠️ Los campos marcados con (*) son obligatorios.")
            else:
                # Lógica interna: Cálculo automático de IMC
                imc_calc = 0
                clasificacion = "N/A"
                if peso > 0 and talla > 0:
                    talla_m = talla / 100
                    imc_calc = round(peso / (talla_m * talla_m), 1)
                    if imc_calc < 18.5: clasificacion = "Bajo peso"
                    elif imc_calc < 25: clasificacion = "Normal"
                    elif imc_calc < 30: clasificacion = "Sobrepeso"
                    else: clasificacion = "Obesidad"

                # Empaquetamos los datos exactos como los espera Supabase
                nuevo_paciente = {
                    "ID": f"PAC-{dni}", # Generador de ID simple basado en DNI
                    "DNI": dni,
                    "Nombres": nombres,
                    "Apellidos": apellidos,
                    "Edad": edad,
                    "Sexo": sexo,
                    "Ocupacion": ocupacion,
                    "Celular": celular,
                    "PA_Sistolica": pa_sistolica,
                    "PA_Diastolica": pa_diastolica,
                    "FC_lpm": fc_lpm,
                    "FR_rpm": fr_rpm,
                    "Saturacion_SpO2": spo2,
                    "Temperatura_C": temp,
                    "Peso_kg": peso,
                    "Talla_cm": talla,
                    "IMC": imc_calc,
                    "Clasificacion_IMC": clasificacion,
                    "Motivo_Consulta": motivo,
                    "Antecedentes_Patologicos": antecedentes,
                    "Medicacion_Actual": medicacion,
                    "Diagnostico_Medico": diag_med,
                    "Diagnostico_Fisioterapeutico": diag_fisio,
                    "EVA_Inicial": eva,
                    "Fecha_Ingreso": str(fecha),
                    "Sesiones_Proyectadas": sesiones,
                    "Costo_Sesion": costo,
                    "Estado_Paciente": "Activo",
                    "Consentimiento_Firmado": consentimiento,
                    "Observaciones": obs
                }

                # Inyección a Supabase
                try:
                    respuesta = supabase.table("fichas_clinicas").insert(nuevo_paciente).execute()
                    st.success(f"✅ ¡Ficha de {nombres} {apellidos} registrada exitosamente!")
                    st.info(f"Su IMC calculado es {imc_calc} ({clasificacion}).")
                except Exception as e:
                    st.error(f"❌ Error al guardar en la base de datos: {e}")
        

elif menu == "📋 EXPEDIENTES":
    st.markdown('<h1 class="titulo-cj">HISTORIAL CLÍNICO Y EXPEDIENTES</h1>', unsafe_allow_html=True)

    # 1. RECUPERACIÓN DE DATOS DESDE SUPABASE
    try:
        # Traemos todos los campos, incluyendo la nueva foto_url y datos de filiación
        res = supabase.table("pacientes").select("*").order("created_at", desc=True).execute()
        pacientes = res.data
    except Exception as e:
        st.error(f"Error de conexión con la base de datos: {e}")
        pacientes = []

    if not pacientes:
        st.info("Aún no hay pacientes registrados en el sistema.")
    else:
        df_p = pd.DataFrame(pacientes)
        
        # 2. BUSCADOR INTELIGENTE
        col_busq1, col_busq2 = st.columns([2, 1])
        with col_busq1:
            termino = st.text_input("🔍 Buscar paciente (Nombre o DNI):")
        
        df_filtrado = busqueda_inteligente(df_p, termino)
        st.markdown(f"**Registros encontrados:** {len(df_filtrado)}")
        st.divider()

        # 3. LISTADO DE TARJETAS DE EXPEDIENTE
        for _, p in df_filtrado.iterrows():
            # Lógica de color según el dolor (EVA)
            eva_val = p.get('escala_de_eva', 0)
            color_eva = "#28a745" if eva_val <= 3 else "#ffc107" if eva_val <= 6 else "#dc3545"
            
            with st.container(border=True):
                # Layout: Foto a la izquierda, Info principal a la derecha
                c_foto, c_info = st.columns([1, 3])
                
                with c_foto:
                    # Recuperación y visualización de la foto en Base64
                    foto_data = p.get('foto_url', "")
                    if foto_data and len(str(foto_data)) > 50:
                        try:
                            st.image(f"data:image/png;base64,{foto_data}", use_container_width=True)
                        except:
                            st.caption("⚠️ Error al cargar imagen")
                    else:
                        # Imagen por defecto si no hay foto
                        st.image("https://cdn-icons-png.flaticon.com/512/149/149071.png", use_container_width=True)
                
                with c_info:
                    st.markdown(f"""
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin:0; color:#F4D06F;">{str(p.get('nombre_del_paciente','')).upper()}</h2>
                        <span style="background:{color_eva}; padding:5px 12px; border-radius:15px; color:white; font-weight:bold;">EVA: {eva_val}/10</span>
                    </div>
                    """, unsafe_allow_html=True)
                    
                    st.markdown(f"""
                    **🆔 DNI:** {p.get('dni_ce')} | **🎂 Edad:** {p.get('edad')} años | **🚻 Sexo:** {p.get('genero','-')}  
                    **📞 Tel:** {p.get('telefono','-')} | **📍 Dir:** {p.get('direccion','-')}  
                    **💼 Trabajo:** {p.get('ocupacion_laboral','-')}
                    """)

                # 4. DETALLES MÉDICOS (Expandible para no saturar la vista)
                with st.expander("🔍 VER HISTORIAL CLÍNICO Y ANTECEDENTES"):
                    col_det1, col_det2 = st.columns(2)
                    
                    with col_det1:
                        st.markdown("##### 🏥 Antecedentes Generales")
                        st.info(p.get('antecedentes_medicos', 'Sin antecedentes registrados'))
                        st.markdown(f"**🚩 Motivo de Consulta:** {p.get('motivo_de_visita','-')}")
                        
                    with col_det2:
                        st.markdown("##### 🩺 Evaluación y Diagnóstico")
                        st.success(f"**🎯 Diagnóstico:** {p.get('presunto_diagnostico','-')}")
                        st.warning(f"**📍 Zonas de Dolor:** {p.get('zonas_de_dolor','-')}")

                    st.divider()
                    st.markdown("##### 📋 Plan de Tratamiento y Evolución")
                    st.write(p.get('plan_tratamiento', 'No hay un plan definido todavía.'))
                    st.caption(f"Última actualización: {p.get('created_at','')[:10]}")

                # Botón opcional para futuras funciones (PDF, etc)
                if st.button(f"📄 Generar Reporte", key=f"rep_{p.get('dni_ce')}"):
                    st.toast(f"Preparando reporte de {p.get('nombre_del_paciente')}...")


elif menu == "💆 MASOTERAPIA":
    st.markdown('<h1 class="titulo-cj">PROTOCOLO MANUAL AVANZADO</h1>', unsafe_allow_html=True)
    if os.path.exists(RUTA_MASO):
        df_m = pd.read_csv(RUTA_MASO, sep=';', encoding='latin-1')
        t_s = st.selectbox("Seleccione la Técnica Manual:", df_m['Nombre_Tecnica'].unique())
        d = df_m[df_m['Nombre_Tecnica'] == t_s].iloc[0]
        
        st.markdown(f"""
        <div class="card-expediente" style="border-color: #4da6ff;">
            <h2 style="color:#4da6ff; text-align:center;">🖐️ {t_s.upper()}</h2>
            <hr style="border-color:#4da6ff; opacity:0.3;">
        </div>
        """, unsafe_allow_html=True)

        t1, t2 = st.tabs(["📖 Descripción de la Maniobra", "🎯 Casos Clínicos Sugeridos (Cruce de Datos)"])
        
        with t1:
            st.info("**Descripción y Biomecánica:**")
            st.write(d['Descripcion'])
            
        with t2:
            st.markdown("🔍 **Patologías en tu base de datos donde esta técnica es útil:**")
            encontrado = False
            if os.path.exists(RUTA_PATOLOGIAS):
                df_p = pd.read_csv(RUTA_PATOLOGIAS, sep=';', encoding='latin-1')
                coincidencias = busqueda_inteligente(df_p, t_s)
                
                if not coincidencias.empty:
                    for _, f in coincidencias.iterrows():
                        col_n = 'Nombre_Patologia' if 'Nombre_Patologia' in df_p.columns else df_p.columns[1]
                        st.success(f"✅ Se recomienda aplicar en caso de: **{f[col_n].upper()}**")
                        encontrado = True
            
            if not encontrado:
                st.write("ℹ️ *Técnica de aplicación general. Revisa la evaluación del paciente para determinar su uso específico.*")



elif menu == "👥 GESTIÓN DE USUARIOS":
    st.markdown('<h1 class="titulo-cj">PANEL DE CONTROL DE USUARIOS</h1>', unsafe_allow_html=True)
    st.info("💡 Como Administrador, aquí puedes aprobar solicitudes o cambiar roles de tu equipo.")

    try:
        res_users = supabase.table("usuarios").select("*").execute()
        df_usuarios = pd.DataFrame(res_users.data)
    except Exception as e:
        st.error(f"Error al conectar con la base de datos de usuarios: {e}")
        df_usuarios = pd.DataFrame()

    if not df_usuarios.empty:
        df_pendientes = df_usuarios[df_usuarios['rol'] == "Pendiente"]
        df_activos = df_usuarios[df_usuarios['rol'] != "Pendiente"]

        st.markdown("### ⏳ Solicitudes Pendientes de Aprobación")
        if df_pendientes.empty:
            st.success("No hay solicitudes pendientes. ¡Todo al día!")
        else:
            for _, u in df_pendientes.iterrows():
                with st.container(border=True):
                    c1, c2 = st.columns([2, 1])
                    c1.markdown(f"**👤 {u.get('nombre', 'S/N')}**<br>📧 {u.get('correo', '')}", unsafe_allow_html=True)
                    with c2:
                        nuevo_rol = st.selectbox("Asignar Rol:", ["Seleccionar...", "Estudiante", "Colaborador", "Hibrido", "Administrador"], key=f"sel_{u['correo']}")
                        if nuevo_rol != "Seleccionar...":
                            if st.button("✅ Aprobar", key=f"btn_ap_{u['correo']}", use_container_width=True):
                                try:
                                    supabase.table("usuarios").update({"rol": nuevo_rol}).eq("correo", u['correo']).execute()
                                    st.success(f"¡{u['nombre']} aprobado como {nuevo_rol}!")
                                    st.rerun()
                                except:
                                    st.error("Error al actualizar.")

        st.divider()
        st.markdown("### 🟢 Usuarios Activos en el Sistema")
        with st.expander("Ver y Administrar Equipo Actual"):
            for _, u in df_activos.iterrows():
                with st.container(border=True):
                    c_info, c_rol, c_btn = st.columns([2, 2, 1])
                    c_info.write(f"**{u.get('nombre', 'S/N')}**\n{u.get('correo', '')}")
                    roles_disponibles = ["Estudiante", "Colaborador", "Hibrido", "Administrador", "Pendiente"]
                    indice_actual = roles_disponibles.index(u['rol']) if u['rol'] in roles_disponibles else 0
                    cambio_rol = c_rol.selectbox("Modificar Rol:", roles_disponibles, index=indice_actual, key=f"mod_{u['correo']}")
                    c_btn.write("<br>", unsafe_allow_html=True)
                    if cambio_rol != u['rol']:
                        if c_btn.button("💾 Actualizar", key=f"btn_mod_{u['correo']}", use_container_width=True):
                            try:
                                supabase.table("usuarios").update({"rol": cambio_rol}).eq("correo", u['correo']).execute()
                                st.success("Rol actualizado con éxito.")
                                st.rerun()
                            except:
                                st.error("Error al actualizar.")
    else:
        st.warning("No se encontraron usuarios en la base de datos.")
