import streamlit as st
import os
import urllib.parse
from datetime import datetime
from streamlit_gsheets import GSheetsConnection
import pandas as pd

# 1. CONFIGURACIÓN E ICONO (La corona roja es de Streamlit, aquí intentamos mitigarla)
st.set_page_config(page_title="SISTEMA CJ", page_icon="logo_cj.jpg", layout="centered")

# 2. CSS AGRESIVO PARA MÓVIL (Forzar 2x2 y quitar cabeceras)
st.markdown("""
    <style>
    /* Ocultar todo lo de Streamlit */
    [data-testid="stToolbar"], footer, header, .stDeployButton { display: none !important; }
    
    .stApp { background-color: #0b0e14; }
    h2, h3 { color: #e5c07b !important; text-align: center; font-family: 'sans serif'; }

    /* FUERZA 2 COLUMNAS EN CELULAR */
    [data-testid="stHorizontalBlock"] {
        display: flex !important;
        flex-direction: row !important;
        flex-wrap: wrap !important;
        justify-content: space-between !important;
    }
    [data-testid="column"] {
        flex: 1 1 45% !important;
        min-width: 45% !important;
        max-width: 48% !important;
        margin-bottom: 10px !important;
    }

    /* BOTONES ESTILO APP */
    div.stButton > button {
        width: 100%;
        border-radius: 15px;
        height: 80px !important;
        background-color: #1c2128;
        color: #e5c07b;
        border: 1px solid #30363d;
        font-weight: bold;
    }
    
    /* BOTÓN ATRÁS DIFERENTE */
    .btn-atras > div > button {
        background-color: #30363d !important;
        height: 40px !important;
        color: white !important;
    }

    .pdf-card {
        background-color: #161b22;
        padding: 15px;
        border-radius: 12px;
        border-left: 5px solid #e5c07b;
        margin-bottom: 15px;
    }
    </style>
    """, unsafe_allow_html=True)

# 3. CONEXIÓN EXCEL
url_excel = "https://docs.google.com/spreadsheets/d/1AJS9Scjskzj1Qo50SfH4y1lIJq4SWWp-ToPD64ziSXo/edit?usp=sharing"
conn = st.connection("gsheets", type=GSheetsConnection)

# 4. LOGIN
if 'access' not in st.session_state:
    st.markdown("<h2>SISTEMA CJ</h2>", unsafe_allow_html=True)
    if os.path.exists("logo_cj.jpg"): st.image("logo_cj.jpg", width=120)
    clave = st.text_input("Clave:", type="password")
    if clave == "ALUMNO":
        st.session_state.access = "invitado"
        st.rerun()
    elif clave == "cjpanta1":
        st.session_state.access = "admin"
        st.rerun()
    st.stop()

# --- FUNCIONES DE NAVEGACIÓN ---
def ir_inicio():
    for key in ['seccion', 'curso_sel', 'ciclo_sel']:
        if key in st.session_state: del st.session_state[key]
    st.rerun()

# --- CUERPO PRINCIPAL ---
if 'seccion' not in st.session_state:
    st.markdown("<h2>MENÚ PRINCIPAL</h2>", unsafe_allow_html=True)
    col1, col2 = st.columns(2)
    with col1:
        if st.button("📚\nACADEMIA"): st.session_state.seccion = 'ACADEMIA'
        if st.session_state.access == "admin" and st.button("🚛\nOPERACIONES"): st.session_state.seccion = 'OPERACIONES'
    with col2:
        if st.session_state.access == "admin":
            if st.button("🔬\nLABORATORIO"): st.session_state.seccion = 'LABORATORIO'
            if st.button("🏗️\nPROYECTOS"): st.session_state.seccion = 'PROYECTOS'
        else: st.info("Solo Academia")

elif st.session_state.seccion == 'ACADEMIA':
    # BOTÓN ATRÁS
    st.markdown('<div class="btn-atras">', unsafe_allow_html=True)
    if st.button("⬅️ VOLVER AL MENÚ"): ir_inicio()
    st.markdown('</div>', unsafe_allow_html=True)

    st.markdown("<h3>ACADEMIA</h3>", unsafe_allow_html=True)
    
    ciclos = sorted([d for d in os.listdir('.') if os.path.isdir(d) and d.startswith('CICLO_')])
    st.session_state.ciclo_sel = st.selectbox("Elegir Ciclo:", ["..."] + ciclos)

    if st.session_state.ciclo_sel != "...":
        cursos = sorted([d for d in os.listdir(st.session_state.ciclo_sel) if os.path.isdir(os.path.join(st.session_state.ciclo_sel, d))])
        
        st.write("#### Selecciona un Curso:")
        c_cols = st.columns(2)
        for idx, curso in enumerate(cursos):
            with c_cols[idx % 2]:
                if st.button(f"📖 {curso}", key=f"c_{curso}"):
                    st.session_state.curso_sel = curso

        if 'curso_sel' in st.session_state:
            path_c = os.path.join(st.session_state.ciclo_sel, st.session_state.curso_sel)
            st.markdown(f"--- \n**Temas de {st.session_state.curso_sel}:**")
            
            pdfs = sorted([f for f in os.listdir(path_c) if f.lower().endswith('.pdf')])
            for pdf in pdfs:
                st.markdown(f"<div class='pdf-card'><b>📄 {pdf}</b>", unsafe_allow_html=True)
                b1, b2 = st.columns(2)
                raw_url = f"https://raw.githubusercontent.com/CJPANTA/cj-project/main/{st.session_state.ciclo_sel}/{st.session_state.curso_sel}/{pdf}"
                view_url = f"https://docs.google.com/viewer?url={urllib.parse.quote(raw_url)}&embedded=true"
                with b1:
                    if st.button("👁️ Leer", key=f"v_{pdf}"):
                        st.markdown(f'<iframe src="{view_url}" width="100%" height="400"></iframe>', unsafe_allow_html=True)
                with b2:
                    with open(os.path.join(path_c, pdf), "rb") as f:
                        st.download_button("📥 Bajar", f, file_name=pdf, key=f"d_{pdf}")
                st.markdown("</div>", unsafe_allow_html=True)

# --- SECCIÓN DE SUGERENCIAS AL FINAL (Siempre visible) ---
st.markdown("---")
st.markdown("### 💡 Buzón de Sugerencias")
with st.expander("Haz clic aquí para dejarnos tu idea"):
    nom = st.text_input("Tu nombre:")
    sug = st.text_area("¿En qué podemos mejorar?")
    if st.button("ENVIAR IDEA"):
        if nom and sug:
            try:
                ubicacion = st.session_state.get('curso_sel', 'General')
                nueva_fila = pd.DataFrame([{"Fecha": datetime.now().strftime("%d/%m/%Y %H:%M"), "Alumno": nom, "Curso/Seccion": ubicacion, "Sugerencia": sug}])
                old = conn.read(spreadsheet=url_excel)
                updated = pd.concat([old, nueva_fila], ignore_index=True)
                conn.update(spreadsheet=url_excel, data=updated)
                st.success("¡Recibido!")
            except: st.error("Falla en conexión")
        else: st.warning("Llena los campos")
