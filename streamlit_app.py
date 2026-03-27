import streamlit as st
import sys
import os
from MODULOS.motor_huesos import cargar_imagen_raiz

# --- CONFIGURACIÓN ---
st.set_page_config(page_title="SISTEMA CJ - Lic. Jorge Luis", layout="wide")

# CSS AVANZADO: DORADO REAL Y CENTRADO
st.markdown(f"""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@300&display=swap');

    .stApp {{ background-color: #06101c; color: #d1d5db; }}

    /* TÍTULO DORADO CON DEGRADADO */
    .titulo-premium {{
        font-family: 'Playfair Display', serif;
        background: linear-gradient(to bottom, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center;
        font-weight: bold;
        filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.5));
    }}

    /* CENTRADO DE LOGO Y TEXTO SIDEBAR */
    .sidebar-content {{
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }}

    /* AJUSTES RESPONSIVE */
    @media (max-width: 767px) {{
        .titulo-premium {{ font-size: 42px !important; }}
    }}
    @media (min-width: 768px) {{
        .titulo-premium {{ font-size: 75px; }}
    }}
    </style>
    """, unsafe_allow_html=True)

# --- CARGA DE LOGOS ---
logo_cj = cargar_imagen_raiz("logo_cj.jpg")
logo_carrion = cargar_imagen_raiz("logo_carrion.png")

# --- SIDEBAR CENTRADO ---
with st.sidebar:
    st.markdown('<div class="sidebar-content">', unsafe_allow_html=True)
    if logo_cj:
        st.image(logo_cj, width=160)
    st.markdown("<h2 style='color: #6e4f02; margin-top: -10px;'>PROYECTO CJ</h2>", unsafe_allow_html=True)
    st.markdown("<p style='font-size: 14px; opacity: 0.8;'>Lic. Jorge Luis Chiroque</p>", unsafe_allow_html=True)
    st.markdown('</div>', unsafe_allow_html=True)
    st.divider()
    menu = st.radio("NAVEGACIÓN", ["🏠 INICIO", "🦴 ANATOMÍA", "📖 CARRION", "📚 BIBLIOTECA"])

# --- PASO 1: VALIDAR INICIO ---
if menu == "🏠 INICIO":
    st.markdown('<h1 class="titulo-premium">PROYECTO CJ</h1>', unsafe_allow_html=True)
    
    # Imagen con bordes redondeados y sombra
    st.markdown('<div style="border-radius: 15px; overflow: hidden; box-shadow: 0px 10px 30px rgba(0,0,0,0.5);">', unsafe_allow_html=True)
    st.image("https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?q=80&w=2000", use_container_width=True)
    st.markdown('</div>', unsafe_allow_html=True)
    
    st.markdown("<br>", unsafe_allow_html=True)
    
    col1, col2 = st.columns([2, 1])
    with col1:
        st.markdown(f"<h3 style='color: #6e4f02;'>Gestión Académica de Vanguardia</h3>", unsafe_allow_html=True)
        st.write("Bienvenido, Jorge Luis. Tu infraestructura digital para el éxito en Fisioterapia.")
    with col2:
        if logo_carrion:
            st.image(logo_carrion, width=180)
else:
    st.info(f"Sección {menu} en espera. Valida el diseño de Inicio primero.")
