import streamlit as st
import os
import urllib.parse

# 1. CONFIGURACIÓN DE PÁGINA (Icono de pestaña)
st.set_page_config(
    page_title="SISTEMA CJ",
    page_icon="logo_cj.jpg",
    layout="centered"
)

# 2. LIMPIEZA DE INTERFAZ Y FORZADO 2x2
st.markdown("""
    <style>
    /* 1. Ocultar Corona, Menú y Pie de página de Streamlit */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    .stDeployButton {display:none;}
    
    /* 2. FORZAR 2 COLUMNAS EN MÓVIL (ESTRICTO) */
    [data-testid="stHorizontalBlock"] {
        display: flex !important;
        flex-direction: row !important;
        flex-wrap: nowrap !important;
        gap: 10px !important;
    }
    [data-testid="column"] {
        width: 100% !important;
        flex: 1 1 calc(50% - 10px) !important;
        min-width: calc(50% - 10px) !important;
    }

    /* 3. Estilo de los Botones Principales */
    div.stButton > button {
        width: 100%;
        border-radius: 12px;
        height: 70px;
        background-color: #1c2128;
        color: #e5c07b;
        border: 2px solid #30363d;
        font-weight: bold;
        font-size: 13px;
    }

    /* 4. Contenedor de PDF y Botones horizontales */
    .pdf-card {
        background-color: #161b22;
        padding: 12px;
        border-radius: 12px;
        border-left: 5px solid #e5c07b;
        margin-bottom: 20px;
    }
    .pdf-title { color: white; font-size: 14px; margin-bottom: 10px; font-weight: bold; }
    </style>
    """, unsafe_allow_html=True)

# BARRA LATERAL (Solo para navegación rápida)
with st.sidebar:
    if os.path.exists("logo_cj.jpg"):
        st.image("logo_cj.jpg", use_container_width=True)
    if st.button("🏠 Inicio"):
        st.session_state.clear()
        st.rerun()

# --- MENÚ PRINCIPAL ---
if 'seccion' not in st.session_state:
    st.markdown("<h2 style='text-align: center; color: #e5c07b;'>SISTEMA CJ</h2>", unsafe_allow_html=True)
    
    # Fila 1
    c1, c2 = st.columns(2)
    with c1:
        if st.button("📚 ACADEMIA"): st.session_state.seccion = 'ACADEMIA'
    with c2:
        if st.button("🔬 LABORATORIO"): st.session_state.seccion = 'LABORATORIO'
    
    # Fila 2
    c3, c4 = st.columns(2)
    with c3:
        if st.button("🚛 OPERACIONES"): st.session_state.seccion = 'OPERACIONES'
    with c4:
        if st.button("🏗️ PROYECTOS"): st.session_state.seccion = 'PROYECTOS'

# --- SECCIÓN ACADEMIA ---
elif st.session_state.seccion == 'ACADEMIA':
    st.markdown("<h3 style='color: #e5c07b;'>📚 ACADEMIA</h3>", unsafe_allow_html=True)
    
    ciclos = sorted([d for d in os.listdir('.') if os.path.isdir(d) and d.startswith('CICLO_')])
    ciclo_sel = st.selectbox("📂 Selecciona Ciclo:", ["..."] + ciclos)

    if ciclo_sel != "...":
        cursos = sorted([d for d in os.listdir(ciclo_sel) if os.path.isdir(os.path.join(ciclo_sel, d))])
        
        # Cursos en 2x2
        st.write("#### Cursos:")
        for i in range(0, len(cursos), 2):
            cols = st.columns(2)
            with cols[0]:
                if st.button(f"📖 {cursos[i]}", key=f"c_{cursos[i]}"):
                    st.session_state.curso_sel = cursos[i]
            if i + 1 < len(cursos):
                with cols[1]:
                    if st.button(f"📖 {cursos[i+1]}", key=f"c_{cursos[i+1]}"):
                        st.session_state.curso_sel = cursos[i+1]

        # Temas y Botones Leer/Descargar
        if 'curso_sel' in st.session_state:
            curso_path = os.path.join(ciclo_sel, st.session_state.curso_sel)
            st.markdown(f"--- \n**Temas de {st.session_state.curso_sel}:**")
            
            pdfs = sorted([f for f in os.listdir(curso_path) if f.lower().endswith('.pdf')])
            for pdf in pdfs:
                st.markdown(f"<div class='pdf-card'><div class='pdf-title'>📄 {pdf}</div>", unsafe_allow_html=True)
                
                # Botones en la misma fila
                b_cols = st.columns(2)
                raw_url = f"https://raw.githubusercontent.com/CJPANTA/cj-project/main/{ciclo_sel}/{st.session_state.curso_sel}/{pdf}"
                view_url = f"https://docs.google.com/viewer?url={urllib.parse.quote(raw_url)}&embedded=true"
                
                with b_cols[0]:
                    if st.button(f"👁️ Leer", key=f"v_{pdf}"):
                        st.markdown(f'<iframe src="{view_url}" width="100%" height="500"></iframe>', unsafe_allow_html=True)
                with b_cols[1]:
                    with open(os.path.join(curso_path, pdf), "rb") as f:
                        st.download_button("📥 Bajar", f, file_name=pdf, key=f"d_{pdf}")
                st.markdown("</div>", unsafe_allow_html=True)
