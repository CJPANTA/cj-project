import streamlit as st
import sys
import os

# --- CONEXIÓN TÉCNICA ---
ruta_actual = os.path.dirname(os.path.abspath(__file__))
ruta_modulos = os.path.join(ruta_actual, "MODULOS")
if ruta_modulos not in sys.path:
    sys.path.append(ruta_modulos)

from motor_huesos import cargar_imagen_raiz

# --- CONFIGURACIÓN DE PÁGINA ---
st.set_page_config(page_title="CJ PROYECTOS - Lic. Jorge Luis", layout="wide")

# --- ESTILO VISUAL RECUPERADO (NO NEGRO) ---
st.markdown("""
    <style>
    /* Tipografía Elegante */
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');

    .stApp {
        background-color: #FDFDFD; /* Blanco Hueso Profesional */
    }

    /* BARRA LATERAL (Gris muy suave / Blanco elegante) */
    [data-testid="stSidebar"] {
        background-color: #F8F9FA !important;
        border-right: 1.5px solid #D4AF37; /* Línea Dorada sutil */
    }

    /* Título CJ Dorado */
    .titulo-cj {
        font-family: 'Playfair Display', serif;
        color: #B8860B; /* Dorado Oscuro */
        text-align: center;
        font-weight: bold;
        line-height: 1.2;
    }

    /* Adaptabilidad Móvil */
    @media (min-width: 768px) { .titulo-cj { font-size: 60px; } }
    @media (max-width: 767px) { .titulo-cj { font-size: 34px; } }

    /* Estilo de los Menús */
    .stRadio > label {
        color: #444444 !important;
        font-weight: 600 !important;
    }
    </style>
    """, unsafe_allow_html=True)

# --- CARGA DE IDENTIDAD (Usando tu comando) ---
logo_cj_data = cargar_imagen_raiz("logo_cj.jpg")
logo_carrion_data = cargar_imagen_raiz("logo_carrion.png")

# --- BARRA LATERAL ---
with st.sidebar:
    if logo_cj_data:
        st.markdown(f'<div style="text-align: center;"><img src="{logo_cj_data}" width="150"></div>', unsafe_allow_html=True)
    
    st.markdown("<h2 style='text-align: center; color: #B8860B; font-family: serif;'>PROYECTO CJ</h2>", unsafe_allow_html=True)
    st.markdown("<p style='text-align: center; color: #666;'>Lic. Jorge Luis Chiroque Panta</p>", unsafe_allow_html=True)
    st.divider()
    
    menu = st.radio(
        "SISTEMA DE GESTIÓN", 
        ["🏠 INICIO", "🦴 ANATOMÍA MAESTRO", "📖 REPOSITORIO CARRION", "📚 BIBLIOTECA TÉCNICA"]
    )

# --- CUERPO PRINCIPAL ---
if menu == "🏠 INICIO":
    st.markdown('<h1 class="titulo-cj">PROYECTO CJ</h1>', unsafe_allow_html=True)
    
    # Imagen enfocada en fisioterapia
    st.image("https://images.unsplash.com/photo-1576091160550-2173dbc999ef?q=80&w=2070", 
             use_container_width=True)
    
    st.divider()
    
    col1, col2 = st.columns([2, 1])
    with col1:
        st.subheader("Optimización de Estudio Fisioterapéutico")
        st.write("Bienvenido Jorge Luis. Tu centro de recursos está listo y adaptado.")
    with col2:
        if logo_carrion_data:
            st.image(logo_carrion_data, width=160)

else:
    st.info(f"Módulo **{menu}** conectado con el diseño base. ¿Procedemos con los datos?")
