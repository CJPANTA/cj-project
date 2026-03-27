import streamlit as st
import os
import urllib.parse
from MODULOS.motor_huesos import cargar_imagen_raiz, listar_ciclos_reales

st.set_page_config(page_title="SISTEMA CJ", layout="wide")

# URL Base de tu Repo (Fuente de Verdad)
LINK_RAW = "https://raw.githubusercontent.com/CJPANTA/cj-project/main/BASE_DATOS/01_CARRION/"

# --- CSS: LOGO MINI Y BOTONES ---
st.markdown("""
    <style>
    .stApp { background-color: #06101c; }
    .logo-mini { position: fixed; top: 15px; right: 15px; border-radius: 50%; border: 1px solid #6e4f02; z-index: 1000; }
    .titulo-seccion { color: #6e4f02; font-family: serif; font-weight: bold; text-align: center; }
    
    /* Estilo de botones de ciclo */
    div.stButton > button:first-child {
        background-color: #008080; color: white; border-radius: 15px;
        border: 1px solid #6e4f02; margin-bottom: 5px; width: 100%;
    }
    </style>
    """, unsafe_allow_html=True)

# --- LOGO EN ESQUINA SUPERIOR ---
logo_cj = cargar_imagen_raiz("logo_cj.jpg")
if logo_cj:
    st.markdown(f'<img src="{logo_cj}" width="50" class="logo-mini">', unsafe_allow_html=True)

# --- SIDEBAR ---
with st.sidebar:
    st.markdown("<h2 style='text-align: center; color: #6e4f02;'>PROYECTO CJ</h2>", unsafe_allow_html=True)
    menu = st.radio("NAVEGACIÓN", ["🏠 INICIO", "📖 REPOSITORIO"])

if menu == "📖 REPOSITORIO":
    st.markdown('<h1 class="titulo-seccion">BIBLIOTECA CARRIÓN</h1>', unsafe_allow_html=True)
    
    ciclos = listar_ciclos_reales()
    if ciclos:
        # Fila de botones para elegir ciclo
        col_btn = st.columns(len(ciclos))
        for i, c in enumerate(ciclos):
            if col_btn[i].button(c.replace("_", " "), key=c):
                st.session_state['ciclo_activo'] = c

        # Ciclo por defecto
        sel = st.session_state.get('ciclo_activo', ciclos[0])
        st.write(f"📂 **Carpeta actual:** {sel}")
        
        # Buscador
        busqueda = st.text_input("🔍 Buscar por nombre de curso...", placeholder="Ej: Anatomía")
        
        ruta_docs = os.path.join(os.path.dirname(os.path.abspath(__file__)), "BASE_DATOS", "01_CARRION", sel)
        archivos = [f for f in os.listdir(ruta_docs) if f.endswith('.pdf')]
        
        if busqueda:
            archivos = [f for f in archivos if busqueda.lower() in f.lower()]

        for arc in archivos:
            with st.container(border=True):
                c1, c2, c3 = st.columns([3, 1, 1])
                c1.write(f"📄 {arc}")
                
                # Codificar URL para evitar errores con espacios/tildes
                url_limpia = LINK_RAW + sel + "/" + urllib.parse.quote(arc)
                
                if c2.button("👁️ Ver", key=f"ver_{arc}"):
                    st.markdown(f'<iframe src="{url_limpia}" width="100%" height="500px"></iframe>', unsafe_allow_html=True)
                c3.link_button("📥 Bajar", url_limpia)
