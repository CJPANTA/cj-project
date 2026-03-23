import streamlit as st
import os
import urllib.parse

# 1. MARCA PROPIA: Cambiamos la corona roja por tu logo CJ
st.set_page_config(
    page_title="SISTEMA CJ", 
    page_icon="logo_cj.jpg",  # <-- Esto cambia la corona por tu logo
    layout="centered"
)

# 2. COLORES PERSONALIZADOS Y DISEÑO "CERO SCROLL"
st.markdown("""
    <style>
    /* Fondo y Títulos */
    .stApp { background-color: #0b0e14; }
    h2, h3 { color: #e5c07b !important; text-align: center; font-weight: 800; }
    
    /* Tarjetas de Menú Principal (Cuadrícula) */
    div.stButton > button {
        width: 100%;
        border-radius: 15px;
        height: 85px; 
        background-color: #1c2128;
        color: #e5c07b;
        border: 2px solid #30363d;
        font-size: 16px;
        font-weight: bold;
        transition: 0.3s;
    }
    div.stButton > button:hover {
        border-color: #e5c07b;
        background-color: #2d333b;
    }

    /* Contenedor de PDF optimizado */
    .pdf-box {
        background-color: #161b22;
        padding: 12px;
        border-radius: 12px;
        margin-top: 10px;
        border: 1px solid #30363d;
    }
    .pdf-title { color: #ffffff; font-size: 14px; margin-bottom: 10px; font-weight: 500; }
    </style>
    """, unsafe_allow_html=True)

# BARRA LATERAL (Sidebar)
with st.sidebar:
    if os.path.exists("logo_cj.jpg"):
        st.image("logo_cj.jpg", use_container_width=True)
    st.markdown("<h3 style='text-align: center;'>Panel Admin</h3>", unsafe_allow_html=True)
    if st.button("🏠 Inicio"):
        st.session_state.clear()
        st.rerun()

# --- NAVEGACIÓN PRINCIPAL ---
if 'seccion' not in st.session_state:
    st.markdown("<h2>🏦 SISTEMA CJ</h2>", unsafe_allow_html=True)
    
    # CUADRÍCULA 2 Arriba y 2 Abajo
    row1_col1, row1_col2 = st.columns(2)
    with row1_col1:
        if st.button("📚 ACADEMIA"): st.session_state.seccion = 'ACADEMIA'
    with row1_col2:
        if st.button("🔬 LABORATORIO"): st.session_state.seccion = 'LABORATORIO'
        
    row2_col1, row2_col2 = st.columns(2)
    with row2_col1:
        if st.button("🚛 OPERACIONES"): st.session_state.seccion = 'OPERACIONES'
    with row2_col2:
        if st.button("🏗️ PROYECTOS"): st.session_state.seccion = 'PROYECTOS'

# --- SECCIÓN ACADEMIA (Estructura de Ciclos) ---
elif st.session_state.seccion == 'ACADEMIA':
    st.markdown("<h3>📚 ACADEMIA</h3>", unsafe_allow_html=True)
    
    ciclos = sorted([d for d in os.listdir('.') if os.path.isdir(d) and d.startswith('CICLO_')])
    ciclo_sel = st.selectbox("📂 Elige el Ciclo:", ["..."] + ciclos)

    if ciclo_sel != "...":
        cursos = sorted([d for d in os.listdir(ciclo_sel) if os.path.isdir(os.path.join(ciclo_sel, d))])
        
        # CURSOS EN CUADRÍCULA 2x2
        st.write("#### Selecciona un Curso")
        c_cols = st.columns(2)
        for idx, curso in enumerate(cursos):
            with c_cols[idx % 2]:
                if st.button(f"📖 {curso}", key=f"cur_{curso}"):
                    st.session_state.curso_sel = curso

        # TEMAS Y DESCARGAS (Botones uno al lado del otro)
        if 'curso_sel' in st.session_state:
            curso_path = os.path.join(ciclo_sel, st.session_state.curso_sel)
            st.markdown(f"**Temas de: {st.session_state.curso_sel}**")
            
            archivos = sorted([f for f in os.listdir(curso_path) if f.lower().endswith('.pdf')])
            for pdf in archivos:
                st.markdown(f"<div class='pdf-box'><div class='pdf-title'>📄 {pdf}</div>", unsafe_allow_html=True)
                
                # BOTONES LADO A LADO PARA AHORRAR ESPACIO
                b1, b2 = st.columns(2)
                raw_url = f"https://raw.githubusercontent.com/CJPANTA/cj-project/main/{ciclo_sel}/{st.session_state.curso_sel}/{pdf}"
                viewer = f"https://docs.google.com/viewer?url={urllib.parse.quote(raw_url)}&embedded=true"
                
                with b1:
                    if st.button(f"👁️ Leer", key=f"v_{pdf}"):
                        st.markdown(f'<iframe src="{viewer}" width="100%" height="500"></iframe>', unsafe_allow_html=True)
                with b2:
                    with open(os.path.join(curso_path, pdf), "rb") as f:
                        st.download_button("📥 Bajar", f, file_name=pdf, key=f"d_{pdf}")
                st.markdown("</div>", unsafe_allow_html=True)
