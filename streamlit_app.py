import streamlit as st
import os
import urllib.parse

# 1. ICONO DE LA APP: Usamos tu logo para la cara de la app
st.set_page_config(
    page_title="SISTEMA CJ",
    page_icon="logo_cj.jpg", 
    layout="centered"
)

# 2. CSS AVANZADO: Forzamos la cuadrícula y botones horizontales
st.markdown("""
    <style>
    /* Forzar cuadrícula de 2 columnas en móviles */
    [data-testid="column"] {
        width: 48% !important;
        flex: 1 1 45% !important;
        min-width: 45% !important;
        margin: 1% !important;
    }
    
    /* Contenedor principal de botones de sección */
    div.stButton > button {
        width: 100%;
        border-radius: 12px;
        height: 80px;
        background-color: #1c2128;
        color: #e5c07b;
        border: 2px solid #30363d;
        font-weight: bold;
        font-size: 14px;
    }

    /* Estilo para los botones de los PDF (Leer/Bajar) */
    .pdf-row {
        display: flex;
        gap: 10px;
        margin-top: 5px;
        margin-bottom: 15px;
    }
    
    .pdf-card {
        background-color: #161b22;
        padding: 10px;
        border-radius: 10px;
        border-left: 4px solid #e5c07b;
        margin-bottom: 5px;
    }

    .pdf-title { color: white; font-size: 13px; margin-bottom: 8px; }
    </style>
    """, unsafe_allow_html=True)

# BARRA LATERAL
with st.sidebar:
    if os.path.exists("logo_cj.jpg"):
        st.image("logo_cj.jpg", use_container_width=True)
    if st.button("🏠 Menú Principal"):
        st.session_state.clear()
        st.rerun()

# --- LÓGICA DE NAVEGACIÓN ---
if 'seccion' not in st.session_state:
    st.markdown("<h2 style='text-align: center; color: #e5c07b;'>🏦 SISTEMA CJ</h2>", unsafe_allow_html=True)
    
    # FORZADO 2x2
    c1, c2 = st.columns(2)
    with c1:
        if st.button("📚 ACADEMIA"): st.session_state.seccion = 'ACADEMIA'
        if st.button("🚛 OPERACIONES"): st.session_state.seccion = 'OPERACIONES'
    with c2:
        if st.button("🔬 LABORATORIO"): st.session_state.seccion = 'LABORATORIO'
        if st.button("🏗️ PROYECTOS"): st.session_state.seccion = 'PROYECTOS'

elif st.session_state.seccion == 'ACADEMIA':
    st.markdown("<h2 style='color: #e5c07b;'>📚 ACADEMIA</h2>", unsafe_allow_html=True)
    
    ciclos = sorted([d for d in os.listdir('.') if os.path.isdir(d) and d.startswith('CICLO_')])
    ciclo_sel = st.selectbox("📂 Elige el Ciclo:", ["..."] + ciclos)

    if ciclo_sel != "...":
        cursos = sorted([d for d in os.listdir(ciclo_sel) if os.path.isdir(os.path.join(ciclo_sel, d))])
        
        st.write("### Cursos")
        # FORZADO 2x2 en Cursos
        cols_c = st.columns(2)
        for i, curso in enumerate(cursos):
            with cols_c[i % 2]:
                if st.button(f"📖 {curso}", key=f"c_{curso}"):
                    st.session_state.curso_sel = curso

        # TEMAS: Ahora aparecen justo debajo del curso seleccionado
        if 'curso_sel' in st.session_state:
            curso_activo = st.session_state.curso_sel
            ruta_p = os.path.join(ciclo_sel, curso_activo)
            st.markdown(f"--- \n **Contenido de:** {curso_activo}")
            
            archivos = sorted([f for f in os.listdir(ruta_p) if f.lower().endswith('.pdf')])
            for pdf in archivos:
                # Contenedor Visual para el PDF
                st.markdown(f"<div class='pdf-card'><div class='pdf-title'>📄 {pdf}</div>", unsafe_allow_html=True)
                
                # Botones de Acción (Leer y Bajar en la misma línea)
                col_btn1, col_btn2 = st.columns(2)
                
                raw_url = f"https://raw.githubusercontent.com/CJPANTA/cj-project/main/{ciclo_sel}/{curso_activo}/{pdf}"
                google_view = f"https://docs.google.com/viewer?url={urllib.parse.quote(raw_url)}&embedded=true"
                
                with col_btn1:
                    if st.button(f"👁️ Leer", key=f"v_{pdf}"):
                        st.markdown(f'<iframe src="{google_view}" width="100%" height="500"></iframe>', unsafe_allow_html=True)
                with col_btn2:
                    with open(os.path.join(ruta_p, pdf), "rb") as f:
                        st.download_button("📥 Bajar", f, file_name=pdf, key=f"d_{pdf}")
                
                st.markdown("</div>", unsafe_allow_html=True)
