import streamlit as st
import os
import urllib.parse

# 1. CONFIGURACIÓN DE PÁGINA (Identidad CJ)
# page_icon es el icono que sale en la pestaña del navegador
st.set_page_config(
    page_title="SISTEMA CJ",
    page_icon="logo_cj.jpg", 
    layout="centered"
)

# 2. CSS AVANZADO: Cuadrícula 2x2 sin Scroll Horizontal y Limpieza Total
st.markdown("""
    <style>
    /* 1. Ocultar Corona y Menús de Streamlit (Limpieza Total) */
    [data-testid="stToolbar"] {visibility: hidden; display: none !important;}
    #MainMenu {visibility: hidden; display: none !important;}
    footer {visibility: hidden; display: none !important;}
    .stDeployButton {display:none; visibility: hidden !important;}
    
    /* Fondo y Títulos */
    .stApp { background-color: #0b0e14; }
    h2, h3 { color: #e5c07b !important; text-align: center; font-weight: 800; }
    
    /* 2. FORZAR CUADRÍCULA 2x2 PERFECTA SIN SCROLL HORIZONTAL */
    [data-testid="stHorizontalBlock"] {
        display: grid !important;
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 10px !important;
        margin-top: 20px !important;
        overflow: visible !important; /* Asegurar que no haya scroll horizontal interno */
    }
    
    /* Estilo de los Botones Principales (Secciones y Cursos) */
    div.stButton > button {
        width: 100%;
        border-radius: 12px;
        height: 70px; /* Tamaño táctil cómodo */
        background-color: #1c2128;
        color: #e5c07b;
        border: 1px solid #30363d;
        font-weight: bold;
        font-size: 13px;
        transition: 0.3s;
    }
    div.stButton > button:hover {
        border-color: #e5c07b;
        background-color: #2d333b;
    }

    /* 3. Contenedor de PDF y Botones horizontales compactos */
    .pdf-card {
        background-color: #161b22;
        padding: 10px;
        border-radius: 12px;
        border-left: 5px solid #e5c07b;
        margin-top: 15px;
        margin-bottom: 5px;
    }
    .pdf-title { color: white; font-size: 14px; margin-bottom: 8px; font-weight: bold; }
    
    /* Asegurar que los botones de Leer/Bajar quepan en una fila */
    .stDownloadButton, div.stButton {
        display: inline-block;
        width: 100% !important;
    }
    
    </style>
    """, unsafe_allow_html=True)

# BARRA LATERAL (Solo para Logo y Reinicio)
with st.sidebar:
    if os.path.exists("logo_cj.jpg"):
        st.image("logo_cj.jpg", use_container_width=True)
    if st.button("🏠 Menú Principal"):
        st.session_state.clear()
        st.rerun()

# --- MENÚ PRINCIPAL ---
if 'seccion' not in st.session_state:
    # MOSTRAMOS logo_general.png ARRIBA DE TODO EN EL INICIO
    if os.path.exists("logo_general.png"):
        st.image("logo_general.png", use_container_width=True)
    st.markdown("<h2>SISTEMA CJ</h2>", unsafe_allow_html=True)
    st.markdown("<p style='text-align: center; color: gray;'>Selecciona el área de gestión</p>", unsafe_allow_html=True)
    
    # CUADRÍCULA 2x2 PERFECTA
    cols_principal = st.columns(2)
    with cols_principal[0]:
        if st.button("📚 ACADEMIA"): st.session_state.seccion = 'ACADEMIA'
        if st.button("🚛 OPERACIONES"): st.session_state.seccion = 'OPERACIONES'
    with cols_principal[1]:
        if st.button("🔬 LABORATORIO"): st.session_state.seccion = 'LABORATORIO'
        if st.button("🏗️ PROYECTOS"): st.session_state.seccion = 'PROYECTOS'

elif st.session_state.seccion == 'ACADEMIA':
    st.markdown("<h2 style='color: #e5c07b;'>📚 ACADEMIA</h2>", unsafe_allow_html=True)
    
    ciclos = sorted([d for d in os.listdir('.') if os.path.isdir(d) and d.startswith('CICLO_')])
    ciclo_sel = st.selectbox("📂 Selecciona Ciclo:", ["..."] + ciclos)

    if ciclo_sel != "...":
        cursos = sorted([d for d in os.listdir(ciclo_sel) if os.path.isdir(os.path.join(ciclo_sel, d))])
        
        # Cursos en CUADRÍCULA 2x2
        st.write("#### Cursos:")
        cols_cursos = st.columns(2)
        for i, curso in enumerate(cursos):
            with cols_cursos[i % 2]:
                if st.button(f"📖 {curso}", key=f"c_{curso}"):
                    st.session_state.curso_sel = curso

        # TEMAS Y DESCARGAS (Botones uno al lado del otro en la misma fila)
        if 'curso_sel' in st.session_state:
            curso_path = os.path.join(ciclo_sel, st.session_state.curso_sel)
            st.markdown(f"--- \n**Temas de {st.session_state.curso_sel}:**")
            
            pdfs = sorted([f for f in os.listdir(curso_path) if f.lower().endswith('.pdf')])
            for pdf in pdfs:
                # Contenedor Visual para el PDF
                st.markdown(f"<div class='pdf-card'><div class='pdf-title'>📄 {pdf}</div>", unsafe_allow_html=True)
                
                # BOTONES LADO A LADO SIN SCROLL HORIZONTAL
                b_cols = st.columns(2)
                raw_url = f"https://raw.githubusercontent.com/CJPANTA/cj-project/main/{ciclo_sel}/{st.session_state.curso_sel}/{pdf}"
                google_viewer = f"https://docs.google.com/viewer?url={urllib.parse.quote(raw_url)}&embedded=true"
                
                with b_cols[0]:
                    if st.button(f"👁️ Leer", key=f"v_{pdf}"):
                        st.markdown(f'<iframe src="{google_viewer}" width="100%" height="500"></iframe>', unsafe_allow_html=True)
                with b_cols[1]:
                    with open(os.path.join(curso_path, pdf), "rb") as f:
                        st.download_button("📥 Bajar", f, file_name=pdf, key=f"d_{pdf}")
                st.markdown("</div>", unsafe_allow_html=True)
