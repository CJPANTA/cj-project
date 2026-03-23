import streamlit as st
import os
import urllib.parse

# 1. IDENTIDAD CJ
st.set_page_config(page_title="SISTEMA CJ", page_icon="logo_cj.jpg", layout="centered")

# 2. CSS DE ALTA PRECISIÓN (Limpieza de Corona y Ajuste de Tarjetas)
st.markdown("""
    <style>
    /* OCULTAR CORONA Y MENÚS (REFORZADO) */
    [data-testid="stToolbar"], footer, header, .stDeployButton {
        visibility: hidden !important; 
        display: none !important;
    }

    .stApp { background-color: #0b0e14; }
    h2, h3 { color: #e5c07b !important; text-align: center; font-weight: 800; }
    
    /* CUADRÍCULA 2x2 */
    [data-testid="stHorizontalBlock"] {
        display: grid !important;
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 8px !important;
    }
    
    /* BOTONES ESTILO "MINIMALISTA" */
    div.stButton > button {
        width: 100%;
        border-radius: 10px;
        height: 60px; 
        background-color: #1c2128;
        color: #e5c07b;
        border: 1px solid #30363d;
        font-weight: bold;
        font-size: 10px; /* Letra pequeña y elegante */
        line-height: 1.1;
        text-transform: uppercase;
        padding: 2px 5px;
    }

    .pdf-card {
        background-color: #161b22;
        padding: 10px;
        border-radius: 10px;
        border-left: 4px solid #e5c07b;
        margin-bottom: 8px;
    }
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
    
    c1, c2 = st.columns(2)
    with c1:
        if st.button("ACADEMIA"): st.session_state.seccion = 'ACADEMIA'
        if st.button("OPERACIONES"): st.session_state.seccion = 'OPERACIONES'
    with c2:
        if st.button("LABORATORIO"): st.session_state.seccion = 'LABORATORIO'
        if st.button("PROYECTOS"): st.session_state.seccion = 'PROYECTOS'

# --- SECCIÓN ACADEMIA ---
elif st.session_state.seccion == 'ACADEMIA':
    st.markdown("<h3>ACADEMIA</h3>", unsafe_allow_html=True)
    
    ciclos = sorted([d for d in os.listdir('.') if os.path.isdir(d) and d.startswith('CICLO_')])
    ciclo_sel = st.selectbox("📂 Ciclo:", ["..."] + ciclos)

    if ciclo_sel != "...":
        cursos_raw = sorted([d for d in os.listdir(ciclo_sel) if os.path.isdir(os.path.join(ciclo_sel, d))])
        
        st.write("#### Cursos:")
        cols_c = st.columns(2)
        
        for idx, carpeta in enumerate(cursos_raw):
            # --- AQUÍ OCURRE LA MAGIA DE LA LIMPIEZA ---
            # 1. Quitamos números y guiones del inicio (ej: "1-Curso" -> "Curso")
            nombre_limpio = carpeta.split('-', 1)[-1] if '-' in carpeta else carpeta
            nombre_limpio = nombre_limpio.split('_', 1)[-1] if '_' in nombre_limpio else nombre_limpio
            
            # 2. Borramos palabras repetitivas para ahorrar espacio
            palabras_a_borrar = ["CURSO", "DE", "TERAPIA", "FISICA"] 
            for palabra in palabras_a_borrar:
                nombre_limpio = nombre_limpio.upper().replace(palabra, "").strip()
            
            # 3. Si queda vacío por error, usamos el original
            if not nombre_limpio: nombre_limpio = carpeta

            with cols_c[idx % 2]:
                if st.button(nombre_limpio, key=f"c_{carpeta}"):
                    st.session_state.curso_sel = carpeta

        # PDFs
        if 'curso_sel' in st.session_state:
            path_c = os.path.join(ciclo_sel, st.session_state.curso_sel)
            st.markdown(f"--- \n**Temas:**")
            
            pdfs = sorted([f for f in os.listdir(path_c) if f.lower().endswith('.pdf')])
            for pdf in pdfs:
                st.markdown(f"<div class='pdf-card'><div style='color:white; font-size:12px; margin-bottom:5px;'>📄 {pdf}</div>", unsafe_allow_html=True)
                b1, b2 = st.columns(2)
                
                raw_url = f"https://raw.githubusercontent.com/CJPANTA/cj-project/main/{ciclo_sel}/{st.session_state.curso_sel}/{pdf}"
                view_url = f"https://docs.google.com/viewer?url={urllib.parse.quote(raw_url)}&embedded=true"
                
                with b1:
                    if st.button("👁️ Leer", key=f"v_{pdf}"):
                        st.markdown(f'<iframe src="{view_url}" width="100%" height="500"></iframe>', unsafe_allow_html=True)
                with b2:
                    with open(os.path.join(path_c, pdf), "rb") as f:
                        st.download_button("📥 Bajar", f, file_name=pdf, key=f"d_{pdf}")
                st.markdown("</div>", unsafe_allow_html=True)
