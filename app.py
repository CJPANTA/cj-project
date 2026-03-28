import streamlit as st
import json
import pandas as pd
import os

# Estilo de lujo (negro profundo + dorado + texto grisáceo)
st.markdown("""
<style>
    body {
        background-color: #040a12;
        color: #e0e0e0;
        font-family: 'Segoe UI', sans-serif;
    }
    .stButton>button {
        background-color: #c5a059;
        color: #040a12;
        border: 1px solid #b38728;
        border-radius: 0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    .stTextInput>div>div>input {
        background-color: #040a12;
        color: #e0e0e0;
        border: 1px solid #b38728;
    }
    h1, h2, h3 {
        font-family: 'Georgia', serif;
        color: #c5a059;
    }
    .sidebar .sidebar-content {
        background-color: #040a12;
        border-right: 2px solid #c5a059;
    }
    .sidebar .sidebar-content .block-container {
        padding: 1rem;
    }
</style>
""", unsafe_allow_html=True)

# Cargar biblioteca.json
@st.cache_data
def cargar_biblioteca():
    try:
        with open('biblioteca.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"error": "biblioteca.json no encontrado. Crea el archivo con la estructura correcta."}
    except json.JSONDecodeError:
        return {"error": "biblioteca.json está mal formado. Revisa la sintaxis."}

biblioteca = cargar_biblioteca()

if "error" in biblioteca:
    st.error(biblioteca["error"])
    st.stop()

# Cargar CSVs
@st.cache_data
def cargar_csvs():
    try:
        diccionario = pd.read_csv('03_config/diccionario_maestro.csv')
        huesos = pd.read_csv('03_config/hueso_maestro.csv')
        return diccionario, huesos
    except FileNotFoundError:
        return pd.DataFrame(), pd.DataFrame()

diccionario, huesos = cargar_csvs()

# Menú lateral
st.sidebar.image('04_portada/logo_cj.jpg', width=100)
st.sidebar.title("PROYECTO CJ")
menu = st.sidebar.radio("Navegación", ["Inicio", "Repositorio (Carrion)", "Libros", "Sugerencias", "Quiz", "Diccionario", "Administrador"])

# Portada
if menu == "Inicio":
    st.image('04_portada/imagen_fisioterapia.jpg', use_column_width=True)
    st.markdown("<h2 style='text-align: center;'>LA CLAVE DEL ÉXITO ES EL ESTUDIO Y EL ESFUERZO PERSONAL</h2>", unsafe_allow_html=True)
    st.markdown("<p style='text-align: center;'>Aquí vamos José</p>", unsafe_allow_html=True)

# Repositorio (Carrion)
elif menu == "Repositorio (Carrion)":
    st.title("📚 Repositorio Carrion")
    # Aquí puedes listar los PDFs de 01_carrion/
    files = os.listdir('01_carrion/') if os.path.exists('01_carrion/') else []
    for f in files:
        st.markdown(f"- [{f}](01_carrion/{f})")

# Libros
elif menu == "Libros":
    st.title("📖 Libros")
    # Listar PDFs de 02_sistemas/
    files = os.listdir('02_sistemas/') if os.path.exists('02_sistemas/') else []
    for f in files:
        st.markdown(f"- [{f}](02_sistemas/{f})")

# Diccionario
elif menu == "Diccionario":
    st.title("🔍 Diccionario Técnico")
    if not diccionario.empty:
        st.dataframe(diccionario)
    else:
        st.warning("Diccionario no cargado. Revisa 03_config/diccionario_maestro.csv")

# Administrador
elif menu == "Administrador":
    st.title("📊 Dashboard Administrador")
    st.markdown("¡Hola, Jorge! (Administrador)")
    
    # KPIs
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Temas Cargados", 4)
    col2.metric("Volúmenes Totales", 65)
    col3.metric("Libros Vinculados", 42)
    col4.metric("Última Actividad", "12:35 PM")
    
    # Drag & Drop
    st.subheader("📤 Subida Inteligente")
    uploaded_file = st.file_uploader("Arrastra tu PDF aquí", type=["pdf"])
    if uploaded_file:
        st.success(f"✅ {uploaded_file.name} cargado. Recuerda clasificarlo.")
