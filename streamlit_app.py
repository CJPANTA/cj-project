import streamlit as st
import os
import urllib.parse
from datetime import datetime
import pandas as pd

# 1. IDENTIDAD (Logo 512x512 detectado)
st.set_page_config(page_title="SISTEMA CJ", page_icon="logo_cj.jpg", layout="centered")

# 2. CSS "MEJORADO 5000" (Estilo CJ Premium)
st.markdown("""
    <style>
    /* Ocultar elementos nativos */
    [data-testid="stToolbar"], footer, header, .stDeployButton { display: none !important; }
    .stApp { background-color: #0b0e14; }

    /* FORZADO 2 COLUMNAS (Estilo App Real) */
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

    /* BOTONES DE CURSO (Dorados y elegantes) */
    div.stButton > button {
        width: 100%;
        border-radius: 12px;
        height: 70px !important;
        background-color: #1c2128;
        color: #e5c07b;
        border: 1px solid #e5c07b44;
        font-size: 11px !important;
        font-weight: bold;
        text-transform: uppercase;
        transition: 0.3s ease;
    }
    div.stButton > button:hover { border: 1px solid #e5c07b; background-color: #262c35; }

    /* BOTÓN VOLVER (El toque de encanto) */
    .btn-atras > div > button {
        background-color: transparent !important;
        border: 1.5px solid #e5c07b !important;
        color: #e5c07b !important;
        height: 38px !important;
        padding: 0 25px !important;
        border-radius: 50px !important; /* Estilo píldora */
        font-size: 11px !important;
        letter-spacing: 1px;
        margin-bottom: 25px !important;
    }

    /* FOCO FLOTANTE (Botón con vida) */
    .float-sug {
        position: fixed;
        bottom: 25px;
        left: 20px;
        background-color: #e5c07b;
        width: 55px;
        height: 55px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 26px;
        z-index: 9999;
        box-shadow: 0 4px 20px rgba(229, 192, 123, 0.4);
        cursor: pointer;
        transition: transform 0.2s;
    }
    .float-sug:active { transform: scale(0.9); }
    </style>
    
    <a href="#sugerencias-box" style="text-decoration: none;">
        <div class="float-sug">💡</div>
    </a>
    """, unsafe_allow_html=True)

# 3. LÓGICA DE LOGIN
if 'access' not in st.session_state:
    st.markdown("<h2 style='text-align:center; color:#e5c07b;'>SISTEMA CJ</h2>", unsafe_allow_html=True)
    if os.path.exists("logo_cj.jpg"): 
        col_img, col_v = st.columns([1,2])
        with col_img: st.image("logo_cj.jpg", width=120)
    
    clave = st.text_input("Introduce tu clave:", type="password")
    if clave == "ALUMNO": st.session_state.access = "invitado"; st.rerun()
    elif clave == "cjpanta1": st.session_state.access = "admin"; st.rerun()
    st.stop()

def volver_inicio():
    for k in ['seccion', 'curso_sel', 'ciclo_sel']:
        if k in st.session_state: del st.session_state[k]
    st.rerun()

# 4. CONTENIDO PRINCIPAL
if 'seccion' not in st.session_state:
    st.markdown("<h3 style='text-align:center; color:#e5c07b;'>BIENVENIDO</h3>", unsafe_allow_html=True)
    c1, c2 = st.columns(2)
    with c1:
        if st.button("📚 ACADEMIA"): st.session_state.seccion = 'ACADEMIA'
        if st.session_state.access == "admin" and st.button("🚛 OPERACIONES"): st.session_state.seccion = 'OPERACIONES'
    with c2:
        if st.session_state.access == "admin":
            if st.button("🔬 LABORATORIO"): st.session_state.seccion = 'LABORATORIO'
            if st.button("🏗️ PROYECTOS"): st.session_state.seccion = 'PROYECTOS'
        else: st.warning("Área de Estudios")

elif st.session_state.seccion == 'ACADEMIA':
    st.markdown('<div class="btn-atras">', unsafe_allow_html=True)
    if st.button("⬅ VOLVER"): volver_inicio()
    st.markdown('</div>', unsafe_allow_html=True)

    ciclos = sorted([d for d in os.listdir('.') if os.path.isdir(d) and d.startswith('CICLO_')])
    st.session_state.ciclo_sel = st.selectbox("Elige el Ciclo:", ["..."] + ciclos)

    if st.session_state.ciclo_sel != "...":
        cursos = sorted([d for d in os.listdir(st.session_state.ciclo_sel) if os.path.isdir(os.path.join(st.session_state.ciclo_sel, d))])
        st.write("### Selecciona el Curso")
        
        # Grilla de Cursos 2x2
        for i in range(0, len(cursos), 2):
            cols = st.columns(2)
            with cols[0]:
                if st.button(cursos[i], key=f"c_{cursos[i]}"): st.session_state.curso_sel = cursos[i]
            if i + 1 < len(cursos):
                with cols[1]:
                    if st.button(cursos[i+1], key=f"c_{cursos[i+1]}"): st.session_state.curso_sel = cursos[i+1]

        if 'curso_sel' in st.session_state:
            st.markdown(f"--- \n**Material: {st.session_state.curso_sel}**")
            path = os.path.join(st.session_state.ciclo_sel, st.session_state.curso_sel)
            pdfs = sorted([f for f in os.listdir(path) if f.lower().endswith('.pdf')])
            for pdf in pdfs:
                st.markdown(f"<p style='color:white; margin:10px 0 5px 0;'>📄 {pdf}</p>", unsafe_allow_html=True)
                b1, b2 = st.columns(2)
                raw_url = f"https://raw.githubusercontent.com/CJPANTA/cj-project/main/{st.session_state.ciclo_sel}/{st.session_state.curso_sel}/{pdf}"
                view_url = f"https://docs.google.com/viewer?url={urllib.parse.quote(raw_url)}&embedded=true"
                with b1:
                    if st.button("👁 LEER", key=f"v_{pdf}"):
                        st.markdown(f'<iframe src="{view_url}" width="100%" height="450"></iframe>', unsafe_allow_html=True)
                with b2:
                    with open(os.path.join(path, pdf), "rb") as f:
                        st.download_button("📥 BAJAR", f, file_name=pdf, key=f"d_{pdf}")

# --- SECCIÓN DE SUGERENCIAS (ANCLAJE) ---
st.markdown("<br><br><div id='sugerencias-box'></div>", unsafe_allow_html=True)
st.markdown("---")
with st.expander("💡 DEJA TU SUGERENCIA PARA MEJORAR"):
    nom = st.text_input("¿Cómo te llamas?")
    sug = st.text_area("Cuéntame tu idea:")
    if st.button("ENVIAR SUGERENCIA"):
        if nom and sug:
            archivo = "sugerencias_academia.csv"
            nueva_data = pd.DataFrame([{
                "Fecha": datetime.now().strftime("%d/%m/%Y %H:%M"),
                "Usuario": nom,
                "Lugar": st.session_state.get('curso_sel', 'Menu'),
                "Idea": sug
            }])
            if os.path.exists(archivo):
                df_old = pd.read_csv(archivo)
                pd.concat([df_old, nueva_data]).to_csv(archivo, index=False)
            else:
                nueva_data.to_csv(archivo, index=False)
            st.success("¡Gracias! Tu idea ya está guardada para Jorge.")
        else:
            st.warning("Completa tu nombre e idea para poder leerte.")
