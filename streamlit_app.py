import streamlit as st
import sys
import os

# Asegurar conexión con MODULOS
sys.path.append(os.path.join(os.path.dirname(__file__), "MODULOS"))
from motor_huesos import cargar_csv_maestro, obtener_archivos, DIR_CARRION, DIR_SISTEMAS

# --- CONFIGURACIÓN DE PÁGINA ---
st.set_page_config(page_title="CJ PROYECTOS - Jorge Luis", layout="wide")

# URL del Logo CJ en tu GitHub (Basado en tus capturas)
URL_LOGO_CJ = "https://raw.githubusercontent.com/CJPANTA/cj-project/main/BASE_DATOS/04_PORTADAS/LOGO_CJ.png"
LINK_RAW = "https://raw.githubusercontent.com/CJPANTA/cj-project/main/BASE_DATOS/"

# --- SIDEBAR: IDENTIDAD ---
with st.sidebar:
    st.image(URL_LOGO_CJ, width=150)
    st.markdown(f"### CJ PROYECTOS\n**Lic. Jorge Luis Chiroque**")
    st.divider()
    menu = st.sidebar.radio("MENÚ PRINCIPAL", ["🏠 Inicio", "🦴 Anatomía Maestro", "📖 Repositorio Carrión", "📚 Biblioteca Técnica"])

# --- SECCIÓN: INICIO ---
if menu == "🏠 Inicio":
    st.title("Bienvenido al Sistema de Optimización de Estudio")
    st.subheader(f"Lic. Jorge Luis Chiroque Panta")
    st.image("https://images.unsplash.com/photo-1576091160550-2173dbc999ef?q=80&w=2000", use_container_width=True)
    st.success("Eficiencia máxima en Fisioterapia. Selecciona un módulo para empezar.")

# --- SECCIÓN: ANATOMÍA MAESTRO ---
elif menu == "🦴 Anatomía Maestro":
    st.title("🦴 Buscador Anatomía Maestro")
    df, error = cargar_csv_maestro()
    
    if error:
        st.error(f"Error: {error}")
    else:
        busqueda = st.text_input("🔍 Buscar por Hueso, Región o Píldora BRI:", placeholder="Escribe aquí...")
        
        if busqueda:
            # Filtro inteligente que no da error si hay nulos o typos
            df = df[df.apply(lambda row: busqueda.lower() in row.astype(str).lower().values, axis=1)]

        cols = st.columns(3)
        for i, (_, row) in enumerate(df.iterrows()):
            with cols[i % 3]:
                with st.container(border=True):
                    st.markdown(f"### {row.get('Nombre_Hueso', 'Sin nombre')}")
                    st.caption(f"📍 {row.get('Region', 'General')}")
                    st.info(f"**Píldora BRI:** {row.get('Accion_Sugerida', 'Revisar manual')}")
                    
                    with st.expander("Ver Detalles"):
                        st.write(f"**Cara:** {row.get('Cara', 'N/A')}")
                        st.write(f"**Accidentes:** {row.get('Accidentes_Oseos', 'N/A')}")
                    
                    if row.get('Link_PDF_Carrion'):
                        url = f"{LINK_RAW}01_CARRION/{row['Link_PDF_Carrion']}".replace(" ","%20")
                        st.link_button("📄 Ver Clase PDF", url, use_container_width=True)

# --- SECCIÓN: REPOSITORIO CARRIÓN (AHORA EN PANTALLA PRINCIPAL) ---
elif menu == "📖 Repositorio Carrión":
    st.title("📖 Repositorio de Ciclos Carrión")
    ciclos = obtener_archivos(DIR_CARRION)
    
    if ciclos:
        # El selector de ciclo ahora está en la pantalla principal, no en el lateral
        ciclo_sel = st.selectbox("Selecciona el Ciclo a estudiar:", ciclos)
        ruta_ciclo = os.path.join(DIR_CARRION, ciclo_sel)
        pdfs = [f for f in os.listdir(ruta_ciclo) if f.endswith('.pdf')]
        
        if pdfs:
            st.write(f"### Archivos en {ciclo_sel}")
            c_grid = st.columns(4)
            for i, pdf in enumerate(pdfs):
                with c_grid[i % 4]:
                    with st.container(border=True):
                        st.write(f"📄 {pdf[:25]}...")
                        url_pdf = f"{LINK_RAW}01_CARRION/{ciclo_sel}/{pdf}".replace(" ","%20")
                        st.link_button("Abrir", url_pdf, use_container_width=True)
        else:
            st.warning("No hay archivos PDF en esta carpeta.")
    else:
        st.error("No se detectaron carpetas en 01_CARRION.")

# --- SECCIÓN: BIBLIOTECA TÉCNICA ---
elif menu == "📚 Biblioteca Técnica":
    st.title("📚 Libros de Fisioterapia y Sistemas")
    libros = [f for f in obtener_archivos(DIR_SISTEMAS) if f.endswith('.pdf')]
    
    if libros:
        c_lib = st.columns(4)
        for i, lib in enumerate(libros):
            with c_lib[i % 4]:
                with st.container(border=True):
                    # Portada genérica si no hay imagen específica
                    st.markdown("📘")
                    st.write(f"**{lib[:30]}**")
                    url_lib = f"{LINK_RAW}02_SISTEMAS/{lib}".replace(" ","%20")
                    st.link_button("Ver Libro", url_lib, use_container_width=True)
    else:
        st.warning("No se encontraron libros en la carpeta 02_SISTEMAS.")
