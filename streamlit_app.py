import streamlit as st
import json

st.set_page_config(page_title="Biblioteca CJ", layout="wide")

# Estilos CSS Integrados para evitar fallos de carga
st.markdown("""
<style>
    .stApp { background-color: #040a12; color: #e0e0e0; }
    .main-title { 
        font-size: 3rem; font-weight: 800; text-align: center;
        background: linear-gradient(135deg, #c5a059, #f7efad, #b38728);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .custom-card { 
        background-color: #0a141e; border: 1px solid #c5a059; 
        padding: 20px; border-radius: 2px; margin-bottom: 20px;
    }
</style>
""", unsafe_allow_html=True)

# Carga de datos
def load_data():
    try:
        with open("biblioteca.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return None

db = load_data()

st.markdown("<h1 class='main-title'>REPOSITORIO ACADÉMICO CJ</h1>", unsafe_allow_html=True)

if not db:
    st.error("❌ El archivo biblioteca.json no se encuentra o tiene un error de formato.")
else:
    # Filtro de Ciclos
    ciclos_disp = [c for c in db.keys() if "CICLO" in c]
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.markdown("<div class='custom-card'>", unsafe_allow_html=True)
        ciclo_sel = st.selectbox("Seleccione el Ciclo", ciclos_disp)
        
        # Validar si el ciclo tiene cursos (objetos dict)
        cursos = [k for k, v in db[ciclo_sel].items() if isinstance(v, dict)]
        
        if cursos:
            curso_sel = st.selectbox("Seleccione el Curso", cursos)
            st.markdown("### 📄 Sesiones")
            for sesion in db[ciclo_sel][curso_sel].get("SESIONES", []):
                st.write(f"• {sesion['SESION']}: {sesion['ARCHIVO']}")
        else:
            st.info("Este ciclo aún no tiene cursos registrados.")
        st.markdown("</div>", unsafe_allow_html=True)

    with col2:
        st.markdown("<div class='custom-card'>", unsafe_allow_html=True)
        if cursos:
            st.markdown(f"### 📘 Material para {curso_sel.replace('_', ' ').title()}")
            libros = db[ciclo_sel][curso_sel].get("LIBROS_VINCULADOS", [])
            if libros:
                for l in libros:
                    st.success(f"**{l['TITULO']}**\n\nAutor: {l['AUTOR']}")
            else:
                st.write("No hay libros vinculados a este curso.")
        
        st.markdown("---")
        st.subheader("📚 Estantería General")
        for lib in db.get("ESTANTERIA_GENERAL", []):
            st.write(f"📙 {lib['TITULO']}")
        st.markdown("</div>", unsafe_allow_html=True)
