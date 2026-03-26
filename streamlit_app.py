import streamlit as st
import sys
import os
from MODULOS.motor_huesos import obtener_imagen_base64, BASE_DIR

st.set_page_config(page_title="CJ PROJECT - MASTER", layout="wide")

# --- BLOQUE DE ESTILO: BARRA LATERAL (FIJA) Y CENTRO (REPOTENCIADO) ---
st.markdown(f"""
    <style>
    /* FONDO DEL CENTRO - Estilo profesional */
    .stApp {{
        background-color: #F8F9FA;
    }}

    /* BARRA LATERAL - NO CAMBIAR (Tus colores exactos) */
    [data-testid="stSidebar"] {{
        background-color: #101621 !important;
        border-right: 3px solid #876205 !important;
    }}
    [data-testid="stSidebar"] * {{
        color: white !important;
    }}
    [data-testid="stSidebar"] .stRadio [data-testid="stWidgetLabel"] p {{
        color: #876205 !important; /* Dorado en etiquetas de radio */
        font-weight: bold;
    }}

    /* TITULO CENTRAL CON ESPÍRITU CJ */
    .titulo-maestro {{
        font-family: 'Helvetica Neue', sans-serif;
        color: #101621;
        text-align: center;
        font-size: 60px;
        font-weight: 900;
        letter-spacing: -2px;
        margin-top: 0px;
        padding-top: 10px;
    }}
    .dorado-cj {{
        color: #876205;
    }}

    /* TARJETAS DEL CENTRO - Estilo "Centro de Mando" */
    .stContainer {{
        background-color: white;
        border-radius: 10px;
        border-left: 5px solid #876205 !important; /* Detalle dorado lateral */
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        padding: 20px;
    }}

    /* BOTONES - Combinación de tus colores */
    .stButton>button {{
        background-color: #101621;
        color: #876205;
        border: 1px solid #876205;
        border-radius: 5px;
        font-weight: bold;
        transition: 0.3s;
        width: 100%;
    }}
    .stButton>button:hover {{
        background-color: #876205;
        color: white;
        border: 1px solid #101621;
    }}

    /* PESTAÑAS (TABS) */
    .stTabs [data-baseweb="tab-list"] {{
        background-color: #101621;
        border-radius: 8px;
        padding: 5px;
    }}
    .stTabs [data-baseweb="tab"] {{
        color: white !important;
    }}
    .stTabs [aria-selected="true"] {{
        background-color: #876205 !important;
        border-radius: 5px;
    }}
    </style>
""", unsafe_allow_html=True)

LINK_RAW = "https://raw.githubusercontent.com/CJPANTA/cj-project/main/BASE_DATOS/"

# --- SIDEBAR (CONSERVANDO LO QUE TE GUSTA) ---
with st.sidebar:
    logo_path = obtener_imagen_base64("logo_cj.jpg")
    if logo_path:
        st.image(logo_path, use_container_width=True)
    
    st.markdown("<h4 style='text-align:center; letter-spacing: 2px;'>CENTRO DE GESTIÓN</h4>", unsafe_allow_html=True)
    st.divider()
    menu = st.radio("MÓDULOS", ["🏠 PORTADA", "🦴 ANATOMÍA", "📖 REPOSITORIO", "📚 BIBLIOTECA"])
    st.divider()
    st.caption("Lic. Jorge Luis Chiroque Panta")

# --- CUERPO CENTRAL (MEJORADO CON EL ESPÍRITU DE LA SIDEBAR) ---
if menu == "🏠 PORTADA":
    st.markdown('<h1 class="titulo-maestro">PROYECTO <span class="dorado-cj">CJ</span></h1>', unsafe_allow_html=True)
    st.markdown("<div style='text-align:center; color:#101621; font-weight:bold; letter-spacing:5px; margin-top:-20px;'>FISIOTERAPIA & TECNOLOGÍA</div>", unsafe_allow_html=True)
    
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Imagen con marco dorado
    st.image("https://images.unsplash.com/photo-1576091160550-2173dbc999ef?q=80&w=2000", use_container_width=True)
    
    st.markdown("<br>", unsafe_allow_html=True)
    
    col1, col2 = st.columns([2, 1])
    with col1:
        with st.container():
            st.subheader("🛠️ Optimización de Procesos")
            st.write("Este sistema centraliza la base de datos maestra y el repositorio Carrión bajo una arquitectura de alta eficiencia.")
    with col2:
        with st.container():
            st.markdown("<h5 style='text-align:center;'>CERTIFICACIÓN</h5>", unsafe_allow_html=True)
            logo_c = obtener_imagen_base64("logo_carrion.png")
            if logo_c: st.image(logo_c, width=150)

elif menu == "📖 REPOSITORIO":
    st.markdown("<h2 style='color:#101621; border-bottom: 3px solid #876205;'>📚 REPOSITORIO CARRIÓN</h2>", unsafe_allow_html=True)
    # ... (Resto de la lógica de archivos que ya funciona)
