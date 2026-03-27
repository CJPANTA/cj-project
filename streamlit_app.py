import streamlit as st
import os
import urllib.parse
from MODULOS.motor_huesos import cargar_imagen_raiz

st.set_page_config(page_title="SISTEMA CJ", layout="wide")

# URL BASE DE TU GITHUB (ESTRICTO)
LINK_RAW = "https://raw.githubusercontent.com/CJPANTA/cj-project/main/BASE_DATOS/01_CARRION/"

# --- ESTILOS CJ ---
st.markdown("""
    <style>
    .stApp { background-color: #06101c; color: #d1d5db; }
    .titulo-cj { color: #6e4f02; font-family: serif; text-align: center; font-weight: bold; font-size: 50px; }
    
    /* Botones estilo píldora Verde Esmeralda */
    div.stButton > button {
        background-color: #008080 !important; color: white !important;
        border-radius: 20px !important; border: 1px solid #6e4f02 !important;
        width: 100%;
    }
    /* Contenedor de PDF */
    .pdf-container { border: 2px solid #6e4f02; border-radius: 10px; padding: 10px; }
    </style>
    """, unsafe_allow_html=True)

# --- SIDEBAR ESTABLE ---
logo_cj = cargar_imagen_raiz("logo_cj.jpg")
with st.sidebar:
    if logo_cj:
        st.markdown(f'<div style="text-align: center;"><img src="{logo_cj}" width="120"></div>', unsafe_allow_html=True)
    st.markdown("<h2 style='text-align: center; color: #6e4f02;'>PROYECTO CJ</h2>", unsafe_allow_html=True)
    st.divider()
    menu = st.radio("SECCIONES", ["🏠 INICIO", "📖 REPOSITORIO"])

# --- LÓGICA DE NAVEGACIÓN ---
if menu == "🏠 INICIO":
    st.markdown('<h1 class="titulo-cj">PROYECTO CJ</h1>', unsafe_allow_html=True)
    st.image("https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?q=80&w=2000", use_container_width=True)
    st.markdown("<h3 style='color: #6e4f02; text-align: center;'>Bienvenido, Jorge Luis</h3>", unsafe_allow_html=True)

elif menu == "📖 REPOSITORIO":
    st.markdown('<h1 style="color: #6e4f02; text-align: center;">BIBLIOTECA CARRIÓN</h1>', unsafe_allow_html=True)
    
    # Lista de ciclos (Aquí los agregas manualmente por ahora para evitar errores de lectura de GitHub)
    ciclos = ["01_CICLO", "02_CICLO", "03_CICLO", "04_CICLO"]
    
    # Selector de Ciclos con Botones
    cols = st.columns(len(ciclos))
    for i, c in enumerate(ciclos):
        if cols[i].button(c.replace("_", " ")):
            st.session_state['ciclo_activo'] = c

    ciclo_sel = st.session_state.get('ciclo_activo', "01_CICLO")
    st.markdown(f"### 📂 Viendo: {ciclo_sel.replace('_', ' ')}")
    
    # Como no puedo leer archivos de GitHub dinámicamente sin API, 
    # por ahora dime si prefieres que use una lista fija de tus archivos o 
    # si intentamos una conexión API para que sea automático.
    st.info("⚠️ Para que los PDFs aparezcan aquí automáticamente, necesitamos la lista exacta de archivos de tu GitHub.")
