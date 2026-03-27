import streamlit as st
import os
import urllib.parse
from MODULOS.motor_huesos import cargar_imagen_raiz

# --- CONFIGURACIÓN ---
st.set_page_config(page_title="SISTEMA CJ - Lic. Jorge Luis", layout="wide")

# --- CSS PREMIM (COLORES: AZUL #06101c, DORADO #6e4f02, ESMERALDA #008080) ---
st.markdown(f"""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
    .stApp {{ background-color: #06101c !important; color: #FFFFFF; }}
    
    /* TITULO DORADO */
    .titulo-cj {{
        font-family: 'Playfair Display', serif;
        background: linear-gradient(to bottom, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        text-align: center; font-weight: bold; font-size: 60px;
    }}

    /* TARJETAS DE CICLO */
    .contenedor-tarjeta {{
        height: 200px;
        border: 2px solid #6e4f02;
        background: rgba(0, 128, 128, 0.05);
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        border-radius: 15px; transition: 0.4s; cursor: pointer;
    }}
    .contenedor-tarjeta:hover {{
        background: rgba(0, 128, 128, 0.2);
        border-color: #008080; transform: translateY(-5px);
    }}
    .card-num {{ color: #6e4f02; font-size: 35px; font-weight: bold; }}
    .card-title {{ color: #d1d5db; font-size: 16px; letter-spacing: 2px; }}

    /* BOTONES VERDE ESMERALDA */
    div.stButton > button {{
        background-color: #008080 !important; color: white !important;
        border-radius: 10px; border: 1px solid #6e4f02; width: 100%;
    }}
    </style>
    """, unsafe_allow_html=True)

# --- SIDEBAR ---
logo_cj = cargar_imagen_raiz("logo_cj.jpg")
with st.sidebar:
    if logo_cj:
        st.markdown(f'<div style="text-align: center;"><img src="{logo_cj}" width="150"></div>', unsafe_allow_html=True)
    st.markdown("<h2 style='text-align: center; color: #6e4f02;'>PROYECTO CJ</h2>", unsafe_allow_html=True)
    st.divider()
    menu = st.radio("NAVEGACIÓN", ["🏠 INICIO", "📖 REPOSITORIO"])

# --- SECCIÓN INICIO ---
if menu == "🏠 INICIO":
    st.markdown('<h1 class="titulo-cj">PROYECTO CJ</h1>', unsafe_allow_html=True)
    st.markdown('<div style="border-radius:15px; overflow:hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">', unsafe_allow_html=True)
    st.image("https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?q=80&w=2000", use_container_width=True)
    st.markdown('</div>', unsafe_allow_html=True)
    st.markdown("<h3 style='color: #6e4f02; text-align: center; margin-top:20px;'>Gestión Académica y Clínica</h3>", unsafe_allow_html=True)

# --- SECCIÓN REPOSITORIO ---
elif menu == "📖 REPOSITORIO":
    # Cabecera con Logo Carrión
    col_t, col_l = st.columns([4, 1])
    col_t.markdown('<h1 style="color: #6e4f02;">BIBLIOTECA CARRIÓN</h1>', unsafe_allow_html=True)
    logo_c = cargar_imagen_raiz("logo_carrion.png")
    if logo_c: col_l.image(logo_c, width=100)

    # NAVEGACIÓN POR NIVELES
    if 'nivel' not in st.session_state: st.session_state.nivel = 'ciclos'

    # NIVEL 1: CICLOS
    if st.session_state.nivel == 'ciclos':
        st.write("### Selecciona tu Ciclo Académico:")
        ciclos = [("01", "FUNDAMENTOS"), ("02", "ANATOMÍA"), ("03", "AGENTES I"), ("04", "CLÍNICA IV")]
        
        c1, c2 = st.columns(2)
        for i, (num, nombre) in enumerate(ciclos):
            with (c1 if i % 2 == 0 else c2):
                st.markdown(f'<div class="contenedor-tarjeta"><div class="card-num">{num}</div><div class="card-title">CICLO</div></div>', unsafe_allow_html=True)
                if st.button(f"Entrar al Ciclo {num}", key=f"c_{num}"):
                    st.session_state.ciclo_sel = f"CICLO_{num}"
                    st.session_state.nivel = 'cursos'
                    st.rerun()

    # NIVEL 2: CURSOS (Ejemplo para Ciclo 01)
    elif st.session_state.nivel == 'cursos':
        st.markdown(f"### 📂 {st.session_state.ciclo_sel} > Selecciona el Curso:")
        if st.button("⬅ VOLVER A CICLOS"):
            st.session_state.nivel = 'ciclos'
            st.rerun()
        
        # Aquí defines los cursos según tu estructura de carpetas
        cursos = ["Anatomia_y_Fisiologia", "Biofisica", "Psicologia"] # Ajustar a tus nombres reales
        for curso in cursos:
            if st.button(f"📘 {curso.replace('_', ' ')}", key=curso):
                st.session_state.curso_sel = curso
                st.session_state.nivel = 'temas'
                st.rerun()

    # NIVEL 3: TEMAS (PDFs)
    elif st.session_state.nivel == 'temas':
        st.markdown(f"### 📄 {st.session_state.curso_sel} > Temas:")
        if st.button("⬅ VOLVER A CURSOS"):
            st.session_state.nivel = 'cursos'
            st.rerun()
        
        # Lista de archivos (Esta es la que conectaremos a GitHub)
        # Jorge, aquí pondremos los nombres exactos que veas en tus carpetas
        archivos = ["Tema_01_Introduccion.pdf", "Tema_02_Celulas.pdf"] 
        for arc in archivos:
            with st.container(border=True):
                col_n, col_v = st.columns([4, 1])
                col_n.write(arc)
                url = f"https://raw.githubusercontent.com/CJPANTA/cj-project/main/BASE_DATOS/01_CARRION/{st.session_state.ciclo_sel}/{st.session_state.curso_sel}/{urllib.parse.quote(arc)}"
                if col_v.button("👁️ Ver", key=arc):
                    st.markdown(f'<iframe src="{url}" width="100%" height="600px" style="border:2px solid #6e4f02;"></iframe>', unsafe_allow_html=True)
