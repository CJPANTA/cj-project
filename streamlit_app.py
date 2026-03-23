import streamlit as st
import os
import urllib.parse

# 1. Configuración de Marca y Estilo
st.set_page_config(page_title="CJ PROJECT | Panel Maestro", page_icon="🏦", layout="centered")

# CSS Personalizado: Elegancia, sencillez y fluidez móvil
st.markdown("""
    <style>
    .main { background-color: #0e1117; font-family: 'Inter', sans-serif; }
    
    /* Títulos y textos */
    .main-title { color: #d4af37; text-align: center; font-size: 28px; font-weight: 800; letter-spacing: -1px; margin-top: 10px; }
    .subtitle { color: #8b949e; text-align: center; font-size: 14px; margin-bottom: 30px; }
    
    /* Botones del Menú Principal (Tarjetas) */
    div.stButton > button {
        background-color: #1c2128;
        color: #d4af37;
        border: 1px solid #30363d;
        border-radius: 15px;
        padding: 25px;
        font-size: 18px;
        font-weight: 600;
        width: 100%;
        transition: all 0.3s ease;
    }
    div.stButton > button:hover { border-color: #d4af37; transform: translateY(-2px); }
    
    /* Tarjetas de PDF */
    .pdf-card { 
        background: #1c2128; 
        padding: 15px; 
        border-radius: 12px; 
        border-left: 4px solid #d4af37;
        margin-bottom: 10px;
        color: white;
    }
    </style>
    """, unsafe_allow_html=True)

# 2. Inicializar el Estado de Navegación
if 'seccion' not in st.session_state:
    st.session_state['seccion'] = 'Inicio'

# 3. BARRA LATERAL (Navegación Rápida)
if os.path.exists("logo_general.png"):
    st.sidebar.image("logo_general.png", use_container_width=True)

st.sidebar.markdown("---")
if st.sidebar.button("🏠 Volver al Inicio"):
    st.session_state['seccion'] = 'Inicio'

# 4. LÓGICA DE SECCIONES
# --- PANTALLA DE INICIO (MENÚ MAESTRO) ---
if st.session_state['seccion'] == 'Inicio':
    # Logo Central
    if os.path.exists("logo_general.png"):
        col_l, col_c, col_r = st.columns([1,2,1])
        col_c.image("logo_general.png", use_container_width=True)
    
    st.markdown("<div class='main-title'>SISTEMA CJ</div>", unsafe_allow_html=True)
    st.markdown("<div class='subtitle'>Selecciona el área de gestión</div>", unsafe_allow_html=True)
    
    # Cuadrícula de Navegación
    c1, c2 = st.columns(2)
    with c1:
        if st.button("📚 ACADEMIA"):
            st.session_state['seccion'] = 'Academia'
    with c2:
        if st.button("🔬 LABORATORIO"):
            st.info("Sección en desarrollo: Protocolos y Evaluaciones.")

    c3, c4 = st.columns(2)
    with c3:
        if st.button("🚛 OPERACIONES"):
            st.info("Sección en desarrollo: Gestión de Equipo y Reportes.")
    with c4:
        if st.button("🏗️ PROYECTOS"):
            st.info("Sección en desarrollo: Construcción Aucallama.")

# --- SECCIÓN ACADEMIA (BIBLIOTECA) ---
elif st.session_state['seccion'] == 'Academia':
    if os.path.exists("logo_estudios.png"):
        col_l, col_c, col_r = st.columns([1,1,1])
        col_c.image("logo_estudios.png", width=150)
    
    st.markdown("<div class='main-title'>ACADEMIA</div>", unsafe_allow_html=True)
    
    # Buscador automático de Ciclos
    carpetas_ciclo = sorted([d for d in os.listdir('.') if os.path.isdir(d) and d.startswith('CICLO_')])
    
    ciclo_sel = st.selectbox("📂 Elige un Ciclo para explorar:", ["Seleccionar..."] + carpetas_ciclo)
    
    if ciclo_sel != "Seleccionar...":
        cursos = sorted([d for d in os.listdir(ciclo_sel) if os.path.isdir(os.path.join(ciclo_sel, d))])
        
        st.write("### Cursos Disponibles")
        cols_cursos = st.columns(2)
        for i, curso in enumerate(cursos):
            with cols_cursos[i % 2]:
                if st.button(f"{curso}", key=f"c_{curso}"):
                    st.session_state['curso_actual'] = curso
        
        if 'curso_actual' in st.session_state:
            st.markdown("---")
            curso_activo = st.session_state['curso_actual']
            st.markdown(f"<h3 style='color: #d4af37;'>📖 {curso_activo}</h3>", unsafe_allow_html=True)
            
            ruta_curso = os.path.join(ciclo_sel, curso_activo)
            archivos = sorted([f for f in os.listdir(ruta_curso) if f.lower().endswith('.pdf')])
            
            for pdf in archivos:
                st.markdown(f"<div class='pdf-card'>📄 {pdf}</div>", unsafe_allow_html=True)
                
                c_ver, c_desc = st.columns(2)
                
                # Visualización (Ojo)
                raw_url = f"https://raw.githubusercontent.com/CJPANTA/cj-project/main/{ciclo_sel}/{curso_activo}/{pdf}"
                encoded_url = urllib.parse.quote(raw_url, safe='')
                google_viewer_url = f"https://docs.google.com/viewer?url={encoded_url}&embedded=true"
                
                with c_ver:
                    if st.button("👁️ Leer", key=f"v_{pdf}"):
                        st.markdown(f'<iframe src="{google_viewer_url}" width="100%" height="500" style="border:none; border-radius:10px;"></iframe>', unsafe_allow_html=True)
                
                with c_desc:
                    with open(os.path.join(ruta_curso, pdf), "rb") as f:
                        st.download_button("📥 Bajar", f, file_name=pdf, key=f"d_{pdf}")

st.sidebar.markdown("---")
st.sidebar.caption("Jorge Luis | Administrador de Operaciones")
