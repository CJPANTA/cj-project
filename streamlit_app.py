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

# --- BLOQUE DE ESTILO INAMOVIBLE (COLORES Y FUENTES) ---
st.markdown("""
    <style>
    /* Fondo principal y fuentes */
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Roboto:wght@300;400&display=swap');
    
    .stApp {
        background-color: #FFFFFF;
    }

    /* Título CJ Dorado Elegante */
    .titulo-cj {
        font-family: 'Playfair Display', serif;
        color: #B8860B;
        text-align: center;
        font-weight: bold;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        margin-top: 0px;
    }

    /* BARRA LATERAL (Los colores que te gustaron) */
    [data-testid="stSidebar"] {
        background-color: #1A1A1A; /* Oscuro elegante */
        color: #FFFFFF;
    }
    
    [data-testid="stSidebar"] * {
        color: #FFFFFF !important;
    }

    /* Ajuste para Celulares */
    @media (min-width: 768px) { .titulo-cj { font-size: 60px; } }
    @media (max-width: 767px) { 
        .titulo-cj { font-size: 35px; }
        [data-testid="stSidebar"] { width: 100% !important; }
    }

    /* Botones y Radio Buttons en la barra lateral */
    .stRadio > label {
        color: #B8860B !important;
        font-weight: bold;
    }
    </style>
    """, unsafe_allow_html=True)

# --- CARGA DE IDENTIDAD ---
logo_cj = cargar_imagen_raiz("logo_cj.jpg")
logo_carrion = cargar_imagen_raiz("logo_carrion.png")

# --- BARRA LATERAL (RECUPERADA) ---
with st.sidebar:
    if logo_cj:
        st.image(logo_cj, width=150)
    st.markdown("<h2 style='text-align: center; color: #B8860B; margin-bottom: 0px;'>PROYECTO CJ</h2>", unsafe_allow_html=True)
    st.markdown("<p style='text-align: center; font-size: 14px; opacity: 0.8;'>Lic. Jorge Luis Chiroque Panta</p>", unsafe_allow_html=True)
    st.divider()
    
    # Menú con los nombres que fijamos
    menu = st.radio(
        "MENÚ DE GESTIÓN", 
        ["🏠 INICIO", "🦴 ANATOMÍA MAESTRO", "📖 REPOSITORIO CARRION", "📚 BIBLIOTECA TÉCNICA"],
        index=0
    )

# --- SECCIÓN: INICIO ---
if menu == "🏠 INICIO":
    st.markdown('<h1 class="titulo-cj">PROYECTO CJ</h1>', unsafe_allow_html=True)
    
    # Imagen de Fisioterapia seleccionada (Unsplash)
    st.image("https://images.unsplash.com/photo-1576091160550-2173dbc999ef?q=80&w=2070", 
             caption="Fisioterapia y Rehabilitación Especializada", 
             use_container_width=True)
    
    st.divider()
    
    col1, col2 = st.columns([2, 1])
    with col1:
        st.subheader("Optimización de Estudio y Gestión")
        st.write("""
            Bienvenido, Jorge Luis. Este entorno ha sido diseñado para centralizar 
            tus recursos académicos de Carrión y herramientas técnicas de fisioterapia 
            con la máxima eficiencia visual y operativa.
        """)
    with col2:
        if logo_carrion:
            st.image(logo_carrion, width=160)
        st.caption("Recursos Ciclo IV - Carrión")

else:
    st.info(f"Módulo **{menu}** listo para recibir la actualización de contenido en el siguiente paso.")
