import streamlit as st
import os
import random
from MODULOS.motor_huesos import mostrar_buscador_huesos

st.set_page_config(page_title="Plataforma Clinica CJ", layout="wide")

# --- CONFIGURACION DE CONEXIONES (CRITICO) ---
USUARIO = "TuUsuario" # <--- CAMBIA ESTO
REPO = "TuRepo"       # <--- CAMBIA ESTO
LINK_VIEW = f"https://github.com/{USUARIO}/{REPO}/blob/main/"
LINK_RAW = f"https://github.com/{USUARIO}/{REPO}/raw/main/"

ICONO_LIBRO = "https://i.pinimg.com/736x/c4/23/d7/c423d7f929650892d3345964a5230989.jpg"

# --- SIDEBAR ---
st.sidebar.image("logo_cj.jpg", width=150)
opcion = st.sidebar.radio("Navegación", ["Inicio", "Buscador Anatomico", "Repositorio Carrion", "Biblioteca Tecnica"])

# --- INICIO ---
if opcion == "Inicio":
    st.title("Gestión Clínica CJ")
    st.write(f"### Bienvenido, Lic. Jorge Luis")
    st.image("https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=1000", use_container_width=True)
    st.info("💡 El orden y la precisión son la base de un buen diagnóstico.")

# --- REPOSITORIO CARRION ---
elif opcion == "Repositorio Carrion":
    c1, c2, c3 = st.columns([1, 1.5, 1])
    with c2: 
        if os.path.exists("logo_carrion.png"): st.image("logo_carrion.png", use_container_width=True)
    
    st.markdown("<h2 style='text-align: center;'>REPOSITORIO ACADEMICO</h2>", unsafe_allow_html=True)
    
    tabs = st.tabs(["Ciclo 01", "Ciclo 02", "Ciclo 03", "Ciclo 04"])
    for i, tab in enumerate(tabs):
        with tab:
            ruta_ciclo = f"BASE_DATOS/01_CARRION/CICLO_0{i+1}"
            if os.path.exists(ruta_ciclo):
                cursos = sorted([d for d in os.listdir(ruta_ciclo) if os.path.isdir(os.path.join(ruta_ciclo, d))])
                for curso in cursos:
                    with st.expander(f"📘 {curso.replace('_', ' ')}"):
                        ruta_c = f"{ruta_ciclo}/{curso}"
                        archivos = sorted([f for f in os.listdir(ruta_c) if f.endswith('.pdf')])
                        for f in archivos:
                            col_txt, col_v, col_d = st.columns([2, 1, 1])
                            col_txt.write(f"📄 {f}")
                            # Botones separados para evitar el 404
                            url_v = f"{LINK_VIEW}{ruta_c}/{f}".replace(" ", "%20")
                            url_d = f"{LINK_RAW}{ruta_c}/{f}".replace(" ", "%20")
                            col_v.link_button("👁️ Ver", url_v)
                            col_d.link_button("📥 Bajar", url_d)

# --- BIBLIOTECA TECNICA ---
elif opcion == "Biblioteca Tecnica":
    st.title("📚 Biblioteca de Sistemas")
    filtro = st.text_input("🔍 Buscar por título:")
    ruta_lib = "BASE_DATOS/02_SISTEMAS"
    ruta_port = "BASE_DATOS/04_PORTADAS"
    
    if os.path.exists(ruta_lib):
        libros = sorted([l for l in os.listdir(ruta_lib) if l.endswith('.pdf')])
        filtrados = [l for l in libros if filtro.lower() in l.lower()]
        
        cols = st.columns(4)
        for idx, lib in enumerate(filtrados):
            with cols[idx % 4]:
                # Forzamos que todas las portadas tengan la misma altura visual
                img_p = lib.replace('.pdf', '.jpg')
                if os.path.exists(f"{ruta_port}/{img_p}"):
                    st.image(f"{ruta_port}/{img_p}", use_container_width=True)
                else:
                    st.image(ICONO_LIBRO, use_container_width=True)
                
                st.write(f"**{lib.replace('.pdf','')}**")
                url_v = f"{LINK_VIEW}{ruta_lib}/{lib}".replace(" ", "%20")
                url_d = f"{LINK_RAW}{ruta_lib}/{lib}".replace(" ", "%20")
                st.link_button("👁️ Leer", url_v)
                st.link_button("📥 Bajar", url_d)

elif opcion == "Buscador Anatomico":
    mostrar_buscador_huesos()
