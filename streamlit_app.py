import streamlit as st
import random
import os
from MODULOS.motor_huesos import mostrar_buscador_huesos

st.set_page_config(page_title="Plataforma Clinica CJ", layout="wide")

# Sidebar
st.sidebar.image("logo_cj.jpg", width=150)
opcion = st.sidebar.radio("Menu:", ["Inicio", "Buscador Anatomico", "Repositorio Carrion", "Biblioteca Tecnica"])

# --- INICIO ---
if opcion == "Inicio":
    st.title("Gestion Clinica CJ")
    st.write(f"### Bienvenido, Jorge Luis")
    # (Aqui va tu logica de imagenes aleatorias que ya tenemos)

# --- REPOSITORIO CARRION ---
elif opcion == "Repositorio Carrion":
    # Logo mas grande y centrado
    col1, col2, col3 = st.columns([1,2,1])
    with col2:
        if os.path.exists("logo_carrion.png"):
            st.image("logo_carrion.png", use_container_width=True)
    
    st.markdown("<h1 style='text-align: center;'>Repositorio Academico</h1>", unsafe_allow_html=True)
    
    tabs = st.tabs(["Ciclo 01", "Ciclo 02", "Ciclo 03", "Ciclo 04"])
    for i, tab in enumerate(tabs):
        with tab:
            ruta_ciclo = f"BASE_DATOS/01_CARRION/CICLO_0{i+1}"
            if os.path.exists(ruta_ciclo):
                archivos = os.listdir(ruta_ciclo)
                if archivos:
                    for archi in archivos:
                        st.download_button(f"📖 {archi}", data=archi, file_name=archi)
                else:
                    st.info("Aun no hay archivos en esta carpeta.")

# --- BIBLIOTECA TECNICA (RAMA 02_SISTEMAS) ---
elif opcion == "Biblioteca Tecnica":
    st.title("📚 Biblioteca de Sistemas")
    st.write("Tratados y libros tecnicos (Netter, Kapandji, etc.)")
    
    filtro = st.text_input("Filtrar libros por nombre:")
    ruta_libros = "BASE_DATOS/02_SISTEMAS"
    
    if os.path.exists(ruta_libros):
        libros = [l for l in os.listdir(ruta_libros) if filtro.lower() in l.lower()]
        
        # Grid de miniaturas (3 columnas)
        cols = st.columns(3)
        for idx, libro in enumerate(libros):
            with cols[idx % 3]:
                st.image("https://cdn-icons-png.flaticon.com/512/3308/3308335.png", width=100) # Icono de libro
                st.write(f"**{libro}**")
                st.button("Abrir", key=libro)
