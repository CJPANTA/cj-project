import streamlit as st
import os
import random
from MODULOS.motor_huesos import mostrar_buscador_huesos

st.set_page_config(page_title="Plataforma Clinica CJ", layout="wide")

# --- CONFIGURACION DE RUTAS BASE (Cambia 'tu_usuario' y 'tu_repo') ---
BASE_GITHUB = "https://github.com/tu_usuario/tu_repo/blob/main"

# --- SIDEBAR ---
st.sidebar.image("logo_cj.jpg", width=150)
opcion = st.sidebar.radio("Menú Principal", ["Inicio", "Buscador Anatomico", "Repositorio Carrion", "Biblioteca Tecnica"])

# --- INICIO ---
if opcion == "Inicio":
    st.title("Gestion de Conocimiento Clinico")
    st.write("### Bienvenido, Lic. Jorge Luis")
    img_inicio = ["https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=1000"]
    st.image(random.choice(img_inicio), use_container_width=True)
    st.info("💡 Tip: La constancia es la base del exito profesional.")

# --- REPOSITORIO CARRION ---
elif opcion == "Repositorio Carrion":
    # Centrado forzado del logo
    col1, col2, col3 = st.columns([1, 1.5, 1])
    with col2:
        if os.path.exists("logo_carrion.png"):
            st.image("logo_carrion.png", use_container_width=True)
    
    st.markdown("<h2 style='text-align: center;'>REPOSITORIO ACADEMICO</h2>", unsafe_allow_html=True)
    
    tabs = st.tabs(["Ciclo 01", "Ciclo 02", "Ciclo 03", "Ciclo 04"])
    for i, tab in enumerate(tabs):
        with tab:
            ruta_ciclo = f"BASE_DATOS/01_CARRION/CICLO_0{i+1}"
            if os.path.exists(ruta_ciclo):
                # ORDEN ALFANUMERICO de Cursos
                cursos = sorted([d for d in os.listdir(ruta_ciclo) if os.path.isdir(os.path.join(ruta_ciclo, d))])
                if cursos:
                    for curso in cursos:
                        with st.expander(f"📘 {curso.replace('_', ' ')}"):
                            ruta_curso = os.path.join(ruta_ciclo, curso)
                            # ORDEN ALFANUMERICO de Archivos
                            archivos = sorted([f for f in os.listdir(ruta_curso) if f.endswith('.pdf')])
                            for f in archivos:
                                col_f, col_b = st.columns([4, 1])
                                col_f.write(f"📄 {f}")
                                # ENLACE REAL A GITHUB
                                url_final = f"{BASE_GITHUB}/{ruta_curso}/{f}".replace(" ", "%20")
                                col_b.link_button("Abrir", url_final)
                else: st.info("No hay carpetas de cursos detectadas.")
            else: st.error("Ruta no encontrada en el sistema.")

# --- BIBLIOTECA TECNICA ---
elif opcion == "Biblioteca Tecnica":
    st.title("📚 Biblioteca de Sistemas")
    filtro = st.text_input("🔍 Filtrar libros:")
    
    ruta_libros = "BASE_DATOS/02_SISTEMAS"
    ruta_portadas = "BASE_DATOS/04_PORTADAS"
    
    if os.path.exists(ruta_libros):
        libros = sorted([l for l in os.listdir(ruta_libros) if l.endswith('.pdf')])
        filtrados = [l for l in libros if filtro.lower() in l.lower()]
        
        # Cuadricula fija de 4 columnas para que se vea parejo
        cols = st.columns(4)
        for idx, lib in enumerate(filtrados):
            with cols[idx % 4]:
                # Portadas pequeñas y uniformes
                img_p = lib.replace('.pdf', '.jpg')
                path_p = os.path.join(ruta_portadas, img_p)
                if os.path.exists(path_p):
                    st.image(path_p, width=150) # Tamaño fijo para uniformidad
                else:
                    st.image("https://cdn-icons-png.flaticon.com/512/3308/3308335.png", width=100)
                
                st.write(f"**{lib.replace('.pdf','').replace('_',' ')}**")
                url_lib = f"{BASE_GITHUB}/{ruta_libros}/{lib}".replace(" ", "%20")
                st.link_button("Leer Libro", url_lib)
