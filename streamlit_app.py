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

# --- CSS DEFINITIVO: FORZANDO COLORES (#071420 y #876205) ---
st.markdown(f"""
    <style>
    /* 1. FONDO PRINCIPAL */
    .stApp {{
        background-color: #071420 !important;
    }}

    /* 2. BARRA LATERAL: FORZADO DE COLOR AZUL Y BORDE DORADO */
    [data-testid="stSidebar"] {{
        background-color: #071420 !important; /* Tu Azul */
        border-right: 5px solid #876205 !important; /* Tu Dorado */
    }}

    /* 3. TEXTOS EN BARRA LATERAL (Blancos para que se lean) */
    [data-testid="stSidebar"] {{
        color: #FFFFFF !important;
    }}
    
    /* Forzar color de los Radio Buttons y etiquetas en Sidebar */
    [data-testid="stSidebar"] .stRadio label p {{
        color: #FFFFFF !important;
        font-size: 17px !important;
        font-weight: 500 !important;
    }}

    /* 4. TÍTULO CJ DORADO */
    .titulo-cj {{
        font-family: 'serif';
        color: #876205; 
        text-align: center;
        font-weight: bold;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    }}

    @media (min-width: 768px) {{ .titulo-cj {{ font-size: 60px; }} }}
    @media (max-width: 767px) {{ .titulo-cj {{ font-size: 35px; }} }}

    /* Divisores Dorados */
    hr {{
        border-top: 2px solid #876205 !important;
    }}
    </style>
    """, unsafe_allow_html=True)

# --- CARGA DE IDENTIDAD ---
logo_cj_data = cargar_imagen_raiz("logo_cj.jpg")
logo_carrion_data = cargar_imagen_raiz("logo_carrion.png")

# --- BARRA LATERAL ---
with st.sidebar:
    if logo_cj_data:
        st.markdown(f'<div style="text-align: center; padding: 10px;"><img src="{logo_cj_data}" width="150"></div>', unsafe_allow_html=True)
    
    st.markdown("<h2 style='text-align: center; color: #876205; margin-bottom:0;'>PROYECTO CJ</h2>", unsafe_allow_html=True)
    st.markdown("<p style='text-align: center; color: #FFFFFF; opacity: 0.8;'>Lic. Jorge Luis Chiroque Panta</p>", unsafe_allow_html=True)
    st.divider()
    
    menu = st.radio(
        "MENÚ DE NAVEGACIÓN", 
        ["🏠 INICIO", "🦴 ANATOMÍA MAESTRO", "📖 REPOSITORIO CARRION", "📚 BIBLIOTECA TÉCNICA"]
    )

# --- CUERPO PRINCIPAL ---
if menu == "🏠 INICIO":
    st.markdown('<h1 class="titulo-cj">PROYECTO CJ</h1>', unsafe_allow_html=True)
    
    st.image("https://images.unsplash.com/photo-1576091160550-2173dbc999ef?q=80&w=2070", 
             use_container_width=True)
    
    st.divider()
    
    c1, c2 = st.columns([2, 1])
    with c1:
        st.markdown("<h3 style='color: #876205;'>Excelencia en Fisioterapia</h3>", unsafe_allow_html=True)
        st.write("Interfaz profesional adaptada con tus códigos de color exactos.")
    with c2:
        if logo_carrion_data:
            st.image(logo_carrion_data, width=160)

else:
    st.info(f"Sección {menu} lista.")
