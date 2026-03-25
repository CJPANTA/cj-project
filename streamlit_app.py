import streamlit as st
import random
import os
from MODULOS.motor_huesos import mostrar_buscador_huesos

st.set_page_config(page_title="Plataforma Clinica CJ", layout="wide")

# --- SIDEBAR ---
st.sidebar.image("logo_cj.jpg", width=150)
st.sidebar.title("Navegacion")
opcion = st.sidebar.radio("", ["Inicio", "Buscador Anatomico", "Repositorio Carrion", "Biblioteca Tecnica"])

# --- INICIO ---
if opcion == "Inicio":
    st.title("Gestion de Conocimiento Clinico")
    st.write("### Bienvenido, Lic. Jorge Luis")
    img_inicio = ["https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=1000"]
    st.image(random.choice(img_inicio), use_container_width=True)
    st.info("💡 Tip: El Hioides es el unico hueso que no se articula con otro.")

# --- REPOSITORIO CARRION ---
elif opcion == "Repositorio Carrion":
    c1, c2, c3 = st.columns([1,2,1])
    with c2:
        if os.path.exists("logo_carrion.png"):
            st.image("logo_carrion.png", width=350)
    
    st.markdown("<h2 style='text-align: center;'>REPOSITORIO ACADEMICO</h2>", unsafe_allow_html=True)
    
    tabs = st.tabs(["Ciclo 01", "Ciclo 02", "Ciclo 03", "Ciclo 04"])
    for i, tab in enumerate(tabs):
        with tab:
            ruta = f"BASE_DATOS/01_CARRION/CICLO_0{i+1}"
            if os.path.exists(ruta):
                # Buscamos carpetas de cursos
                cursos = [d for d in os.listdir(ruta) if os.path.isdir(os.path.join(ruta, d))]
                if cursos:
                    for curso in cursos:
                        with st.expander(f"📘 {curso.replace('_', ' ')}"):
                            # Aqui mostramos los PDFs
                            files = [f for f in os.listdir(os.path.join(ruta, curso)) if f.endswith('.pdf')]
                            for f in files:
                                st.write(f"📄 {f}")
                else: st.info("Sube tus carpetas de cursos aqui.")
            else: st.error("Ruta no detectada.")

# --- BIBLIOTECA TECNICA ---
elif opcion == "Biblioteca Tecnica":
    st.title("📚 Biblioteca de Sistemas")
    filtro = st.text_input("🔍 Filtro rapido (Netter, Biomecanica, etc.):")
    ruta_l = "BASE_DATOS/02_SISTEMAS"
    ruta_p = "BASE_DATOS/04_PORTADAS"
    
    if os.path.exists(ruta_l):
        libros = [l for l in os.listdir(ruta_l) if l.endswith('.pdf')]
        filtrados = [l for l in libros if filtro.lower() in l.lower()]
        
        cols = st.columns(4)
        for idx, lib in enumerate(filtrados):
            with cols[idx % 4]:
                # Logica de portadas reales
                img_p = lib.replace('.pdf', '.jpg')
                path_p = os.path.join(ruta_p, img_p)
                if os.path.exists(path_p):
                    st.image(path_p, use_container_width=True)
                else:
                    st.image("https://cdn-icons-png.flaticon.com/512/3308/3308335.png", width=100)
                st.write(f"**{lib.replace('.pdf','')}**")
