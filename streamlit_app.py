import streamlit as st
import json

# Configuración de Pantalla
st.set_page_config(page_title="Biblioteca CJ Proyectos", layout="wide")

# Cargar CSS
def load_css():
    with open("style.css", "r", encoding="utf-8") as f:
        st.markdown(f'<style>{f.read()}</style>', unsafe_allow_html=True)

try:
    load_css()
except:
    pass

# Cargar Datos con Validación Extrema
@st.cache_data
def get_data():
    try:
        with open("biblioteca.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        return {"ERROR": str(e)}

db = get_data()

# --- INTERFAZ CJ ---
st.markdown("<h1 class='main-title'>BIBLIOTECA ACADÉMICA CJ</h1>", unsafe_allow_html=True)

# Buscador Principal (Diseño Centralizado)
col_s1, col_s2, col_s3 = st.columns([1, 2, 1])
with col_s2:
    search_query = st.text_input("🔍 BUSCAR TEMA O LIBRO", placeholder="Ej: Esqueleto Axial, Netter, Ciclo 04...")

# Espaciado
st.markdown("<br>", unsafe_allow_html=True)

# Manejo de Error de Base de Datos
if "ERROR" in db:
    st.error(f"⚠️ Error en biblioteca.json: {db['ERROR']}. Revisa las comas y corchetes.")
else:
    # Columnas de Navegación (Siguiendo tu boceto de PC)
    c1, c2 = st.columns(2)
    
    with c1:
        st.markdown("<div class='custom-card'>", unsafe_allow_html=True)
        st.subheader("📁 NAVEGACIÓN POR CICLOS")
        ciclo = st.selectbox("Seleccione Ciclo", list(db.keys()))
        
        # Validar si el ciclo tiene cursos
        if isinstance(db[ciclo], dict):
            curso = st.selectbox("Seleccione Curso", list(db[ciclo].keys()))
            
            st.markdown("### 📄 Sesiones de Clase")
            sesiones = db[ciclo][curso].get("SESIONES", [])
            if sesiones:
                for s in sesiones:
                    st.markdown(f"**{s['SESION']}:** {s['ARCHIVO']}")
            else:
                st.info("No hay sesiones registradas para este curso.")
        else:
            st.warning("Este ciclo aún no tiene cursos cargados.")
        st.markdown("</div>", unsafe_allow_html=True)

    with c2:
        st.markdown("<div class='custom-card'>", unsafe_allow_html=True)
        st.subheader("📖 MATERIAL DE APOYO")
        
        # Mostrar libros vinculados al curso seleccionado
        if isinstance(db[ciclo], dict) and curso in db[ciclo]:
            libros = db[ciclo][curso].get("LIBROS_VINCULADOS", [])
            if libros:
                for l in libros:
                    st.success(f"📘 **{l['TITULO']}**\n\nAutor: {l['AUTOR']} | Ed: {l['ED']}")
            else:
                st.info("No hay libros vinculados específicamente a este curso.")
        
        st.markdown("---")
        st.subheader("📚 Estantería General")
        estanteria = db.get("ESTANTERIA_GENERAL", [])
        if estanteria:
            for lib_g in estanteria:
                st.write(f"📙 {lib_g['TITULO']} ({lib_g['AUTOR']})")
        st.markdown("</div>", unsafe_allow_html=True)

# Footer Profesional
st.markdown("<p style='text-align: center; color: #c5a059; font-size: 0.8rem;'>CJ PROJECTS & GEMINI AI - 2026</p>", unsafe_allow_html=True)
