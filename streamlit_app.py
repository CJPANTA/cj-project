import streamlit as st
import sys
import os

# --- CONFIGURACIÓN DE RUTAS ---
ruta_actual = os.path.dirname(os.path.abspath(__file__))
ruta_modulos = os.path.join(ruta_actual, "MODULOS")
if ruta_modulos not in sys.path:
    sys.path.append(ruta_modulos)

from motor_huesos import cargar_imagen_raiz

# --- CONFIGURACIÓN DE PÁGINA ---
st.set_page_config(page_title="CJ PROYECTOS - Jorge Luis", layout="wide")

# --- RECUPERACIÓN DE ESTILO VISUAL (DORADO Y FUENTES) ---
st.markdown("""
    <style>
    /* Estilo para el título principal */
    .titulo-cj {
        font-family: 'Playfair Display', serif;
        color: #B8860B; /* Dorado Oscuro */
        text-align: center;
        font-weight: bold;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        margin-bottom: 0px;
    }
    
    /* Ajuste de tamaño por dispositivo */
    @media (min-width: 768px) { .titulo-cj { font-size: 65px; } }
    @media (max-width: 767px) { .titulo-cj { font-size: 38px; } }

    /* Estilo de los contenedores */
    .stApp {
        background-color: #ffffff;
    }
    
    .subtitulo-cj {
        color: #5d5d5d;
        text-align: center;
        font-size: 20px;
        margin-top: -10px;
        font-style: italic;
    }
    </style>
    """, unsafe_allow_html=True)

# --- CARGA DE LOGOS ---
logo_cj = cargar_imagen_raiz("logo_cj.jpg")
logo_carrion = cargar_imagen_raiz("logo_carrion.png")

# --- SIDEBAR PROFESIONAL ---
with st.sidebar:
    if logo_cj:
        st.image(logo_cj, width=140)
    st.markdown("<h2 style='text-align: center; color: #B8860B;'>PROYECTO CJ</h2>", unsafe_allow_html=True)
    st.markdown("<p style='text-align: center;'>Lic. Jorge Luis Chiroque Panta</p>", unsafe_allow_html=True)
    st.divider()
    menu = st.radio("MENÚ DE GESTIÓN", ["🏠 INICIO", "🦴 ANATOMÍA MAESTRO", "📖 REPOSITORIO CARRION", "📚 BIBLIOTECA TÉCNICA"])

# --- SECCIÓN: INICIO (DISEÑO FINAL PASO 1) ---
if menu == "🏠 INICIO":
    st.markdown('<h1 class="titulo-cj">PROYECTO CJ</h1>', unsafe_allow_html=True)
    st.markdown('<p class="subtitulo-cj">Fisioterapia & Rehabilitación Especializada</p>', unsafe_allow_html=True)
    
    # Imagen de Unsplash de alta calidad (Fisioterapia)
    st.image("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070", 
             use_container_width=True)
    
    st.divider()
    
    col1, col2 = st.columns([2, 1])
    with col1:
        st.subheader("Optimización de Estudio y Práctica Clínica")
        st.write("""
            Bienvenido al ecosistema digital diseñado para potenciar tu carrera en Fisioterapia. 
            Aquí encontrarás tus recursos de Carrión, bibliografía técnica y el motor de búsqueda 
            de anatomía avanzada.
        """)
    with col2:
        if logo_carrion:
            st.image(logo_carrion, width=180)
        st.caption("Convenio Institucional / Recursos Académicos")

else:
    st.info(f"Módulo **{menu}** conectado. Listo para restaurar diseño en el Paso 2.")
