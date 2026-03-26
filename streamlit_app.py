import streamlit as st
import sys
import os
from MODULOS.motor_huesos import img_to_base64, cargar_csv, BASE_DIR

st.set_page_config(page_title="CJ PROYECTOS", layout="wide")

# --- CSS: IDENTIDAD VISUAL SOBRIA ---
st.markdown("""
    <style>
    /* Estilo del Título Central */
    .titulo-cj {
        font-family: 'Garamond', serif;
        color: #101621; /* Azul Marino Logo */
        text-align: center;
        font-size: 60px;
        font-weight: bold;
        margin-top: 20px;
    }
    .dorado { color: #876205; } /* Dorado Logo */
    
    .linea-division {
        border-top: 3px solid #B8860B;
        width: 100px;
        margin: auto;
        margin-bottom: 20px;
    }

    /* Ajuste del Logo en Sidebar */
    [data-testid="stSidebar"] img {
        max-width: 180px; /* Tamaño controlado */
        display: block;
        margin-left: auto;
        margin-right: auto;
        border-radius: 10px;
    }
    
    /* Fondo de Sidebar */
    [data-testid="stSidebar"] {
        background-color: #002147;
    }
    [data-testid="stSidebar"] * { color: white !important; }
    
    /* Pestañas */
    .stTabs [data-baseweb="tab-list"] { gap: 10px; }
    .stTabs [data-baseweb="tab"] {
        background-color: #f0f2f6;
        border-radius: 5px;
        color: #002147;
    }
    </style>
""", unsafe_allow_html=True)

LINK_RAW = "https://raw.githubusercontent.com/CJPANTA/cj-project/main/BASE_DATOS/"

# --- SIDEBAR: LOGO Y NOMBRE ---
with st.sidebar:
    logo = img_to_base64("logo_cj.jpg")
    if logo: st.image(logo)
    st.markdown("<h3 style='text-align:center;'>CJ PROYECTOS</h3>", unsafe_allow_html=True)
    st.write(f"**Lic. Jorge Luis Chiroque**")
    st.divider()
    menu = st.radio("SISTEMA", ["🏠 PORTADA", "🦴 ANATOMÍA", "📖 CARRION", "📚 BIBLIOTECA"])

# --- SECCIÓN: PORTADA ---
if menu == "🏠 PORTADA":
    st.markdown('<h1 class="titulo-cj">PROYECTO <span class="dorado">CJ</span></h1>', unsafe_allow_html=True)
    st.markdown('<div class="linea-division"></div>', unsafe_allow_html=True)
    
    # Imagen de Unsplash elegante
    st.image("https://images.unsplash.com/photo-1576091160550-2173dbc999ef?q=80&w=2000", use_container_width=True)
    
    c1, c2 = st.columns([2, 1])
    with c1:
        st.subheader("Gestión de Conocimiento en Fisioterapia")
        st.write("Bienvenido Jorge. Sistema optimizado para el acceso rápido a la base de datos de Anatomía y Repositorio de clases.")
    with c2:
        logo_c = img_to_base64("logo_carrion.png")
        if logo_c: st.image(logo_c, width=150)

# --- SECCIÓN: CARRION (TABLAS/TABS) ---
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
                            st.link_button("Descargar", url)
