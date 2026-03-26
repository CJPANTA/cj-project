import streamlit as st
import sys
import os
from MODULOS.motor_huesos import obtener_imagen_base64, BASE_DIR

st.set_page_config(page_title="CJ PROJECT - MASTER", layout="wide")

# --- EL ALMA DEL DISEÑO: BARRA FIJA + CENTRO ELEGANTE ---
st.markdown(f"""
    <style>
    /* 1. BARRA LATERAL (INTACTA SEGÚN TU GUSTO) */
    [data-testid="stSidebar"] {{
        background-color: #101621 !important;
        border-right: 3px solid #876205 !important;
    }}
    [data-testid="stSidebar"] * {{
        color: white !important;
    }}
    [data-testid="stSidebar"] .stRadio [data-testid="stWidgetLabel"] p {{
        color: #876205 !important;
        font-weight: bold;
        font-size: 18px;
    }}

    /* 2. FONDO DEL CENTRO (Menos frío, más sobrio) */
    .stApp {{
        background-color: #F4F4F2; /* Un tono hueso muy sutil para resaltar el dorado */
    }}

    /* 3. TÍTULO ELEGANTE Y CON CUERPO */
    .contenedor-titulo {{
        text-align: center;
        padding: 40px 0px;
        background: linear-gradient(180deg, rgba(16,22,33,0.05) 0%, rgba(255,255,255,0) 100%);
        border-radius: 20px;
    }}
    .titulo-cj {{
        font-family: 'Playfair Display', serif; /* Fuente elegante */
        color: #101621;
        font-size: 80px;
        font-weight: 900;
        margin-bottom: 0px;
        line-height: 1;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
    }}
    .titulo-cj span {{
        color: #876205; /* Tu Dorado */
        position: relative;
    }}
    .subtitulo-tech {{
        font-family: 'Inter', sans-serif;
        color: #101621;
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 8px;
        text-transform: uppercase;
        margin-top: 10px;
        opacity: 0.8;
    }}

    /* 4. TARJETAS PROFESIONALES */
    .stContainer {{
        background-color: white;
        border-radius: 15px;
        border: 1px solid #E0E0E0;
        border-top: 5px solid #876205 !important;
        box-shadow: 0 10px 25px rgba(0,0,0,0.05);
        padding: 25px;
        transition: transform 0.3s;
    }}
    
    /* Pestañas (Tabs) con el ADN de la Sidebar */
    .stTabs [data-baseweb="tab-list"] {{
        background-color: #101621;
        border-radius: 12px;
        padding: 10px;
    }}
    .stTabs [data-baseweb="tab"] {{
        color: #BDBDBD !important;
        font-weight: 600;
    }}
    .stTabs [aria-selected="true"] {{
        background-color: #876205 !important;
        color: white !important;
        border-radius: 8px;
    }}
    </style>
    
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@900&family=Inter:wght@400;700&display=swap" rel="stylesheet">
""", unsafe_allow_html=True)

LINK_RAW = "https://raw.githubusercontent.com/CJPANTA/cj-project/main/BASE_DATOS/"

# --- SIDEBAR (TOTALMENTE RESPETADA) ---
with st.sidebar:
    logo_path = obtener_imagen_base64("logo_cj.jpg")
    if logo_path:
        st.image(logo_path, use_container_width=True)
    st.markdown("<div style='height: 20px;'></div>", unsafe_allow_html=True)
    menu = st.radio("SISTEMA DE GESTIÓN", ["🏠 PORTADA", "🦴 ANATOMÍA", "📖 REPOSITORIO", "📚 BIBLIOTECA"])
    st.divider()
    st.caption("Lic. Jorge Luis Chiroque Panta")

# --- CENTRO DE LA APP (EL CAMBIO DE NIVEL) ---
if menu == "🏠 PORTADA":
    st.markdown("""
        <div class="contenedor-titulo">
            <div class="titulo-cj">PROYECTO <span>CJ</span></div>
            <div class="subtitulo-tech">Fisioterapia & Tecnología</div>
        </div>
    """, unsafe_allow_html=True)
    
    # Imagen con bordes redondeados y sombra
    st.image("https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?q=80&w=2000", use_container_width=True)
    
    st.markdown("<br>", unsafe_allow_html=True)
    
    col1, col2 = st.columns([2, 1])
    with col1:
        with st.container():
            st.markdown("<h3 style='color:#101621;'>⚓ Centro de Operaciones</h3>", unsafe_allow_html=True)
            st.write("Bienvenido Licenciado. Este módulo centraliza los activos digitales del proyecto, integrando bases de datos anatómicas y el repositorio Carrión.")
    with col2:
        with st.container():
            st.markdown("<h5 style='text-align:center; color:#876205;'>RESPALDO</h5>", unsafe_allow_html=True)
            logo_c = obtener_imagen_base64("logo_carrion.png")
            if logo_c: st.image(logo_c, width=150)
