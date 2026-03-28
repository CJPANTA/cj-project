import streamlit as st
import repositorio_carrion as repo
from MODULOS import motor_huesos # Corregido a tu estructura exacta

# Configuración de página
st.set_page_config(page_title="SISTEMA CJ", layout="wide")

# Carga de estilos
try:
    with open("style.css") as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)
except:
    pass

# --- SIDEBAR (NAVEGACIÓN) ---
with st.sidebar:
    st.title("🛡️ SISTEMA CJ")
    menu = st.radio("MENÚ", ["🏠 Dashboard", "📖 Biblioteca Carrión", "🦴 Anatomía Activa"])
    st.markdown("---")
    busqueda = st.text_input("🔍 BUSCADOR RÁPIDO", placeholder="Ej: Histología...")

# --- LÓGICA DE DATOS ---
datos_biblioteca = repo.cargar_datos()

# Interfaz de Búsqueda (Prioridad Alta)
if busqueda and datos_biblioteca:
    st.header(f"🎯 Resultados para: {busqueda}")
    resultados = repo.buscador_inteligente(datos_biblioteca, busqueda)
    if resultados:
        for res in resultados:
            c1, c2 = st.columns([4, 1])
            c1.write(f"**{res['pdf']}**\n_{res['info']}_")
            if os.path.exists(res['ruta']):
                with open(res['ruta'], "rb") as f:
                    c2.download_button("Abrir", f, file_name=res['pdf'], key="s_"+res['ruta'])
    else:
        st.warning("No se encontraron coincidencias.")
    st.markdown("---")

# --- CUERPO DE LA APP ---
if menu == "🏠 Dashboard":
    st.title("Gestión Académica - Jorge Luis")
    st.write("Bienvenido al centro de control. Selecciona una opción en el menú lateral.")

elif menu == "📖 Biblioteca Carrión" and datos_biblioteca:
    st.title("Repositorio Institucional")
    ciclo_sel = st.select_slider("Selecciona el Ciclo de estudio:", options=[1, 2, 3, 4], value=4)
    repo.mostrar_pdfs_ciclo(datos_biblioteca, ciclo_sel)

elif menu == "🦴 Anatomía Activa":
    motor_huesos.interfaz_estudio_oseo()
