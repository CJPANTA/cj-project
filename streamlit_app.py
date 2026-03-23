import streamlit as st
import os
import urllib.parse

# 1. IDENTIDAD CJ
st.set_page_config(
    page_title="SISTEMA CJ",
    page_icon="logo_cj.jpg", 
    layout="centered"
)

# 2. CSS DE PRECISIÓN: Nombres ajustados y eliminación de la corona
st.markdown("""
    <style>
    /* OCULTAR TODO EL TOOLBAR DE STREAMLIT (Corona y Menús) */
    [data-testid="stToolbar"] {visibility: hidden !important; display: none !important;}
    footer {visibility: hidden !important; display: none !important;}
    header {visibility: hidden !important; display: none !important;}
    #MainMenu {visibility: hidden !important;}
    .stDeployButton {display:none !important;}

    /* Fondo y Títulos */
    .stApp { background-color: #0b0e14; }
    h2, h3 { color: #e5c07b !important; text-align: center; font-weight: 800; }
    
    /* FORZAR 2x2 SIN DESBORDE */
    [data-testid="stHorizontalBlock"] {
        display: grid !important;
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 8px !important;
        margin-top: 10px !important;
    }
    
    /* Botones de Cursos sin Iconos y con Texto Ajustado */
    div.stButton > button {
        width: 100%;
        border-radius: 12px;
        height: 65px; 
        background-color: #1c2128;
        color: #e5c07b;
        border: 1px solid #30363d;
        font-weight: bold;
        font-size: 11px; /* Letra un poco más pequeña para que entren nombres largos */
        line-height: 1.2;
        padding: 5px;
        text-transform: uppercase; /* Se ve más ordenado como administrador */
    }

    /* Tarjetas de PDF */
    .pdf-card {
        background-color: #161b22;
        padding: 10px;
        border-radius: 10px;
        border-left: 4px solid #e5c07b;
        margin-bottom: 8px;
    }
    .pdf-title { color: white; font-size: 13px; margin-bottom: 8px; font-weight: 600; }
    </style>
    """, unsafe_allow_html=True)

# BARRA LATERAL
with st.sidebar:
    if os.path.exists("logo_cj.jpg"):
        st.image("logo_cj.jpg", use_container_width=True)
    if st.button("🏠 INICIO"):
        st.session_state.clear()
        st.rerun()

# --- MENÚ PRINCIPAL ---
if 'seccion' not in st.session_state:
    if os.path.exists("logo_general.png"):
        st.image("logo_general.png", use_container_width=True)
    st.markdown("<h2>SISTEMA CJ</h2>", unsafe_allow_html=True)
    
    cols_main = st.columns(2)
    with cols_main[0]:
        if st.button("ACADEMIA"): st.session_state.seccion = 'ACADEMIA'
        if st.button("OPERACIONES"): st.session_state.seccion = 'OPERACIONES'
    with cols_main[1]:
        if st.button("LABORATORIO"): st.session_state.seccion = 'LABORATORIO'
        if st.button("PROYECTOS"): st.session_state.seccion = 'PROYECTOS'

# --- SECCIÓN ACADEMIA ---
elif st.session_state.seccion == 'ACADEMIA':
    st.markdown("<h3>ACADEMIA</h3>", unsafe_allow_html=True)
    
    ciclos = sorted([d for d in os.listdir('.') if os.path.isdir(d) and d.startswith('CICLO_')])
    ciclo_sel = st.selectbox("📂 Ciclo:", ["..."] + ciclos)

    if ciclo_sel != "...":
        cursos = sorted([d for d in os.listdir(ciclo_sel) if os.path.isdir(os.path.join(ciclo_sel, d))])
        
        # Grid 2x2 para Cursos (Sin libros 📖)
        st.write("#### Selecciona Curso:")
        cols_c = st.columns(2)
        for idx, curso in enumerate(cursos):
            # Limpiamos el nombre del curso de guiones bajos para que se vea mejor
            nombre_limpio = curso.replace("_", " ")
            with cols_c[idx % 2]:
                if st.button(nombre_limpio, key=f"c_{curso}"):
                    st.session_state.curso_sel = curso

        # Contenido de PDFs
        if 'curso_sel' in st.session_state:
            path_c = os.path.join(ciclo_sel, st.session_state.curso_sel)
            st.markdown(f"--- \n**Temas: {st.session_state.curso_sel}**")
            
            pdfs = sorted([f for f in os.listdir(path_c) if f.lower().endswith('.pdf')])
            for pdf in pdfs:
                st.markdown(f"<div class='pdf-card'><div class='pdf-title'>📄 {pdf}</div>", unsafe_allow_html=True)
                
                b_cols = st.columns(2)
                raw_url = f"https://raw.githubusercontent.com/CJPANTA/cj-project/main/{ciclo_sel}/{st.session_state.curso_sel}/{pdf}"
                view_url = f"https://docs.google.com/viewer?url={urllib.parse.quote(raw_url)}&embedded=true"
                
                with b_cols[0]:
                    if st.button("👁️ Leer", key=f"v_{pdf}"):
                        st.markdown(f'<iframe src="{view_url}" width="100%" height="500"></iframe>', unsafe_allow_html=True)
                with b_cols[1]:
                    with open(os.path.join(path_c, pdf), "rb") as f:
                        st.download_button("📥 Bajar", f, file_name=pdf, key=f"d_{pdf}")
                st.markdown("</div>", unsafe_allow_html=True)
