import streamlit as st
import json
import os

# Estilo de lujo
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

# Modo Usuario
st.title("📚 Proyecto CJ — Biblioteca Académica Digital")
modo = st.radio("Modo", ["Usuario", "Administrador"], horizontal=True)

if modo == "Usuario":
    # Buscador global
    query = st.text_input("🔍 Buscar tema, libro o sesión", "").lower()
    
    # Navegador por ciclos y cursos
    ciclos = list(biblioteca.keys())
    ciclo_seleccionado = st.selectbox("Ciclo", ciclos)
    
    if ciclo_seleccionado in biblioteca:
        cursos = list(biblioteca[ciclo_seleccionado].keys())
        curso_seleccionado = st.selectbox("Curso", cursos)
        
        if curso_seleccionado in biblioteca[ciclo_seleccionado]:
            sesiones = biblioteca[ciclo_seleccionado] [curso_seleccionado].get("SESIONES", [])
            libros = biblioteca[ciclo_seleccionado] [curso_seleccionado].get("LIBROS_VINCULADOS", [])
            
            st.subheader(f"📌 Sesiones de {curso_seleccionado}")
            for sesion in sesiones:
                st.markdown(f"- **{sesion.get('SESION', 'Sin nombre')}** → [Descargar]({sesion.get('ARCHIVO', '#')})")
            
            st.subheader(f"📖 Libros vinculados")
            for libro in libros:
                st.markdown(f"- **{libro.get('TITULO', 'Sin título')}** por {libro.get('AUTOR', 'Desconocido')} (Ed. {libro.get('ED', 'N/A')})")

elif modo == "Administrador":
    st.subheader("📊 Dashboard de Administrador")
    
    # KPIs
    total_ciclos = len(biblioteca)
    total_cursos = sum(len(biblioteca[c]) for c in biblioteca)
    total_sesiones = sum(len(biblioteca[c] [cr].get("SESIONES", [])) for c in biblioteca for cr in biblioteca[c])
    total_libros = sum(len(biblioteca[c] [cr].get("LIBROS_VINCULADOS", [])) for c in biblioteca for cr in biblioteca[c])
    
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Ciclos", total_ciclos)
    col2.metric("Cursos", total_cursos)
    col3.metric("Sesiones", total_sesiones)
    col4.metric("Libros", total_libros)
    
    # Alertas de integridad
    st.subheader("⚠️ Alertas de Integridad")
    for ciclo in biblioteca:
        for curso in biblioteca[ciclo]:
            if not biblioteca[ciclo] [curso].get("SESIONES"):
                st.warning(f"⚠️ {curso} en {ciclo} no tiene sesiones.")
            if not biblioteca[ciclo] [curso].get("LIBROS_VINCULADOS"):
                st.warning(f"⚠️ {curso} en {ciclo} no tiene libros vinculados.")
    
    # Carga inteligente (Drag & Drop)
    st.subheader("📤 Carga Inteligente")
    uploaded_file = st.file_uploader("Arrastra o selecciona un archivo PDF", type=["pdf"])
    if uploaded_file:
        st.success(f"✅ {uploaded_file.name} cargado. Recuerda actualizar biblioteca.json.")
