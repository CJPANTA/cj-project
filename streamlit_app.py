import streamlit as st
import os
import urllib.parse
from MODULOS.motor_huesos import cargar_imagen_raiz

# --- CONFIGURACIÓN ---
st.set_page_config(page_title="SISTEMA CJ - Repositorio", layout="wide")

# URL BASE GITHUB RAW (Ajustada a tu estructura de carpetas)
LINK_RAW = "https://raw.githubusercontent.com/CJPANTA/cj-project/main/BASE_DATOS/01_CARRION/"

# --- CSS PREMIUM ---
st.markdown(f"""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
    .stApp {{ background-color: #06101c !important; color: #FFFFFF; }}
    
    .titulo-cj {{
        font-family: 'Playfair Display', serif;
        background: linear-gradient(to bottom, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        text-align: center; font-weight: bold; font-size: 55px;
    }}

    .contenedor-tarjeta {{
        height: 160px; border: 2px solid #6e4f02; background: rgba(0, 128, 128, 0.05);
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        border-radius: 15px; transition: 0.4s; margin-bottom: 10px;
    }}
    .contenedor-tarjeta:hover {{ border-color: #008080; background: rgba(0, 128, 128, 0.15); }}
    .card-num {{ color: #6e4f02; font-size: 30px; font-weight: bold; }}
    
    /* BOTONES VERDE ESMERALDA */
    div.stButton > button {{
        background-color: #008080 !important; color: white !important;
        border-radius: 10px; border: 1px solid #6e4f02; width: 100%; font-weight: bold;
    }}
    </style>
    """, unsafe_allow_html=True)

# --- SIDEBAR ---
logo_cj = cargar_imagen_raiz("logo_cj.jpg")
with st.sidebar:
    if logo_cj: st.markdown(f'<div style="text-align: center;"><img src="{logo_cj}" width="140"></div>', unsafe_allow_html=True)
    st.markdown("<h2 style='text-align: center; color: #6e4f02;'>PROYECTO CJ</h2>", unsafe_allow_html=True)
    st.divider()
    menu = st.radio("NAVEGACIÓN", ["🏠 INICIO", "📖 REPOSITORIO"])

# --- INICIO ---
if menu == "🏠 INICIO":
    st.markdown('<h1 class="titulo-cj">PROYECTO CJ</h1>', unsafe_allow_html=True)
    st.image("https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?q=80&w=2000", use_container_width=True)
    st.markdown("<h3 style='color: #6e4f02; text-align: center;'>Gestión Académica de Vanguardia</h3>", unsafe_allow_html=True)

# --- REPOSITORIO ---
elif menu == "📖 REPOSITORIO":
    col_t, col_l = st.columns([4, 1])
    col_t.markdown('<h1 style="color: #6e4f02;">BIBLIOTECA CARRIÓN</h1>', unsafe_allow_html=True)
    logo_c = cargar_imagen_raiz("logo_carrion.png")
    if logo_c: col_l.image(logo_c, width=100)

    if 'paso' not in st.session_state: st.session_state.paso = 'ciclos'

    # PASO 1: CICLOS
    if st.session_state.paso == 'ciclos':
        st.write("### Selecciona el Ciclo:")
        cols = st.columns(2)
        ciclos = [("01", "FUNDAMENTOS"), ("02", "ANATOMÍA"), ("03", "AGENTES I"), ("04", "CLÍNICA IV")]
        for i, (num, name) in enumerate(ciclos):
            with cols[i % 2]:
                st.markdown(f'<div class="contenedor-tarjeta"><div class="card-num">{num}</div><div style="color:#d1d5db;">{name}</div></div>', unsafe_allow_html=True)
                if st.button(f"ABRIR CICLO {num}", key=f"c_{num}"):
                    st.session_state.ciclo_sel = f"CICLO_{num}"
                    st.session_state.paso = 'cursos'
                    st.rerun()

    # PASO 2: CURSOS
    elif st.session_state.paso == 'cursos':
        st.markdown(f"### 📂 {st.session_state.ciclo_sel} > Cursos:")
        if st.button("⬅ VOLVER"): st.session_state.paso = 'ciclos'; st.rerun()
        
        # Agregamos Masoterapia según tu captura
        cursos = ["MASOTERAPIA", "ANATOMIA_FISIOLOGIA", "BIOFISICA"]
        for curso in cursos:
            if st.button(f"📘 {curso.replace('_', ' ')}"):
                st.session_state.curso_sel = curso
                st.session_state.paso = 'temas'
                st.rerun()

    # PASO 3: TEMAS (PDFs)
    elif st.session_state.paso == 'temas':
        st.markdown(f"### 📄 {st.session_state.curso_sel} > Documentos:")
        if st.button("⬅ VOLVER"): st.session_state.paso = 'cursos'; st.rerun()
        
        # AQUÍ ESTÁ TU ARCHIVO CONECTADO
        archivos = ["01_conceptos_basicos_masoterapia.pdf"] 
        
        for arc in archivos:
            with st.container(border=True):
                c1, c2 = st.columns([4, 1])
                c1.write(f"📄 {arc}")
                # Construcción de URL limpia para GitHub
                url = f"{LINK_RAW}{st.session_state.ciclo_sel}/{st.session_state.curso_sel}/{urllib.parse.quote(arc)}"
                if c2.button("👁️ Ver", key=arc):
                    st.markdown(f'<iframe src="{url}" width="100%" height="600px" style="border:2px solid #6e4f02; border-radius:10px;"></iframe>', unsafe_allow_html=True)
