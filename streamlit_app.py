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
    # (Mantenemos tu logica de imagenes y frases aleatorias aqui)

# --- REPOSITORIO CARRION (CONEXION REAL) ---
elif opcion == "Repositorio Carrion":
    col1, col2, col3 = st.columns([1,2,1])
    with col2:
        if os.path.exists("logo_carrion.png"):
            st.image("logo_carrion.png", use_container_width=True)
    
    st.markdown("<h1 style='text-align: center;'>Repositorio Academico</h1>", unsafe_allow_html=True)
    
    tabs = st.tabs(["Ciclo 01", "Ciclo 02", "Ciclo 03", "Ciclo 04"])
    for i, tab in enumerate(tabs):
        with tab:
            ciclo_num = f"0{i+1}"
            ruta_ciclo = f"BASE_DATOS/01_CARRION/CICLO_{ciclo_num}"
            
            if os.path.exists(ruta_ciclo):
                # Listamos carpetas de cursos dentro del ciclo
                cursos = [c for c in os.listdir(ruta_ciclo) if os.path.isdir(os.path.join(ruta_ciclo, c))]
                if cursos:
                    for curso in cursos:
                        with st.expander(f"📚 Curso: {curso.replace('_', ' ')}"):
                            ruta_curso = os.path.join(ruta_ciclo, curso)
                            archivos = [f for f in os.listdir(ruta_curso) if f.endswith('.pdf')]
                            for archi in archivos:
                                st.write(f"📄 {archi}")
                                # Boton de descarga simulado o link a GitHub
                                st.caption("Disponible para consulta local")
                else:
                    st.info(f"Organiza tus PDFs en carpetas por curso dentro de CICLO_{ciclo_num}")
            else:
                st.error(f"No se encontro la ruta: {ruta_ciclo}")

# --- BIBLIOTECA TECNICA (BUSCADOR FLEXIBLE) ---
elif opcion == "Biblioteca Tecnica":
    st.title("📚 Biblioteca de Sistemas")
    st.write("Busqueda flexible: Escribe una palabra clave (ej. Netter, Estiramiento, Anatomia)")
    
    filtro = st.text_input("🔍 ¿Que libro o tema buscas?")
    ruta_libros = "BASE_DATOS/02_SISTEMAS"
    
    if os.path.exists(ruta_libros):
        # Busqueda flexible: no importa si es mayuscula o minuscula
        todos_los_libros = [l for l in os.listdir(ruta_libros) if l.endswith('.pdf')]
        libros_filtrados = [l for l in todos_los_libros if filtro.lower() in l.lower()]
        
        if libros_filtrados:
            st.write(f"Se encontraron {len(libros_filtrados)} resultados:")
            cols = st.columns(3) # Cuadricula de 3 columnas
            for idx, libro in enumerate(libros_filtrados):
                with cols[idx % 3]:
                    # Mostramos una miniatura generica (puedes subir portadas luego)
                    st.image("https://cdn-icons-png.flaticon.com/512/3308/3308335.png", width=80)
                    nombre_limpio = libro.replace('_', ' ').replace('.pdf', '')
                    st.write(f"**{nombre_limpio}**")
                    st.caption("Rama: 02_SISTEMAS")
        else:
            st.warning("No hay libros que coincidan con esa palabra.")
    else:
        st.error("Crea la carpeta BASE_DATOS/02_SISTEMAS en GitHub para ver tus libros.")
