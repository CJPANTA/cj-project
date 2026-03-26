import streamlit as st
import sys
import os
from MODULOS.motor_huesos import cargar_imagen_local, cargar_csv, BASE_DIR

# --- CONFIGURACIÓN ---
st.set_page_config(page_title="CJ PROYECTOS - Lic. Jorge Luis", layout="wide")

# Estilo Dorado para el Título
ESTILO_DORADO = """
    <style>
    .titulo-cj {
        font-family: 'Serif'; color: #B8860B; text-align: center;
        font-size: 55px; font-weight: bold; text-shadow: 2px 2px 4px #000000;
    }
    .stTabs [data-baseweb="tab-list"] { gap: 10px; }
    .stTabs [data-baseweb="tab"] { 
        background-color: #f0f2f6; border-radius: 5px; padding: 10px; 
    }
    </style>
"""
st.markdown(ESTILO_DORADO, unsafe_allow_html=True)

# URL para GitHub
LINK_RAW = "https://raw.githubusercontent.com/CJPANTA/cj-project/main/BASE_DATOS/"

# --- SIDEBAR ---
logo_cj = cargar_imagen_local("logo_cj.jpg")
if logo_cj: st.sidebar.image(logo_cj, width=150)
st.sidebar.markdown(f"### Lic. Jorge Luis Chiroque\n**CJ Proyectos**")
menu = st.sidebar.radio("MENÚ", ["🏠 INICIO", "🦴 ANATOMÍA", "📖 CARRION", "📚 BIBLIOTECA"])

# --- SECCIÓN: INICIO ---
if menu == "🏠 INICIO":
    st.markdown('<h1 class="titulo-cj">PROYECTO CJ</h1>', unsafe_allow_html=True)
    st.image("https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?q=80&w=2000&auto=format&fit=crop", caption="Excelencia en Fisioterapia")
    st.divider()
    col1, col2 = st.columns(2)
    with col1:
        st.info("Sistema de optimización de estudio y gestión clínica.")
    with col2:
        logo_carrion = cargar_imagen_local("logo_carrion.png")
        if logo_carrion: st.image(logo_carrion, width=200)

# --- SECCIÓN: CARRION (PESTAÑAS + LOGO) ---
elif menu == "📖 CARRION":
    logo_c = cargar_imagen_local("logo_carrion.png")
    col_t, col_l = st.columns([4,1])
    col_t.title("📖 Repositorio Ciclos Carrión")
    if logo_c: col_l.image(logo_c, width=120)
    
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
                            # Imagen estandarizada
                            st.image("https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=400", use_container_width=True)
                            st.write(f"**{pdf[:25]}**")
                            url = f"{LINK_RAW}01_CARRION/{ciclo}/{pdf}".replace(" ","%20")
                            # Visor dinámico
                            if st.button("👁️ Ver Online", key=f"v_{i}_{j}"):
                                st.markdown(f'<iframe src="{url}" width="100%" height="500px"></iframe>', unsafe_allow_html=True)
                            st.link_button("📥 Descargar", url, use_container_width=True)

# --- SECCIÓN: BIBLIOTECA (PAREJA Y ESTANDARIZADA) ---
elif menu == "📚 BIBLIOTECA":
    st.title("📚 Biblioteca Técnica")
    ruta_s = os.path.join(BASE_DIR, "BASE_DATOS", "02_SISTEMAS")
    libros = [f for f in os.listdir(ruta_s) if f.endswith('.pdf')]
    
    grid = st.columns(4)
    for i, lib in enumerate(libros):
        with grid[i % 4]:
            with st.container(border=True):
                # Intentar cargar portada con mismo nombre del PDF
                nombre_base = os.path.splitext(lib)[0]
                portada = cargar_imagen_local(f"{nombre_base}.jpg")
                if portada: st.image(portada, height=250) # Altura fija para que sean PAREJOS
                else: st.image("https://images.unsplash.com/photo-1544640808-32ca72ac7f37?w=400", height=250)
                
                st.write(f"**{lib[:30]}**")
                url_l = f"{LINK_RAW}02_SISTEMAS/{lib}".replace(" ","%20")
                if st.button("📖 Leer", key=f"l_{i}"):
                    st.markdown(f'<iframe src="{url_l}" width="100%" height="500px"></iframe>', unsafe_allow_html=True)
                st.link_button("⬇️ Bajar", url_l, use_container_width=True)
