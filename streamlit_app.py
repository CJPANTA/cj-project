import streamlit as st
import sys
import os

# Asegurar que MODULOS sea visible
sys.path.append(os.path.join(os.path.dirname(__file__), "MODULOS"))
from motor_huesos import cargar_csv_maestro, listar_archivos_biblioteca, DIR_CARRION, DIR_SISTEMAS, DIR_PORTADAS

st.set_page_config(page_title="PROYECTO CJ", layout="wide")

# --- BARRA LATERAL ESTILO "CARRION" ---
st.sidebar.image("https://images.unsplash.com/photo-1576091160550-2173dbc999ef?q=80&w=400", caption="Anatomía Digital CJ")
menu = st.sidebar.radio("MENÚ PRINCIPAL", ["🏠 Inicio", "🦴 Anatomía Maestro", "📖 Biblioteca Carrión", "📚 Biblioteca Técnica"])

# URL Base para GitHub (Ajustar a tu repo)
LINK_RAW = "https://raw.githubusercontent.com/CJPANTA/cj-project/main/BASE_DATOS/"

# --- SECCIÓN 1: ANATOMÍA ---
if menu == "🦴 Anatomía Maestro":
    st.title("🦴 Buscador Anatomía Maestro")
    df, error = cargar_csv_maestro()
    
    if error:
        st.error(f"Error de conexión: {error}")
    else:
        busqueda = st.text_input("🔍 Filtra por hueso o región (Ej: Frontal, Fémur)...")
        if busqueda:
            df = df[df.apply(lambda r: busqueda.lower() in r.astype(str).lower().values, axis=1)]

        cols = st.columns(3)
        for i, (_, row) in enumerate(df.iterrows()):
            with cols[i % 3]:
                with st.container(border=True):
                    # Imagen dinámica por hueso
                    st.image(f"https://loremflickr.com/400/200/anatomy,bone/all?lock={i}")
                    st.subheader(row.get('Nombre_Hueso', 'N/A'))
                    st.write(f"**📍 Región:** {row.get('Region', 'N/A')}")
                    st.info(f"**💡 Píldora BRI:** {row.get('Accion_Sugerida', 'N/A')}")
                    
                    c1, c2 = st.columns(2)
                    if row.get('Link_PDF_Carrion'):
                        url = f"{LINK_RAW}01_CARRION/{row['Link_PDF_Carrion']}".replace(" ","%20")
                        c1.link_button("📄 Ver Clase", url, use_container_width=True)
                    if row.get('Referencia_Netter'):
                        c2.link_button("📚 Libro", "#", use_container_width=True)

# --- SECCIÓN 2: BIBLIOTECA CARRIÓN (ORGANIZADA POR CICLOS) ---
elif menu == "📖 Biblioteca Carrión":
    st.title("📖 Repositorio de Ciclos - Carrión")
    ciclos = listar_archivos_biblioteca(DIR_CARRION)
    ciclos = [c for c in ciclos if os.path.isdir(os.path.join(DIR_CARRION, c))]
    
    if ciclos:
        ciclo_sel = st.sidebar.selectbox("Seleccionar Ciclo:", ciclos)
        ruta_ciclo = os.path.join(DIR_CARRION, ciclo_sel)
        pdfs = [f for f in os.listdir(ruta_ciclo) if f.endswith('.pdf')]
        
        c_grid = st.columns(4)
        for i, pdf in enumerate(pdfs):
            with c_grid[i % 4]:
                st.markdown(f"📄 **{pdf[:20]}...**")
                url_c = f"{LINK_RAW}01_CARRION/{ciclo_sel}/{pdf}".replace(" ","%20")
                st.link_button("Abrir", url_c, use_container_width=True)
    else:
        st.warning("No se encontraron carpetas de ciclos en 01_CARRION.")

# --- SECCIÓN 3: INICIO (PÁGINA DE BIENVENIDA) ---
elif menu == "🏠 Inicio":
    st.title("Sistema de Optimización de Estudio")
    st.image("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200", use_container_width=True)
    st.success("Bienvenido Jorge Luis. Sistema cargado y listo para Aucallama.")
