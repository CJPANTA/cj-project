import streamlit as st
import sys
import os
from MODULOS.motor_huesos import cargar_imagen_raiz

# --- CONFIGURACIÓN ---
st.set_page_config(page_title="SISTEMA CJ - Lic. Jorge Luis", layout="wide")

# CSS PREMIUM: DORADO REAL, CENTRADO Y RESPONSIVE
st.markdown(f"""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@300&display=swap');

    .stApp {{ background-color: #06101c; color: #d1d5db; }}

    /* TÍTULO CJ PREMIUM (Dorado Real con degradado) */
    .titulo-premium {{
        font-family: 'Playfair Display', serif;
        background: linear-gradient(to bottom, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center;
        font-weight: bold;
        filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.5));
    }}

    /* CENTRADO TOTAL DE LOGO Y TEXTO EN SIDEBAR */
    [data-testid="stSidebar"] {{
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }}
    
    /* Clase para centrar contenido del sidebar (logo + texto) */
    .sidebar-content-centered {{
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        width: 100%;
    }}

    /* AJUSTES RESPONSIVE (Móvil) */
    @media (max-width: 767px) {{
        .titulo-premium {{ font-size: 42px !important; }}
        .texto-inicio-centered {{ text-align: center !important; }} /* Centrar texto inferior en móvil */
        [data-testid="stColumns"] {{ flex-direction: column !important; }} /* Columnas verticales en móvil */
    }}
    @media (min-width: 768px) {{
        .titulo-premium {{ font-size: 75px; }}
        .texto-inicio-centered {{ text-align: left !important; }} /* Izquierda en desktop */
    }}
    </style>
    """, unsafe_allow_html=True)

# --- CARGA DE LOGOS (Desde la raíz) ---
logo_cj = cargar_imagen_raiz("logo_cj.jpg")
# logo_carrion ya no se usa aquí

# --- SIDEBAR CENTRADO ---
with st.sidebar:
    st.markdown('<div class="sidebar-content-centered">', unsafe_allow_html=True)
    if logo_cj:
        # Centrado manual de la imagen con HTML
        st.markdown(f'<div style="text-align: center; width: 100%;"><img src="{logo_cj}" width="160"></div>', unsafe_allow_html=True)
    
    # Nombre de app y tu nombre, centrados debajo del logo
    st.markdown("<h2 style='color: #6e4f02; margin-top: 10px; text-align: center;'>PROYECTO CJ</h2>", unsafe_allow_html=True)
    st.markdown("<p style='font-size: 14px; opacity: 0.8; text-align: center;'>Lic. Jorge Luis Chiroque</p>", unsafe_allow_html=True)
    st.markdown('</div>', unsafe_allow_html=True)
    st.divider()
    menu = st.radio("NAVEGACIÓN", ["🏠 INICIO", "🦴 ANATOMÍA", "📖 REPOSITORIO CARRION", "📚 BIBLIOTECA"])

# --- PASO 1: VALIDAR INICIO (Portada) ---
if menu == "🏠 INICIO":
    st.markdown('<h1 class="titulo-premium">PROYECTO CJ</h1>', unsafe_allow_html=True)
    
    # Imagen de Unsplash con Toque Moderno (Bordes y Sombra)
    st.markdown('<div style="border-radius: 15px; overflow: hidden; box-shadow: 0px 10px 30px rgba(0,0,0,0.5);">', unsafe_allow_html=True)
    st.image("https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?q=80&w=2000", use_container_width=True)
    st.markdown('</div>', unsafe_allow_html=True)
    
    st.markdown("<br>", unsafe_allow_html=True)
    st.divider()
    
    # Texto inferior que se centrará en móviles
    st.markdown('<div class="texto-inicio-centered">', unsafe_allow_html=True)
    st.markdown(f"<h3 style='color: #6e4f02;'>Gestión Académica de Vanguardia</h3>", unsafe_allow_html=True)
    st.write("Bienvenido, Jorge Luis. Tu infraestructura digital para el éxito en Fisioterapia.")
    st.markdown('</div>', unsafe_allow_html=True)
    
    # He eliminado col1, col2 y el logo de Carrión para que la portada esté limpia

else:
    st.info(f"Sección {menu} en espera de la validación del Punto de Control 0 (Inicio).")
