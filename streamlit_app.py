import streamlit as st
import sys
import os
from MODULOS.motor_huesos import cargar_imagen_base64, cargar_datos_csv, BASE_DIR

st.set_page_config(page_title="CJ PROYECTOS", layout="wide")

# --- CSS SOBRIO Y ELEGANTE ---
st.markdown("""
    <style>
    /* Fondo y Texto General */
    .stApp { background-color: #FFFFFF; }
    
    /* Título Elegante CJ */
    .titulo-principal {
        font-family: 'Times New Roman', serif;
        color: #002147; /* Azul Marino */
        text-align: center;
        font-size: 55px;
        font-weight: bold;
        margin-bottom: 0px;
    }
    .dorado { color: #B8860B; } /* Dorado del Logo */
    
    .subtitulo {
        text-align: center;
        color: #666;
        font-size: 18px;
        letter-spacing: 3px;
        text-transform: uppercase;
        margin-top: -10px;
    }

    /* Sidebar Estilo Profesional */
    [data-testid="stSidebar"] {
        background-color: #002147;
        color: white;
    }
    [data-testid="stSidebar"] * { color: white !important; }
    
    /* Tarjetas de Contenido */
    .stCard {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 15px;
        transition: 0.3s;
    }
    .stCard:hover { border-color: #B8860B; box-shadow: 2px 2px 10px rgba(0,0,0,0.1); }
    </style>
""", unsafe_allow_html=True)

LINK_RAW = "https://raw.githubusercontent.com/CJPANTA/cj-project/main/BASE_DATOS/"

# --- SIDEBAR: EL LOGO ES EL PROTAGONISTA ---
with st.sidebar:
    logo_cj = cargar_imagen_base64("logo_cj.jpg")
    if logo_cj:
        st.image(logo_cj, use_container_width=True)
    st.markdown("<br>", unsafe_allow_html=True)
    st.write(f"**Lic. Jorge Luis Chiroque**")
    st.divider()
    menu = st.radio("MENÚ DE GESTIÓN", ["🏠 INICIO", "🦴 ANATOMÍA", "📖 CARRION", "📚 BIBLIOTECA"])

# --- SECCIÓN: INICIO ---
if menu == "🏠 INICIO":
    st.markdown('<h1 class="titulo-principal">PROYECTO <span class="dorado">CJ</span></h1>', unsafe_allow_html=True)
    st.markdown('<p class="subtitulo">Fisioterapia & Rehabilitación</p>', unsafe_allow_html=True)
    
    st.markdown("<br>", unsafe_allow_html=True)
    # Imagen profesional de Unsplash
    st.image("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2000", use_container_width=True)
    
    c1, c2 = st.columns([2, 1])
    with c1:
        st.subheader("Centro de Optimización Académica")
        st.write("Bienvenido, Jorge. Sistema configurado con los estándares de identidad visual CJ.")
    with c2:
        logo_c = cargar_imagen_base64("logo_carrion.png")
        if logo_c: st.image(logo_c, width=150)

# --- SECCIÓN: CARRION (PESTAÑAS LIMPIAS) ---
elif menu == "📖 CARRION":
    st.title("📖 Repositorio Carrión")
    ruta_c = os.path.join(BASE_DIR, "BASE_DATOS", "01_CARRION")
    ciclos = sorted([d for d in os.listdir(ruta_c) if os.path.isdir(os.path.join(ruta_c, d))])
    
    if ciclos:
        tabs = st.tabs(ciclos)
        for i, ciclo in enumerate(ciclos):
            with tabs[i]:
                ruta_ciclo = os.path.join(ruta_c, ciclo)
                pdfs = [f for f in os.listdir(ruta_ciclo) if f.endswith('.pdf')]
                grid = st.columns(4)
                for j, pdf in enumerate(pdfs):
                    with grid[j % 4]:
                        with st.container(border=True):
                            st.write(f"**{pdf[:20]}**")
                            url = f"{LINK_RAW}01_CARRION/{ciclo}/{pdf}".replace(" ","%20")
                            if st.button("Ver Online", key=f"c_{i}_{j}"):
                                st.markdown(f'<iframe src="{url}" width="100%" height="500px"></iframe>', unsafe_allow_html=True)
                            st.link_button("Descargar", url, use_container_width=True)
