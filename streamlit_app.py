import streamlit as st
import sys
import os

# --- CONEXIÓN DE RUTAS ---
ruta_actual = os.path.dirname(os.path.abspath(__file__))
ruta_modulos = os.path.join(ruta_actual, "MODULOS")
if ruta_modulos not in sys.path:
    sys.path.append(ruta_modulos)

try:
    from motor_huesos import cargar_imagen_raiz
except ImportError:
    st.error("Error al conectar con MODULOS. Revisa que la carpeta exista.")
    st.stop()

# --- CONFIGURACIÓN DE PÁGINA ---
st.set_page_config(page_title="CJ PROYECTOS - Lic. Jorge Luis", layout="wide")

# --- CSS DEFINITIVO (BLOQUEADO) ---
st.markdown("""
    <style>
    /* Fondo General */
    .stApp { background-color: #f8f9fa; }

    /* BARRA LATERAL OSCURA (Tu Favorita) */
    [data-testid="stSidebar"] {
        background-color: #111111 !important;
        border-right: 2px solid #B8860B;
    }
    
    /* Texto en Sidebar */
    [data-testid="stSidebar"] * { color: #ffffff !important; }
    
    /* Radio Buttons Dorados */
    div[data-testid="stSidebar"] .stRadio > label {
        color: #B8860B !important;
        font-size: 18px !important;
        font-weight: bold !important;
    }

    /* TÍTULO DORADO RESPONSIVE */
    .titulo-principal {
        font-family: 'Times New Roman', serif;
        color: #B8860B;
        text-align: center;
        font-weight: bold;
        text-shadow: 2px 2px 5px rgba(0,0,0,0.2);
        margin-bottom: 5px;
    }

    @media (min-width: 768px) { .titulo-principal { font-size: 65px; } }
    @media (max-width: 767px) { .titulo-principal { font-size: 38px; } }

    .subtitulo {
        text-align: center;
        color: #444444;
        font-size: 20px;
        font-style: italic;
        margin-top: -10px;
    }
    </style>
    """, unsafe_allow_html=True)

# --- CARGA DE LOGOS (RAÍZ) ---
logo_cj = cargar_imagen_raiz("logo_cj.jpg")
logo_carrion = cargar_imagen_raiz("logo_carrion.png")

# --- SIDEBAR IDENTIDAD ---
with st.sidebar:
    if logo_cj:
        st.image(logo_cj, width=160)
    st.markdown("<h2 style='text-align: center; color: #B8860B;'>PROYECTO CJ</h2>", unsafe_allow_html=True)
    st.markdown("<p style='text-align: center; opacity: 0.8;'>Lic. Jorge Luis Chiroque Panta</p>", unsafe_allow_html=True)
    st.divider()
    
    menu = st.radio(
        "MENÚ DE NAVEGACIÓN", 
        ["🏠 INICIO", "🦴 ANATOMÍA MAESTRO", "📖 REPOSITORIO CARRION", "📚 BIBLIOTECA TÉCNICA"]
    )

# --- SECCIÓN: INICIO ---
if menu == "🏠 INICIO":
    st.markdown('<h1 class="titulo-principal">PROYECTO CJ</h1>', unsafe_allow_html=True)
    st.markdown('<p class="subtitulo">Fisioterapia & Rehabilitación de Alto Nivel</p>', unsafe_allow_html=True)
    
    # Imagen de Fisioterapia Profesional
    st.image("https://images.unsplash.com/photo-1576091160550-2173dbc999ef?q=80&w=2070", 
             use_container_width=True)
    
    st.divider()
    
    c1, c2 = st.columns([2, 1])
    with c1:
        st.subheader("Gestión Académica y Profesional")
        st.write("Bienvenido Jorge Luis. Este entorno ha sido restaurado para ofrecerte la eficiencia que tu carrera exige, con el diseño que ya validamos.")
    with c2:
        if logo_carrion:
            st.image(logo_carrion, width=150)

else:
    st.info(f"El módulo **{menu}** está vinculado y listo. Confirmemos el Inicio para proceder.")
