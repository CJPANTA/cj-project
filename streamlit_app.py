import streamlit as st
import sys
import os

# Conexión con MODULOS
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "MODULOS"))
from motor_huesos import cargar_imagen_raiz

# --- CONFIGURACIÓN Y COLORES ---
st.set_page_config(page_title="SISTEMA CJ - Lic. Jorge Luis", layout="wide")

# CSS para Responsive y Colores del archivo TXT
st.markdown(f"""
    <style>
    /* Fondo Principal */
    .stApp {{ background-color: #06101c; color: #d1d5db; }}
    
    /* Títulos en Dorado */
    .titulo-cj {{
        color: #6e4f02;
        font-family: 'Playfair Display', serif;
        text-align: center;
        font-weight: bold;
    }}

    /* Ajuste para Celulares (Android) */
    @media (max-width: 767px) {{
        .titulo-cj {{ font-size: 38px !important; }}
        [data-testid="stSidebar"] {{ min-width: 250px; }}
    }}
    @media (min-width: 768px) {{
        .titulo-cj {{ font-size: 65px; }}
    }}

    /* Botones en Verde Esmeralda */
    .stButton>button {{
        background-color: #008080 !important;
        color: white !important;
        border-radius: 8px;
    }}
    </style>
    """, unsafe_allow_html=True)

# --- LOGOS ---
logo_cj = cargar_imagen_raiz("logo_cj.jpg")
logo_carrion = cargar_imagen_raiz("logo_carrion.png")

# --- SIDEBAR ---
with st.sidebar:
    if logo_cj: st.image(logo_cj, width=140)
    st.markdown("<h2 style='color: #6e4f02; text-align: center;'>PROYECTO CJ</h2>", unsafe_allow_html=True)
    st.write("---")
    menu = st.radio("NAVEGACIÓN", ["🏠 INICIO", "🦴 ANATOMÍA", "📖 CARRION", "📚 BIBLIOTECA"])

# --- PASO 1: VALIDAR INICIO ---
if menu == "🏠 INICIO":
    st.markdown('<h1 class="titulo-cj">PROYECTO CJ</h1>', unsafe_allow_html=True)
    
    # Imagen de Unsplash (Fisioterapia)
    st.image("https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?q=80&w=2000", 
             use_container_width=True)
    
    st.divider()
    
    col1, col2 = st.columns([2, 1])
    with col1:
        st.subheader("Sistema de Optimización de Estudio")
        st.write("Bienvenido, Lic. Jorge Luis. Centro de gestión académica listo.")
    with col2:
        if logo_carrion: st.image(logo_carrion, width=180)
else:
    st.info(f"Sección {menu} pausada para validación del Punto de Control 0.")
