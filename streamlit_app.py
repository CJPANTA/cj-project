import streamlit as st
import sys
import os
from MODULOS.motor_huesos import cargar_imagen_local, cargar_csv, BASE_DIR

st.set_page_config(page_title="CJ PROYECTOS - Lic. Jorge Luis", layout="wide")

# --- CSS PERSONALIZADO: COLORES CJ ---
# Azul: #003876 | Naranja: #FF6B00
st.markdown(f"""
    <style>
    .titulo-cj {{
        font-family: 'Arial Black', Gadget, sans-serif;
        color: #003876;
        text-align: center;
        font-size: 65px;
        margin-bottom: 0px;
        letter-spacing: -2px;
    }}
    .naranja {{ color: #FF6B00; }}
    .subtitulo-cj {{
        color: #555;
        text-align: center;
        font-size: 18px;
        font-weight: bold;
        margin-top: -15px;
        letter-spacing: 5px;
        border-bottom: 3px solid #FF6B00;
        padding-bottom: 10px;
        width: 50%;
        margin-left: 25%;
    }}
    .stApp {{ background-color: #F4F7F9; }}
    [data-testid="stSidebar"] {{ background-color: #003876; color: white; }}
    [data-testid="stSidebar"] * {{ color: white !important; }}
    </style>
""", unsafe_allow_html=True)

LINK_RAW = "https://raw.githubusercontent.com/CJPANTA/cj-project/main/BASE_DATOS/"

# --- SIDEBAR CON LOGO ---
with st.sidebar:
    # Usamos el logo que subiste (asegúrate que se llame logo_cj.jpg en Portadas)
    logo_img = cargar_imagen_local("logo_cj.jpg")
    if logo_img: st.image(logo_img, use_container_width=True)
    st.markdown("---")
    st.write(f"**Bienvenido, Lic. Jorge Luis**")
    menu = st.radio("MENÚ", ["🏠 PORTADA", "🦴 ANATOMÍA", "📖 CARRION", "📚 BIBLIOTECA"])

# --- SECCIÓN: INICIO (ADIÓS AL BLANCO TOTAL) ---
if menu == "🏠 PORTADA":
    st.markdown('<h1 class="titulo-cj">PROYECTO <span class="naranja">CJ</span></h1>', unsafe_allow_html=True)
    st.markdown('<p class="subtitulo-cj">FISIOTERAPIA & REHABILITACIÓN</p>', unsafe_allow_html=True)
    
    st.markdown("<br>", unsafe_allow_html=True)
    # Imagen de Unsplash vibrante de Fisioterapia
    st.image("https://images.unsplash.com/photo-1576091160550-2173dbc999ef?q=80&w=2000&auto=format&fit=crop", use_container_width=True)
    
    c1, c2 = st.columns([2,1])
    with c1:
        st.subheader("Tu Centro de Control Tecnológico")
        st.write("Plataforma diseñada para la optimización de procesos académicos y clínicos.")
    with c2:
        logo_c = cargar_imagen_local("logo_carrion.png")
        if logo_c: st.image(logo_c, width=150)

# --- SECCIÓN: CARRION (TABLAS + PESTAÑAS) ---
elif menu == "📖 CARRION":
    st.title("📖 Repositorio Ciclos Carrión")
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
                            # Miniatura estandarizada
                            st.image("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300", height=150)
                            st.write(f"**{pdf[:15]}**")
                            url_pdf = f"{LINK_RAW}01_CARRION/{ciclo}/{pdf}".replace(" ","%20")
                            if st.button("Ver", key=f"c_{i}_{j}"):
                                st.markdown(f'<iframe src="{url_pdf}" width="100%" height="500px"></iframe>', unsafe_allow_html=True)
                            st.link_button("Descargar", url_pdf)
