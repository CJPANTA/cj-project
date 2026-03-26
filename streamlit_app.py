import streamlit as st
import sys
import os

# --- 1. CONEXIÓN TÉCNICA (MODULOS) ---
ruta_actual = os.path.dirname(os.path.abspath(__file__))
ruta_modulos = os.path.join(ruta_actual, "MODULOS")
if ruta_modulos not in sys.path:
    sys.path.append(ruta_modulos)

try:
    from motor_huesos import cargar_imagen_raiz
except ImportError:
    st.error("Error: No se encontró motor_huesos.py en la carpeta MODULOS.")
    st.stop()

# --- 2. CONFIGURACIÓN DE PÁGINA ---
st.set_page_config(page_title="CJ PROYECTOS - Lic. Jorge Luis", layout="wide")

# --- 3. BLOQUE DE COLORES OFICIALES (INAMOVIBLE) ---
# AZUL CJ: #071420 | DORADO CJ: #876205
st.markdown(f"""
    <style>
    /* Fondo General */
    .stApp {{
        background-color: #071420 !important;
    }}

    /* Barra Lateral Blindada */
    [data-testid="stSidebar"] {{
        background-color: #071420 !important;
        border-right: 5px solid #876205 !important;
    }}

    /* Textos y Radio Buttons en Sidebar */
    [data-testid="stSidebar"] .stRadio label p {{
        color: #FFFFFF !important;
        font-weight: 500 !important;
    }}
    
    [data-testid="stSidebar"] h2, [data-testid="stSidebar"] p {{
        color: #876205 !important;
    }}

    /* Título Principal Dorado */
    .titulo-cj {{
        font-family: 'serif';
        color: #876205;
        text-align: center;
        font-weight: bold;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    }}

    /* Ajuste para Celular */
    @media (max-width: 767px) {{
        .titulo-cj {{ font-size: 35px; }}
    }}
    @media (min-width: 768px) {{
        .titulo-cj {{ font-size: 60px; }}
    }}

    /* Líneas y Divisores */
    hr {{ border-top: 2px solid #876205 !important; }}
    </style>
    """, unsafe_allow_html=True)

# --- 4. CARGA DE LOGOS ---
logo_cj = cargar_imagen_raiz("logo_cj.jpg")
logo_carrion = cargar_imagen_raiz("logo_carrion.png")

# --- 5. SIDEBAR ---
with st.sidebar:
    if logo_cj:
        st.markdown(f'<div style="text-align: center;"><img src="{logo_cj}" width="150"></div>', unsafe_allow_html=True)
    st.markdown("<h2 style='text-align: center;'>PROYECTO CJ</h2>", unsafe_allow_html=True)
    st.markdown("<p style='text-align: center; color: white !important; opacity: 0.8;'>Lic. Jorge Luis Chiroque Panta</p>", unsafe_allow_html=True)
    st.divider()
    
    menu = st.radio(
        "SISTEMA DE GESTIÓN", 
        ["🏠 INICIO", "🦴 ANATOMÍA MAESTRO", "📖 REPOSITORIO CARRION", "📚 BIBLIOTECA TÉCNICA"]
    )

# --- 6. SECCIÓN: INICIO ---
if menu == "🏠 INICIO":
    st.markdown('<h1 class="titulo-cj">PROYECTO CJ</h1>', unsafe_allow_html=True)
    st.image("https://images.unsplash.com/photo-1576091160550-2173dbc999ef?q=80&w=2070", use_container_width=True)
    st.divider()
    
    col1, col2 = st.columns([2, 1])
    with col1:
        st.markdown("<h3 style='color: #876205;'>Excelencia en Fisioterapia</h3>", unsafe_allow_html=True)
        st.write("Bienvenido, Jorge Luis. Interfaz profesional consolidada.")
    with col2:
        if logo_carrion:
            st.image(logo_carrion, width=160)
else:
    st.info(f"Módulo **{menu}** activo bajo la identidad CJ.")
