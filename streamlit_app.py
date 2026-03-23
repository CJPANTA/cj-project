import streamlit as st
import os
import urllib.parse
from datetime import datetime
from streamlit_gsheets import GSheetsConnection
import pandas as pd

# 1. IDENTIDAD
st.set_page_config(page_title="SISTEMA CJ", page_icon="logo_cj.jpg", layout="centered")

# 2. ESTILO PREMIUM (Forzado 2x2 y Botón Atrás Elegante)
st.markdown("""
    <style>
    [data-testid="stToolbar"], footer, header, .stDeployButton { display: none !important; }
    .stApp { background-color: #0b0e14; }

    /* FORZADO 2 COLUMNAS REAL */
    [data-testid="column"] {
        width: 48% !important;
        flex: 1 1 48% !important;
        min-width: 0px !important;
    }
    [data-testid="stHorizontalBlock"] {
        gap: 10px !important;
        display: flex !important;
        flex-direction: row !important;
    }

    /* BOTONES DE CURSO */
    div.stButton > button {
        width: 100%;
        border-radius: 12px;
        height: 75px !important;
        background-color: #1c2128;
        color: #e5c07b;
        border: 1px solid #e5c07b44;
        font-size: 12px !important;
        font-weight: bold;
        text-transform: uppercase;
    }

    /* BOTÓN ATRÁS ESTILO CJ */
    .btn-atras > div > button {
        background-color: transparent !important;
        border: 1px solid #e5c07b !important;
        color: #e5c07b !important;
        height: 38px !important;
        width: auto !important;
        padding: 0 20px !important;
        border-radius: 20px !important;
        font-size: 12px !important;
    }

    /* FOCO FLOTANTE IZQUIERDA */
    .float-sug {
        position: fixed;
        bottom: 30px;
        left: 20px;
        background-color: #e5c07b;
        width: 55px;
        height: 55px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 28px;
        z-index: 9999;
        box-shadow: 0 4px 15px rgba(229, 192, 123, 0.4);
    }
    </style>
    <div class="float-sug">💡</div>
    """, unsafe_allow_html=True)

# 3. CONEXIÓN EXCEL
url_excel = "https://docs.google.com/spreadsheets/d/1AJS9Scjskzj1Qo50SfH4y1lIJq4SWWp-ToPD64ziSXo/edit?usp=sharing"

# 4. NAVEGACIÓN Y LOGIN
if 'access' not in st.session_state:
    st.markdown("<h2 style='text-align:center; color:#e5c07b;'>SISTEMA CJ</h2>", unsafe_allow_html=True)
    if os.path.exists("logo_cj.jpg"): st.image("logo_cj.jpg", width=120)
    clave = st.text_input("Acceso:", type="password")
    if clave == "ALUMNO": st.session_state.access = "invitado"; st.rerun()
    elif clave == "cjpanta1": st.session_state.access = "admin"; st.rerun()
    st.stop()

def volver():
    for k in ['seccion', 'curso_sel', 'ciclo_sel']:
        if k in st.session_state: del st.session_state[k]
    st.rerun()

# 5. ESTRUCTURA PRINCIPAL
if 'seccion' not in st.session_state:
    st.markdown("<h3 style='text-align:center; color:#e5c07b;'>MENÚ</h3>", unsafe_allow_html=True)
    c1, c2 = st.columns(2)
    with c1:
        if st.button("📚 ACADEMIA"): st.session_state.seccion = 'ACADEMIA'
    with c2:
        if st.session_state.access == "admin" and st.button("🚛 OPERACIONES"): st.session_state.seccion = 'OPERACIONES'

elif st.session_state.seccion == 'ACADEMIA':
    st.markdown('<div class="btn-atras">', unsafe_allow_html=True)
    if st.button("⬅ VOLVER"): volver()
    st.markdown('</div>', unsafe_allow_html=True)

    ciclos = sorted([d for d in os.listdir('.') if os.path.isdir(d) and d.startswith('CICLO_')])
    st.session_state.ciclo_sel = st.selectbox("Ciclo:", ["..."] + ciclos)

    if st.session_state.ciclo_sel != "...":
        cursos = sorted([d for d in os.listdir(st.session_state.ciclo_sel) if os.path.isdir(os.path.join(st.session_state.ciclo_sel, d))])
        
        # GRILLA 2x2
        for i in range(0, len(cursos), 2):
            cols = st.columns(2)
            with cols[0]:
                if st.button(cursos[i], key=f"c_{cursos[i]}"): st.session_state.curso_sel = cursos[i]
            if i + 1 < len(cursos):
                with cols[1]:
                    if st.button(cursos[i+1], key=f"c_{cursos[i+1]}"): st.session_state.curso_sel = cursos[i+1]

        if 'curso_sel' in st.session_state:
            st.markdown(f"--- \n**{st.session_state.curso_sel}**")
            path = os.path.join(st.session_state.ciclo_sel, st.session_state.curso_sel)
            pdfs = sorted([f for f in os.listdir(path) if f.lower().endswith('.pdf')])
            for pdf in pdfs:
                st.markdown(f"<p style='color:white; font-size:13px; margin:10px 0 5px 0;'>📄 {pdf}</p>", unsafe_allow_html=True)
                b1, b2 = st.columns(2)
                raw_url = f"https://raw.githubusercontent.com/CJPANTA/cj-project/main/{st.session_state.ciclo_sel}/{st.session_state.curso_sel}/{pdf}"
                view_url = f"https://docs.google.com/viewer?url={urllib.parse.quote(raw_url)}&embedded=true"
                with b1:
                    if st.button("👁 LEER", key=f"v_{pdf}"):
                        st.markdown(f'<iframe src="{view_url}" width="100%" height="450"></iframe>', unsafe_allow_html=True)
                with b2:
                    with open(os.path.join(path, pdf), "rb") as f:
                        st.download_button("📥 BAJAR", f, file_name=pdf, key=f"d_{pdf}")

# --- SUGERENCIAS ---
st.markdown("---")
with st.expander("💡 TU OPINIÓN NOS AYUDA"):
    nom = st.text_input("Nombre:")
    sug = st.text_area("Mensaje:")
    if st.button("ENVIAR SUGERENCIA"):
        if nom and sug:
            try:
                conn = st.connection("gsheets", type=GSheetsConnection)
                df_new = pd.DataFrame([{
                    "Fecha": datetime.now().strftime("%d/%m/%Y %H:%M"),
                    "Alumno": nom,
                    "Curso/Seccion": st.session_state.get('curso_sel', 'General'),
                    "Sugerencia": sug
                }])
                df_old = conn.read(spreadsheet=url_excel, worksheet="Sheet1")
                conn.update(spreadsheet=url_excel, data=pd.concat([df_old, df_new], ignore_index=True), worksheet="Sheet1")
                st.success("¡Listo Jorge! Idea enviada.")
            except:
                st.error("Error al conectar con Google Sheets.")
