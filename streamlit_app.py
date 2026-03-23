import streamlit as st
import os
import urllib.parse

# 1. IDENTIDAD VISUAL: Cambiamos la corona por tu logo
# Nota: Asegúrate de tener 'logo_cj.png' en la raíz de tu GitHub
st.set_page_config(
    page_title="CJ PROJECT", 
    page_icon="🏥", # Aquí puedes poner la URL de tu logo si prefieres
    layout="centered"
)

# 2. Estilo CSS para Tarjetas Compactas
st.markdown("""
    <style>
    .main { background-color: #0e1117; }
    div.stButton > button {
        width: 100%;
        border-radius: 12px;
        height: 70px; /* Botones más grandes y táctiles */
        background-color: #1c2128;
        color: #d4af37;
        border: 1px solid #30363d;
        font-weight: bold;
    }
    .pdf-container {
        background-color: #161b22;
        padding: 10px;
        border-radius: 10px;
        margin-bottom: 5px;
        border-left: 3px solid #d4af37;
    }
    .pdf-text {
        color: white;
        font-size: 14px;
        margin-bottom: 8px;
    }
    </style>
    """, unsafe_allow_html=True)

# BARRA LATERAL (Sencilla y Directa)
with st.sidebar:
    # Mostramos tu logo si existe
    if os.path.exists("logo_cj.png"):
        st.image("logo_cj.png", use_container_width=True)
    st.markdown("---")
    if st.button("🏠 Volver al Inicio"):
        st.session_state.clear()
        st.rerun()
    st.info("Administrador de Operaciones")

# --- PANTALLA PRINCIPAL ---
if 'seccion' not in st.session_state:
    st.markdown("<h2 style='text-align: center; color: #d4af37;'>SISTEMA CJ</h2>", unsafe_allow_html=True)
    st.markdown("<p style='text-align: center; color: gray;'>Selecciona el área de gestión</p>", unsafe_allow_html=True)
    
    # CUADRÍCULA 2x2 (Compacta)
    col1, col2 = st.columns(2)
    with col1:
        if st.button("📚 ACADEMIA"): st.session_state.seccion = 'ACADEMIA'
        if st.button("🚛 OPERACIONES"): st.session_state.seccion = 'OPERACIONES'
    with col2:
        if st.button("🔬 LABORATORIO"): st.session_state.seccion = 'LABORATORIO'
        if st.button("🏗️ PROYECTOS"): st.session_state.seccion = 'PROYECTOS'

# --- SECCIÓN ACADEMIA ---
elif st.session_state.seccion == 'ACADEMIA':
    st.markdown("<h2 style='color: #d4af37;'>📚 ACADEMIA</h2>", unsafe_allow_html=True)
    
    carpetas_ciclo = sorted([d for d in os.listdir('.') if os.path.isdir(d) and d.startswith('CICLO_')])
    ciclo_sel = st.selectbox("📂 Elige un Ciclo:", ["Seleccionar..."] + carpetas_ciclo)

    if ciclo_sel != "Seleccionar...":
        ruta_ciclo = ciclo_sel
        cursos = sorted([d for d in os.listdir(ruta_ciclo) if os.path.isdir(os.path.join(ruta_ciclo, d))])
        
        st.write("### Cursos Disponibles")
        # CUADRÍCULA 2x2 para CURSOS
        cols_cursos = st.columns(2)
        for i, curso in enumerate(cursos):
            with cols_cursos[i % 2]:
                if st.button(f"📖 {curso}", key=curso):
                    st.session_state.curso_sel = curso

        # TEMAS DEL CURSO (Compactos uno al lado del otro)
        if 'curso_sel' in st.session_state:
            curso_activo = st.session_state.curso_sel
            ruta_curso = os.path.join(ruta_ciclo, curso_activo)
            st.markdown(f"#### Temas: {curso_activo}")
            
            archivos = sorted([f for f in os.listdir(ruta_curso) if f.lower().endswith('.pdf')])
            for pdf in archivos:
                with st.container():
                    st.markdown(f"<div class='pdf-container'><p class='pdf-text'>📄 {pdf}</p></div>", unsafe_allow_html=True)
                    # Botones compactos en una sola fila
                    b1, b2 = st.columns(2)
                    
                    raw_url = f"https://raw.githubusercontent.com/CJPANTA/cj-project/main/{ciclo_sel}/{curso_activo}/{pdf}"
                    google_viewer = f"https://docs.google.com/viewer?url={urllib.parse.quote(raw_url, safe='')}&embedded=true"
                    
                    with b1:
                        if st.button(f"👁️ Leer", key=f"v_{pdf}"):
                            st.markdown(f'<iframe src="{google_viewer}" width="100%" height="500"></iframe>', unsafe_allow_html=True)
                    with b2:
                        with open(os.path.join(ruta_curso, pdf), "rb") as f:
                            st.download_button("📥 Bajar", f, file_name=pdf, key=f"d_{pdf}")
