import streamlit as st
import os
import urllib.parse
from datetime import datetime
from streamlit_gsheets import GSheetsConnection
import pandas as pd

# 1. IDENTIDAD Y CONFIGURACIÓN
st.set_page_config(page_title="SISTEMA CJ", page_icon="logo_cj.jpg", layout="centered")

# 2. ESTILOS CSS (Limpieza de corona, 2x2 y personalización)
st.markdown("""
    <style>
    [data-testid="stToolbar"], footer, header, .stDeployButton {
        visibility: hidden !important; 
        display: none !important;
    }
    .stApp { background-color: #0b0e14; }
    h2, h3 { color: #e5c07b !important; text-align: center; font-weight: 800; }
    
    /* FORZAR 2 COLUMNAS EN MÓVIL */
    [data-testid="stHorizontalBlock"] {
        display: flex !important;
        flex-direction: row !important;
        flex-wrap: wrap !important;
        gap: 10px !important;
    }
    [data-testid="column"] {
        flex: 1 1 45% !important;
        min-width: 45% !important;
    }

    /* BOTONES ESTILO PANEL */
    div.stButton > button {
        width: 100%;
        border-radius: 12px;
        height: 65px; 
        background-color: #1c2128;
        color: #e5c07b;
        border: 1px solid #30363d;
        font-weight: bold;
        font-size: 12px;
    }

    .pdf-card {
        background-color: #161b22;
        padding: 12px;
        border-radius: 10px;
        border-left: 4px solid #e5c07b;
        margin-bottom: 10px;
    }
    </style>
    """, unsafe_allow_html=True)

# 3. CONEXIÓN AL EXCEL
url_excel = "https://docs.google.com/spreadsheets/d/1AJS9Scjskzj1Qo50SfH4y1lIJq4SWWp-ToPD64ziSXo/edit?usp=sharing"
conn = st.connection("gsheets", type=GSheetsConnection)

# 4. SISTEMA DE LOGIN
if 'access' not in st.session_state:
    st.markdown("<h2>INGRESO AL SISTEMA</h2>", unsafe_allow_html=True)
    if os.path.exists("logo_cj.jpg"):
        st.image("logo_cj.jpg", width=150)
    
    clave = st.text_input("Introduce tu clave de acceso:", type="password")
    
    if clave == "ALUMNO":
        st.session_state.access = "invitado"
        st.rerun()
    elif clave == "cjpanta1":
        st.session_state.access = "admin"
        st.rerun()
    elif clave != "":
        st.error("Clave incorrecta")
    st.stop()

# --- INTERFAZ POST-LOGIN ---
with st.sidebar:
    if os.path.exists("logo_cj.jpg"):
        st.image("logo_cj.jpg", use_container_width=True)
    
    st.markdown(f"**Usuario:** {st.session_state.access.upper()}")
    
    if st.button("🏠 INICIO"):
        if 'seccion' in st.session_state: del st.session_state.seccion
        if 'curso_sel' in st.session_state: del st.session_state.curso_sel
        st.rerun()

    st.markdown("---")
    st.markdown("#### 💡 Sugerencias")
    nombre_alum = st.text_input("Tu Nombre:", placeholder="Ej. Maria Perez")
    texto_sug = st.text_area("¿Cómo mejorar?", placeholder="Escribe tu idea...")
    
    if st.button("Enviar Sugerencia"):
        if nombre_alum and texto_sug:
            try:
                # Obtenemos donde está parada para saber de qué curso habla
                ubicacion = st.session_state.get('curso_sel', 'Menu Principal')
                
                nueva_data = pd.DataFrame([{
                    "Fecha": datetime.now().strftime("%d/%m/%Y %H:%M"),
                    "Alumno": nombre_alum,
                    "Curso/Seccion": ubicacion,
                    "Sugerencia": texto_sug
                }])
                
                # Leemos lo actual y pegamos lo nuevo
                existing_data = conn.read(spreadsheet=url_excel)
                updated_data = pd.concat([existing_data, nueva_data], ignore_index=True)
                conn.update(spreadsheet=url_excel, data=updated_data)
                
                st.success(f"¡Gracias {nombre_alum}! Idea enviada.")
            except:
                st.error("Error al guardar. Verifica el Excel.")
        else:
            st.warning("Escribe tu nombre y tu sugerencia.")

# --- MENÚ DE SECCIONES ---
if 'seccion' not in st.session_state:
    st.markdown("<h2>SISTEMA CJ</h2>", unsafe_allow_html=True)
    
    col1, col2 = st.columns(2)
    with col1:
        if st.button("📚 ACADEMIA"): st.session_state.seccion = 'ACADEMIA'
        if st.session_state.access == "admin":
            if st.button("🚛 OPERACIONES"): st.session_state.seccion = 'OPERACIONES'
    with col2:
        if st.session_state.access == "admin":
            if st.button("🔬 LABORATORIO"): st.session_state.seccion = 'LABORATORIO'
            if st.button("🏗️ PROYECTOS"): st.session_state.seccion = 'PROYECTOS'
        else:
            st.info("Áreas Restringidas 🔒")

# --- SECCIÓN ACADEMIA ---
elif st.session_state.seccion == 'ACADEMIA':
    st.markdown("<h3>ACADEMIA</h3>", unsafe_allow_html=True)
    ciclos = sorted([d for d in os.listdir('.') if os.path.isdir(d) and d.startswith('CICLO_')])
    ciclo_sel = st.selectbox("Selecciona Ciclo:", ["..."] + ciclos)

    if ciclo_sel != "...":
        cursos = sorted([d for d in os.listdir(ciclo_sel) if os.path.isdir(os.path.join(ciclo_sel, d))])
        st.write("#### Cursos:")
        c_cols = st.columns(2)
        for idx, curso in enumerate(cursos):
            with c_cols[idx % 2]:
                if st.button(curso, key=f"c_{curso}"):
                    st.session_state.curso_sel = curso

        if 'curso_sel' in st.session_state:
            path_c = os.path.join(ciclo_sel, st.session_state.curso_sel)
            st.markdown(f"--- \n**Temas:**")
            pdfs = sorted([f for f in os.listdir(path_c) if f.lower().endswith('.pdf')])
            for pdf in pdfs:
                st.markdown(f"<div class='pdf-card'><div style='color:white; font-size:13px;'>📄 {pdf}</div>", unsafe_allow_html=True)
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
