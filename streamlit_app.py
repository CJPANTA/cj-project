import streamlit as st
import json

# Configuración de página
st.set_page_config(page_title="CJ Control Tower", layout="wide")

# Cargar Estilos
def load_css():
    try:
        with open("style.css", "r", encoding="utf-8") as f:
            st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)
    except FileNotFoundError:
        pass

load_css()

# Cargar Datos
@st.cache_data
def load_data():
    with open("biblioteca.json", "r", encoding="utf-8") as f:
        return json.load(f)

data = load_data()

# Sidebar
with st.sidebar:
    st.markdown("<h2 style='text-align: center;'>CJ PROJECTS</h2>", unsafe_allow_html=True)
    perfil = st.radio("ACCESO", ["Usuario", "Administrador"])

# MODO ADMINISTRADOR
if perfil == "Administrador":
    st.markdown("<h1 class='titulo-premium'>CENTRO DE MANDO (ADMIN)</h1>", unsafe_allow_html=True)
    
    # KPIs
    c1, c2, c3 = st.columns(3)
    c1.metric("Sesiones Cargadas", "20")
    c2.metric("Libros Vinculados", "4")
    c3.metric("Alertas Activas", "1")
    
    st.markdown("---")
    
    # Módulo de Subida
    st.subheader("🚀 Subida Inteligente")
    col_up, col_info = st.columns([2, 1])
    with col_up:
        u_file = st.file_uploader("Arrastra tu PDF aquí", type="pdf")
    with col_info:
        st.info("El sistema clasificará el archivo según los metadatos del JSON.")
        
    # Alertas
    st.subheader("⚠️ Alertas de Integridad")
    st.warning("Aviso: El libro 'Estiramientos...' se encuentra en Estantería General sin curso asignado.")

# MODO USUARIO
else:
    st.markdown("<h1 class='titulo-premium'>REPOSITORIO ACADÉMICO CJ</h1>", unsafe_allow_html=True)
    
    # Buscador
    search = st.text_input("🔍 Buscar por tema o libro...", placeholder="Ej: Anatomía, Hombro, Netter...")
    
    col_ciclo, col_curso = st.columns(2)
    with col_ciclo:
        ciclo_key = st.selectbox("Seleccionar Ciclo", [k for k in data.keys() if "CICLO" in k])
    with col_curso:
        cursos_disponibles = [k for k in data[ciclo_key].keys() if k != "MENSAJE"]
        if cursos_disponibles:
            curso_key = st.selectbox("Seleccionar Curso", cursos_disponibles)
        else:
            st.write("No hay cursos cargados para este ciclo.")
            curso_key = None

    if curso_key:
        st.markdown("---")
        col_pdf, col_lib = st.columns(2)
        
        with col_pdf:
            st.markdown("### 📄 Sesiones de Clase")
            for sesion in data[ciclo_key][curso_key]["SESIONES"]:
                st.write(f"🔹 {sesion['SESION']}: {sesion['ARCHIVO']}")
        
        with col_lib:
            st.markdown("### 📖 Libros Sugeridos")
            for libro in data[ciclo_key][curso_key]["LIBROS_VINCULADOS"]:
                st.success(f"📘 **{libro['TITULO']}** - {libro['AUTOR']}")
