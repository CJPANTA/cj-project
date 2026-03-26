import streamlit as st
import sys
import os
from MODULOS.motor_huesos import obtener_imagen_base64, BASE_DIR

st.set_page_config(page_title="CJ PROJECT - MASTER", layout="wide")

# --- DISEÑO INMERSIVO: TODO EN AZUL PROFUNDO Y DORADO ---
st.markdown(f"""
    <style>
    /* 1. IMPORTAR FUENTES ELEGANTES (Estilo FontMeme/Cinzel) */
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Montserrat:wght@300;700&display=swap');

    /* 2. FONDO TOTAL DE LA APP (#101621) */
    .stApp {{
        background-color: #101621;
        color: #E0E0E0;
    }}

    /* 3. BARRA LATERAL (BLINDADA) */
    [data-testid="stSidebar"] {{
        background-color: #0D121A !important; /* Un tono más oscuro para contraste */
        border-right: 2px solid #876205 !important;
    }}
    
    /* 4. TÍTULO CON ESTILO "FANCY" Y DORADO */
    .contenedor-titulo {{
        text-align: center;
        padding: 50px 0px;
        background: radial-gradient(circle, rgba(135,98,5,0.1) 0%, rgba(16,22,33,1) 70%);
    }}
    .titulo-cj {{
        font-family: 'Cinzel', serif; /* Fuente clásica y elegante */
        color: #FFFFFF;
        font-size: 85px;
        font-weight: 900;
        margin-bottom: 0px;
        letter-spacing: 5px;
        text-shadow: 3px 3px 10px rgba(0,0,0,0.5);
    }}
    .titulo-cj span {{
        color: #876205; /* Tu Dorado */
        text-shadow: 0 0 15px rgba(135,98,5,0.4);
    }}
    .subtitulo-tech {{
        font-family: 'Montserrat', sans-serif;
        color: #876205;
        font-size: 15px;
        font-weight: 300;
        letter-spacing: 12px;
        text-transform: uppercase;
        margin-top: 10px;
    }}

    /* 5. TARJETAS "GLASSMORPHISM" (Efecto cristal sobre fondo oscuro) */
    .stContainer {{
        background: rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        border: 1px solid rgba(135, 98, 5, 0.3);
        backdrop-filter: blur(10px);
        padding: 30px;
        transition: all 0.4s ease;
    }}
    .stContainer:hover {{
        border: 1px solid #876205;
        background: rgba(255, 255, 255, 0.08);
    }}

    /* Pestañas (Tabs) Coherentes */
    .stTabs [data-baseweb="tab-list"] {{
        background-color: rgba(0,0,0,0.3);
        border-radius: 10px;
        padding: 8px;
    }}
    .stTabs [data-baseweb="tab"] {{
        color: #888 !important;
        font-family: 'Montserrat', sans-serif;
    }}
    .stTabs [aria-selected="true"] {{
        background-color: #876205 !important;
        color: white !important;
    }}
    
    /* Botones con estilo de la barra lateral */
    .stButton>button {{
        background-color: transparent;
        color: #876205;
        border: 2px solid #876205;
        font-family: 'Montserrat', sans-serif;
        font-weight: 700;
        border-radius: 8px;
        padding: 10px 20px;
    }}
    .stButton>button:hover {{
        background-color: #876205;
        color: #101621;
    }}
    </style>
""", unsafe_allow_html=True)

LINK_RAW = "https://raw.githubusercontent.com/CJPANTA/cj-project/main/BASE_DATOS/"

# --- SIDEBAR (CONSERVADA) ---
with st.sidebar:
    logo_path = obtener_imagen_base64("logo_cj.jpg")
    if logo_path:
        st.image(logo_path, use_container_width=True)
    st.markdown("<div style='height: 15px;'></div>", unsafe_allow_html=True)
    menu = st.radio("SELECCIONE MÓDULO", ["🏠 PORTADA", "🦴 ANATOMÍA", "📖 REPOSITORIO", "📚 BIBLIOTECA"])
    st.divider()
    st.caption("Lic. Jorge Luis Chiroque Panta")

# --- CENTRO DE LA APP: EL SALTO DE CALIDAD ---
if menu == "🏠 PORTADA":
    st.markdown("""
        <div class="contenedor-titulo">
            <div class="titulo-cj">PROYECTO <span>CJ</span></div>
            <div class="subtitulo-tech">Fisioterapia & Innovación</div>
        </div>
    """, unsafe_allow_html=True)
    
    # Imagen con máscara suave para que no brille tanto el blanco de la foto
    st.markdown('<div style="border: 2px solid #876205; border-radius: 20px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.5);">', unsafe_allow_html=True)
    st.image("https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?q=80&w=2000", use_container_width=True)
    st.markdown('</div>', unsafe_allow_html=True)
    
    st.markdown("<br><br>", unsafe_allow_html=True)
    
    col1, col2 = st.columns([2, 1])
    with col1:
        with st.container():
            st.markdown("<h3 style='color:#876205; font-family:Cinzel;'>⚓ Centro de Mando</h3>", unsafe_allow_html=True)
            st.write("Ecosistema digital diseñado para el alto rendimiento académico del Lic. Jorge Luis. Acceso directo a activos de fisioterapia con interfaz de baja fatiga visual.")
    with col2:
        with st.container():
            st.markdown("<h5 style='text-align:center; color:#E0E0E0; font-family:Montserrat; letter-spacing:3px;'>ALIADOS</h5>", unsafe_allow_html=True)
            logo_c = obtener_imagen_base64("logo_carrion.png")
            if logo_c: st.image(logo_c, width=150)
