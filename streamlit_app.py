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

# --- DISEÑO CON "ALMA": LÍNEAS FINAS Y COLORES TXT ---
# AZUL: #06101c | DORADO: #6e4f02
st.markdown(f"""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Montserrat:wght@300;400&display=swap');

    .stApp {{
        background-color: #06101c !important;
        color: #FFFFFF;
    }}

    /* BARRA LATERAL CON LÍNEA FINA MARCADA */
    [data-testid="stSidebar"] {{
        background-color: #06101c !important;
        border-right: 1px solid #6e4f02 !important; /* Línea fina pero definida */
    }}

    /* TÍTULO ELEGANTE (TIPOGRAFÍA ANTERIOR) */
    .titulo-cj {{
        font-family: 'Playfair Display', serif;
        color: #6e4f02;
        text-align: center;
        font-weight: 700;
        letter-spacing: 2px;
        margin-top: -20px;
    }}

    .subtitulo-cj {{
        font-family: 'Playfair Display', serif;
        font-style: italic;
        color: #FFFFFF;
        text-align: center;
        font-size: 18px;
        opacity: 0.8;
        letter-spacing: 3px;
        margin-top: -15px;
        border-bottom: 1px solid #6e4f02; /* Línea fina debajo del subtítulo */
        padding-bottom: 15px;
        margin-bottom: 25px;
    }}

    /* CUADROS DE CONTENIDO CON BORDES FINOS */
    .contenedor-info {{
        border: 1px solid #6e4f02;
        padding: 20px;
        border-radius: 2px;
        background-color: rgba(110, 79, 2, 0.05);
    }}

    /* ESTILO DE RADIO BUTTONS (Sidebar) */
    .stRadio label p {{
        color: #FFFFFF !important;
        font-family: 'Montserrat', sans-serif;
        font-size: 15px !important;
        text-transform: uppercase;
        letter-spacing: 1px;
    }}

    /* DIVISORES DORADOS FINOS */
    hr {{
        border: 0;
        height: 1px;
        background-image: linear-gradient(to right, rgba(110, 79, 2, 0), rgba(110, 79, 2, 0.75), rgba(110, 79, 2, 0));
        margin: 30px 0;
    }}
    </style>
    """, unsafe_allow_html=True)

# --- CARGA DE LOGOS ---
logo_cj = cargar_imagen_raiz("logo_cj.jpg")
logo_carrion = cargar_imagen_raiz("logo_carrion.png")

# --- SIDEBAR (ESTILO ESTRUCTURADO) ---
with st.sidebar:
    if logo_cj:
        st.markdown(f'<div style="text-align: center; padding: 20px 0;"><img src="{logo_cj}" width="140" style="border: 1px solid #6e4f02; padding: 5px;"></div>', unsafe_allow_html=True)
    
    st.markdown("<h3 style='text-align: center; color: #6e4f02; font-family: serif; letter-spacing: 2px;'>PROYECTO CJ</h3>", unsafe_allow_html=True)
    st.markdown("<p style='text-align: center; font-size: 12px; color: white; opacity: 0.6; text-transform: uppercase;'>Especialista en Rehabilitación</p>", unsafe_allow_html=True)
    st.markdown("<div style='border-top: 1px solid #6e4f02; margin: 15px 0;'></div>", unsafe_allow_html=True)
    
    menu = st.radio(
        "NAVEGACIÓN PRINCIPAL", 
        ["🏠 INICIO", "🦴 ANATOMÍA MAESTRO", "📖 REPOSITORIO CARRION", "📚 BIBLIOTECA TÉCNICA"]
    )

# --- CUERPO PRINCIPAL (INICIO) ---
if menu == "🏠 INICIO":
    st.markdown('<h1 class="titulo-cj">PROYECTO CJ</h1>', unsafe_allow_html=True)
    st.markdown('<p class="subtitulo-cj">FISIOTERAPIA & ESTUDIO AVANZADO</p>', unsafe_allow_html=True)
    
    # Imagen con marco fino
    st.markdown('<div style="border: 1px solid #6e4f02; padding: 5px;">', unsafe_allow_html=True)
    st.image("https://images.unsplash.com/photo-1576091160550-2173dbc999ef?q=80&w=2070", use_container_width=True)
    st.markdown('</div>', unsafe_allow_html=True)
    
    st.divider()
    
    col1, col2 = st.columns([2, 1])
    with col1:
        st.markdown(f"""
            <div class="contenedor-info">
                <h4 style="color: #6e4f02; font-family: serif;">Bienvenido, Lic. Jorge Luis</h4>
                <p style="font-family: 'Montserrat', sans-serif; font-size: 14px; opacity: 0.9;">
                    Este ecosistema digital integra la precisión anatómica con el rigor académico de Carrión. 
                    Diseñado para la eficiencia técnica y la excelencia en rehabilitación física.
                </p>
            </div>
        """, unsafe_allow_html=True)
    with col2:
        if logo_carrion:
            st.markdown('<div style="text-align: center; opacity: 0.8;">', unsafe_allow_html=True)
            st.image(logo_carrion, width=150)
            st.markdown('</div>', unsafe_allow_html=True)

else:
    st.info(f"Módulo **{menu}** activado con la estructura visual CJ.")
