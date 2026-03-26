import streamlit as st
import sys
import os

# --- CONEXIÓN DE RUTAS ---
ruta_actual = os.path.dirname(os.path.abspath(__file__))
ruta_modulos = os.path.join(ruta_actual, "MODULOS")
if ruta_modulos not in sys.path:
    sys.path.append(ruta_modulos)

from motor_huesos import cargar_imagen_raiz

# --- CONFIGURACIÓN DE PÁGINA ---
st.set_page_config(page_title="CJ PROYECTOS - Lic. Jorge Luis", layout="wide")

# --- CSS: ALMA VISUAL (VIDRIO + LÍNEAS DORADAS) ---
st.markdown(f"""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@300;500&display=swap');

    .stApp {{
        background-color: #06101c !important;
        color: #FFFFFF;
    }}

    /* BARRA LATERAL ESTRECHA Y MARCADA */
    [data-testid="stSidebar"] {{
        background-color: #06101c !important;
        border-right: 1px solid #6e4f02 !important;
        min-width: 260px !important;
    }}

    /* EFECTO VIDRIO (GLASSMORPHISM) PARA TARJETAS */
    .glass-card {{
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid #6e4f02;
        border-radius: 4px;
        padding: 20px;
        margin-bottom: 20px;
        backdrop-filter: blur(10px);
    }}

    .metric-title {{
        color: #6e4f02;
        font-family: 'Montserrat', sans-serif;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-bottom: 5px;
    }}

    .metric-value {{
        font-family: 'Playfair Display', serif;
        font-size: 24px;
        color: #FFFFFF;
    }}

    /* TÍTULOS */
    .titulo-cj {{
        font-family: 'Playfair Display', serif;
        color: #6e4f02;
        text-align: center;
        letter-spacing: 3px;
    }}

    /* BOTONES ESTILO CLÍNICO */
    .stButton>button {{
        width: 100%;
        background-color: transparent !important;
        color: #6e4f02 !important;
        border: 1px solid #6e4f02 !important;
        border-radius: 0px !important;
        font-family: 'Montserrat', sans-serif;
        text-transform: uppercase;
        transition: 0.3s;
    }}
    .stButton>button:hover {{
        background-color: #6e4f02 !important;
        color: #FFFFFF !important;
    }}
    </style>
    """, unsafe_allow_html=True)

# --- CARGA DE LOGOS ---
logo_cj = cargar_imagen_raiz("logo_cj.jpg")

# --- SIDEBAR ---
with st.sidebar:
    if logo_cj:
        st.markdown(f'<div style="text-align: center;"><img src="{logo_cj}" width="130"></div>', unsafe_allow_html=True)
    st.markdown("<h3 style='text-align: center; color: #6e4f02; font-family: serif;'>SISTEMA CJ</h3>", unsafe_allow_html=True)
    st.divider()
    
    menu = st.radio(
        "MÓDULOS DE GESTIÓN", 
        ["🏠 PANEL DE CONTROL", "🦴 ANATOMÍA DINÁMICA", "📖 REPOSITORIO CARRION", "🧬 LABORATORIO CLÍNICO"]
    )

# --- 1. PANEL DE CONTROL (DASHBOARD) ---
if menu == "🏠 PANEL DE CONTROL":
    st.markdown('<h1 class="titulo-cj">DASHBOARD DE ESTUDIO</h1>', unsafe_allow_html=True)
    st.markdown("<p style='text-align: center; opacity: 0.6;'>Control de Progreso Ciclo IV - Carrión</p>", unsafe_allow_html=True)
    
    # Métricas en Glassmorphism
    col1, col2, col3 = st.columns(3)
    with col1:
        st.markdown('<div class="glass-card"><p class="metric-title">Ciclo Académico</p><p class="metric-value">04 - Carrión</p></div>', unsafe_allow_html=True)
    with col2:
        st.markdown('<div class="glass-card"><p class="metric-title">Promedio Actual</p><p class="metric-value">18.5 / 20</p></div>', unsafe_allow_html=True)
    with col3:
        st.markdown('<div class="glass-card"><p class="metric-title">Próximo Hito</p><p class="metric-value">Examen Agentes</p></div>', unsafe_allow_html=True)

    st.markdown('<div class="glass-card"><h4>Resumen de Actividad Reciente</h4><p style="font-size:14px; opacity:0.8;">Revisión de protocolos de Moxibustión y actualización de base de datos anatómica.</p></div>', unsafe_allow_html=True)

# --- 2. ANATOMÍA DINÁMICA ---
elif menu == "🦴 ANATOMÍA DINÁMICA":
    st.markdown('<h2 style="color: #6e4f02; font-family: serif;">Visor Anatómico Maestro</h2>', unsafe_allow_html=True)
    
    col_busqueda, col_visor = st.columns([1, 2])
    
    with col_busqueda:
        st.markdown('<div class="glass-card">', unsafe_allow_html=True)
        st.write("🔍 **Buscador Técnico**")
        busqueda = st.text_input("Ingrese Músculo / Hueso:", placeholder="Ej. Deltoides...")
        st.button("Consultar Ficha")
        st.markdown('</div>', unsafe_allow_html=True)
        
    with col_visor:
        st.markdown('<div class="glass-card" style="height: 400px; display: flex; align-items: center; justify-content: center; border-style: dashed;">', unsafe_allow_html=True)
        if busqueda:
            st.markdown(f"<h4>Ficha Técnica: {busqueda}</h4><p>Cargando datos de inserción y función...</p>", unsafe_allow_html=True)
        else:
            st.markdown("<p style='opacity: 0.5;'>Seleccione un elemento para visualizar su estructura</p>", unsafe_allow_html=True)
        st.markdown('</div>', unsafe_allow_html=True)

# --- 3. REPOSITORIO CARRION ---
elif menu == "📖 REPOSITORIO CARRION":
    st.markdown('<h2 style="color: #6e4f02; font-family: serif;">Biblioteca Digital Ciclo IV</h2>', unsafe_allow_html=True)
    
    items = ["Agentes Físicos I.pdf", "Anatomía Palpatoria.pdf", "Moxibustión Técnica.pdf"]
    
    for item in items:
        with st.container():
            col_a, col_b = st.columns([3, 1])
            with col_a:
                st.markdown(f'<div style="border-left: 3px solid #6e4f02; padding-left: 15px; margin-bottom: 10px;">{item}</div>', unsafe_allow_html=True)
            with col_b:
                st.button(f"Abrir", key=item)

# --- 4. LABORATORIO CLÍNICO (HIJO PERSONAL) ---
else:
    st.markdown('<h2 class="titulo-cj">LABORATORIO "AUCALLAMA"</h2>', unsafe_allow_html=True)
    st.markdown('<div class="glass-card" style="text-align: center; border: 2px solid #6e4f02;">', unsafe_allow_html=True)
    st.write("🧬 **Módulo en Desarrollo**")
    st.write("Este espacio procesará la lógica clínica y protocolos de rehabilitación.")
    st.markdown('</div>', unsafe_allow_html=True)
