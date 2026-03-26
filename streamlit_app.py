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

# --- CSS PERSONALIZADO: AZUL CJ Y BORDE DORADO ---
st.markdown("""
    <style>
    /* Fondo Azul Profundo (Color del Logo) */
    .stApp {
        background-color: #002341; /* Azul corporativo */
        color: #FFFFFF;
    }

    /* BARRA LATERAL CON BORDE DORADO ELEGANTE */
    [data-testid="stSidebar"] {
        background-color: #FFFFFF !important; /* Sidebar blanco para contraste */
        border-right: 4px solid #B8860B !important; /* Borde Dorado Grueso y Elegante */
        box-shadow: 5px 0px 15px rgba(0,0,0,0.3);
    }

    /* Texto dentro del Sidebar */
    [data-testid="stSidebar"] * {
        color: #002341 !important;
    }

    /* Título CJ Dorado con Sombra para resaltar sobre el Azul */
    .titulo-cj {
        font-family: 'Playfair Display', serif;
        color: #D4AF37; /* Dorado más brillante */
        text-align: center;
        font-weight: bold;
        text-shadow: 3px 3px 6px rgba(0,0,0,0.5);
    }

    /* Ajuste Celular */
    @media (min-width: 768px) { .titulo-cj { font-size: 65px; } }
    @media (max-width: 767px) { .titulo-cj { font-size: 38px; } }

    /* Divisores Dorados */
    hr {
        border-top: 2px solid #B8860B !important;
    }

    /* Estilo de Subtítulos en blanco para que se lean sobre el azul */
    h3, p, span {
        color: #FFFFFF !important;
    }
    
    /* Excepto en el Sidebar */
    [data-testid="stSidebar"] h2, [data-testid="stSidebar"] p, [data-testid="stSidebar"] label {
        color: #002341 !important;
    }
    </style>
    """, unsafe_allow_html=True)

# --- CARGA DE IDENTIDAD ---
logo_cj_data = cargar_imagen_raiz("logo_cj.jpg")
logo_carrion_data = cargar_imagen_raiz("logo_carrion.png")

# --- BARRA LATERAL ---
with st.sidebar:
    if logo_cj_data:
        st.markdown(f'<div style="text-align: center;"><img src="{logo_cj_data}" width="160"></div>', unsafe_allow_html=True)
    
    st.markdown("<h2 style='text-align: center; font-family: serif; margin-bottom:0;'>PROYECTO CJ</h2>", unsafe_allow_html=True)
    st.markdown("<p style='text-align: center; font-size: 14px;'>Lic. Jorge Luis Chiroque Panta</p>", unsafe_allow_html=True)
    st.markdown("<br>", unsafe_allow_html=True)
    
    menu = st.radio(
        "SISTEMA DE GESTIÓN", 
        ["🏠 INICIO", "🦴 ANATOMÍA MAESTRO", "📖 REPOSITORIO CARRION", "📚 BIBLIOTECA TÉCNICA"]
    )

# --- CUERPO PRINCIPAL ---
if menu == "🏠 INICIO":
    st.markdown('<h1 class="titulo-cj">PROYECTO CJ</h1>', unsafe_allow_html=True)
    
    # Imagen de Fisioterapia
    st.image("https://images.unsplash.com/photo-1576091160550-2173dbc999ef?q=80&w=2070", 
             caption="Fisioterapia y Rehabilitación Especializada", 
             use_container_width=True)
    
    st.divider()
    
    col1, col2 = st.columns([2, 1])
    with col1:
        st.subheader("Optimización de Estudio y Gestión")
        st.write("Bienvenido Jorge Luis. Tu entorno profesional ha sido restaurado con tus colores corporativos.")
    with col2:
        if logo_carrion_data:
            st.image(logo_carrion_data, width=180)

else:
    st.info(f"Módulo **{menu}** conectado. Listo para cargar contenido.")
