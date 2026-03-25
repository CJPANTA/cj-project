import streamlit as st
import os
import random
from MODULOS.motor_huesos import mostrar_buscador_huesos

st.set_page_config(page_title="Plataforma Clinica CJ", layout="wide")

# --- AJUSTE DE CONEXION ---
# REEMPLAZA ESTO CON TUS DATOS REALES DE GITHUB
USUARIO = "TuUsuarioGitHub" 
REPOSITORIO = "NombreTuRepo"
RAMA = "main"
LINK_BASE = f"https://github.com/{USUARIO}/{REPOSITORIO}/raw/{RAMA}/"

# Icono personalizado para libros (el que me pasaste)
ICONO_LIBRO = "https://i.pinimg.com/736x/c4/23/d7/c423d7f929650892d3345964a5230989.jpg"

# --- SIDEBAR ---
st.sidebar.image("logo_cj.jpg", width=150)
opcion = st.sidebar.radio("Navegación", ["Inicio", "Buscador Anatomico", "Repositorio Carrion", "Biblioteca Tecnica"])

# --- REPOSITORIO CARRION ---
if opcion == "Repositorio Carrion":
    c1, c2, c3 = st.columns([1, 1.5, 1])
    with c2:
        if os.path.exists("logo_carrion.png"):
            st.image("logo_carrion.png", use_container_width=True)
    
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
                            col_txt, col_btn = st.columns([3, 1])
                            col_txt.write(f"📄 {f}")
                            # Boton de descarga/apertura real
                            link_final = f"{LINK_BASE}{ruta_c}/{f}".replace(" ", "%20")
                            col_btn.link_button("Abrir / Bajar", link_final)

# --- BIBLIOTECA TECNICA ---
elif opcion == "Biblioteca Tecnica":
    st.title("📚 Biblioteca de Sistemas")
    filtro = st.text_input("🔍 ¿Que libro buscas?")
    ruta_lib = "BASE_DATOS/02_SISTEMAS"
    ruta_port = "BASE_DATOS/04_PORTADAS"
    
    if os.path.exists(ruta_lib):
        libros = sorted([l for l in os.listdir(ruta_lib) if l.endswith('.pdf')])
        filtrados = [l for l in libros if filtro.lower() in l.lower()]
        
        cols = st.columns(4)
        for idx, lib in enumerate(filtrados):
            with cols[idx % 4]:
                # Portada o Icono Personalizado
                img_p = lib.replace('.pdf', '.jpg')
                if os.path.exists(f"{ruta_port}/{img_p}"):
                    st.image(f"{ruta_port}/{img_p}", use_container_width=True)
                else:
                    st.image(ICONO_LIBRO, width=120)
                
                st.write(f"**{lib.replace('.pdf','')}**")
                link_lib = f"{LINK_BASE}{ruta_lib}/{lib}".replace(" ", "%20")
                st.link_button("Ver Libro", link_lib)

# Mantenemos las otras secciones (Inicio, Buscador) llamando a sus funciones
elif opcion == "Inicio":
    st.title("Gestión Clínica CJ")
    st.write("### Bienvenido, Lic. Jorge Luis")
    st.image("https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=1000", use_container_width=True)
elif opcion == "Buscador Anatomico":
    mostrar_buscador_huesos()
