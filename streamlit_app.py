import streamlit as st
import sys
import os

# --- RUTAS DINÁMICAS ---
ruta_actual = os.path.dirname(os.path.abspath(__file__))
ruta_modulos = os.path.join(ruta_actual, "MODULOS")
# Ruta para logos en 04_PORTADAS
ruta_portadas = os.path.join(ruta_actual, "BASE_DATOS", "04_PORTADAS")

if ruta_modulos not in sys.path:
    sys.path.append(ruta_modulos)

from motor_huesos import cargar_imagen_raiz

# Función auxiliar para cargar desde la nueva carpeta de portadas
def cargar_logo_portada(nombre):
    ruta = os.path.join(ruta_portadas, nombre)
    import base64
    if os.path.exists(ruta):
        with open(ruta, "rb") as f:
            data = f.read()
        return f"data:image/png;base64,{base64.b64encode(data).decode()}"
    return None

# --- CONFIGURACIÓN ---
st.set_page_config(page_title="CJ PROYECTOS", layout="wide")

# --- CSS: AFINANDO LA BARRA LATERAL Y EL ESTILO ---
st.markdown(f"""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@300;400&display=swap');

    .stApp {{ background-color: #06101c !important; color: #FFFFFF; }}

    /* BARRA LATERAL: Ajuste de texto para una sola línea */
    [data-testid="stSidebar"] {{
        background-color: #06101c !important;
        border-right: 1px solid #6e4f02 !important;
        min-width: 300px !important;
    }}
    
    .stRadio label p {{
        color: #FFFFFF !important;
        font-family: 'Montserrat', sans-serif;
        font-size: 13px !important; /* Más pequeña para encuadrar */
        text-transform: uppercase;
        letter-spacing: 1px;
        white-space: nowrap; /* Evita el salto de línea */
    }}

    /* Estilo de Vidrio para el Dashboard en Carrión */
    .glass-card {{
        background: rgba(110, 79, 2, 0.05);
        border: 1px solid #6e4f02;
        padding: 15px;
        border-radius: 2px;
        backdrop-filter: blur(10px);
        margin-bottom: 15px;
    }}

    .titulo-cj {{
        font-family: 'Playfair Display', serif;
        color: #6e4f02;
        text-align: center;
        letter-spacing: 2px;
    }}
    </style>
    """, unsafe_allow_html=True)

# --- CARGA DE LOGOS (Desde 04_PORTADAS) ---
logo_cj = cargar_imagen_raiz("logo_cj.jpg")
logo_carrion = cargar_logo_portada("logo_carrion.png")

# --- SIDEBAR ---
with st.sidebar:
    if logo_cj:
        st.markdown(f'<div style="text-align: center;"><img src="{logo_cj}" width="120"></div>', unsafe_allow_html=True)
    st.markdown("<h4 style='text-align: center; color: #6e4f02; font-family: serif;'>SISTEMA CJ</h4>", unsafe_allow_html=True)
    st.divider()
    
    menu = st.radio(
        "NAVEGACIÓN", 
        ["🏠 INICIO PRINCIPAL", "🦴 ANATOMÍA MAESTRO", "📖 REPOSITORIO CARRION", "🧬 LABORATORIO AUCALLAMA"]
    )

# --- 1. PANTALLA PRINCIPAL (SOLO IMAGEN Y BIENVENIDA) ---
if menu == "🏠 INICIO PRINCIPAL":
    st.markdown('<h1 class="titulo-cj">PROYECTO CJ</h1>', unsafe_allow_html=True)
    # Imagen del chico haciendo ejercicios (estética activa)
    st.image("https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070", 
             caption="Fisioterapia: Movimiento es Salud", use_container_width=True)
    st.markdown("<p style='text-align: center; opacity: 0.7;'>Bienvenido al centro de gestión de Jorge Luis Chiroque.</p>", unsafe_allow_html=True)

# --- 2. REPOSITORIO CARRION (AQUÍ VA EL DASHBOARD) ---
elif menu == "📖 REPOSITORIO CARRION":
    col_t, col_l = st.columns([3, 1])
    with col_t:
        st.markdown('<h2 style="color: #6e4f02; font-family: serif;">REPOSITORIO CARRION</h2>', unsafe_allow_html=True)
    with col_l:
        if logo_carrion: st.image(logo_carrion, width=100)

    # Dashboard de Estudios dentro de Carrión
    st.markdown("### Dashboard de Usuario")
    c1, c2, c3 = st.columns(3)
    with c1: st.markdown('<div class="glass-card"><b>CICLO</b><br>IV - 2026</div>', unsafe_allow_html=True)
    with c2: st.markdown('<div class="glass-card"><b>PROGRESO</b><br>85% Completado</div>', unsafe_allow_html=True)
    with c3: st.markdown('<div class="glass-card"><b>NOTAS</b><br>Promedio: 18</div>', unsafe_allow_html=True)

    st.divider()
    st.subheader("Archivos de Clase")
    # Simulación de lista de archivos
    for doc in ["Clase 01 - Agentes.pdf", "Clase 02 - Anatomía.pdf"]:
        col_doc, col_btn = st.columns([4, 1])
        col_doc.write(f"📄 {doc}")
        col_btn.button("Ver", key=doc)

# --- OTROS MÓDULOS ---
else:
    st.info(f"Módulo **{menu}** en desarrollo.")
