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

# --- CSS CON TUS COLORES EXACTOS (#071420 y #876205) ---
st.markdown(f"""
    <style>
    /* Importar fuente elegante */
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');

    /* Fondo de la App (Tu Azul) */
    .stApp {{
        background-color: #071420 !important;
        color: #FFFFFF;
    }}

    /* BARRA LATERAL CON TU BORDE DORADO */
    [data-testid="stSidebar"] {{
        background-color: #FFFFFF !important; 
        border-right: 5px solid #876205 !important; /* Tu Dorado */
        box-shadow: 10px 0px 20px rgba(0,0,0,0.5);
    }}

    /* Texto en Sidebar (Azul para contraste) */
    [data-testid="stSidebar"] * {{
        color: #071420 !important;
    }}

    /* Título CJ (Tu Dorado sobre Tu Azul) */
    .titulo-cj {{
        font-family: 'Playfair Display', serif;
        color: #876205; 
        text-align: center;
        font-weight: bold;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        margin-top: 0px;
    }}

    /* Ajuste de Título para Celular */
    @media (min-width: 768px) {{ .titulo-cj {{ font-size: 65px; }} }}
    @media (max-width: 767px) {{ .titulo-cj {{ font-size: 38px; }} }}

    /* Líneas divisorias en Dorado */
    hr {{
        border-top: 2px solid #876205 !important;
    }}

    /* Ajuste de botones de radio en el Sidebar */
    .stRadio > label {{
        font-weight: bold !important;
        font-size: 18px !important;
    }}
    </style>
    """, unsafe_allow_html=True)

# --- CARGA DE IDENTIDAD ---
logo_cj_data = cargar_imagen_raiz("logo_cj.jpg")
logo_carrion_data = cargar_imagen_raiz("logo_carrion.png")

# --- BARRA LATERAL ---
with st.sidebar:
    if logo_cj_data:
        st.markdown(f'<div style="text-align: center; padding-bottom: 20px;"><img src="{logo_cj_data}" width="160"></div>', unsafe_allow_html=True)
    
    st.markdown("<h2 style='text-align: center; font-family: serif; margin-bottom:0;'>PROYECTO CJ</h2>", unsafe_allow_html=True)
    st.markdown("<p style='text-align: center; font-size: 14px; opacity: 0.9;'>Lic. Jorge Luis Chiroque Panta</p>", unsafe_allow_html=True)
    st.divider()
    
    menu = st.radio(
        "MENÚ DE GESTIÓN", 
        ["🏠 INICIO", "🦴 ANATOMÍA MAESTRO", "📖 REPOSITORIO CARRION", "📚 BIBLIOTECA TÉCNICA"]
    )

# --- CUERPO PRINCIPAL ---
if menu == "🏠 INICIO":
    st.markdown('<h1 class="titulo-cj">PROYECTO CJ</h1>', unsafe_allow_html=True)
    
    # Imagen de Fisioterapia (Mantenemos la calidad de Unsplash)
    st.image("https://images.unsplash.com/photo-1576091160550-2173dbc999ef?q=80&w=2070", 
             caption="Fisioterapia y Rehabilitación de Alto Nivel", 
             use_container_width=True)
    
    st.divider()
    
    col1, col2 = st.columns([2, 1])
    with col1:
        st.subheader("Optimización de Estudio y Gestión Clínica")
        st.write(f"Bienvenido Jorge Luis. La interfaz ha sido actualizada con tus códigos oficiales: Azul (#071420) y Dorado (#876205).")
    with col2:
        if logo_carrion_data:
            st.image(logo_carrion_data, width=180)

else:
    st.info(f"Módulo **{menu}** configurado con la nueva identidad visual.")
