import streamlit as st
import pandas as pd
import os

# --- CONFIGURACIÓN DE RUTAS ---
BASE_PATH = "BASE_DATOS"
RUTA_SESIONES = f"{BASE_PATH}/01_SESIONES"
RUTA_SISTEMAS = f"{BASE_PATH}/02_SISTEMAS"
RUTA_PORTADAS = f"{BASE_PATH}/04_PORTADAS"
CSV_MAESTRO = "huesos_maestro.csv"
# Reemplaza con tu link real de GitHub
LINK_RAW = "https://raw.githubusercontent.com/TuUsuario/TuRepo/main/" 

def listar_alfanumerico(ruta):
    if os.path.exists(ruta):
        # Filtra solo carpetas y ordena A-Z
        return sorted([d for d in os.listdir(ruta) if os.path.isdir(os.path.join(ruta, d))])
    return []

def mostrar_item(archivo_pdf, carpeta_padre):
    """Renderiza la tarjeta de libro/clase con tamaño homogéneo"""
    nombre_base = archivo_pdf.replace(".pdf", "")
    ruta_img = f"{RUTA_PORTADAS}/{nombre_base}.jpg"
    
    with st.container():
        if os.path.exists(ruta_img):
            st.image(ruta_img, use_container_width=True)
        else:
            st.markdown(f"<div style='height:180px; display:flex; align-items:center; justify-content:center; background:#262730; border-radius:10px; font-size:30px;'>📚</div>", unsafe_allow_html=True)
        
        st.caption(f"**{nombre_base}**")
        # Link directo al PDF en GitHub
        url_final = f"{LINK_RAW}{carpeta_padre}/{archivo_pdf}".replace(" ", "%20")
        st.link_button("👁️ Abrir", url_final, use_container_width=True)

# --- SIDEBAR ---
st.sidebar.title("Proyecto CJ")
seccion = st.sidebar.radio("Ir a:", ["Anatomía Maestro", "Biblioteca Carrión", "Biblioteca Técnica"])

# --- 1. ANATOMÍA MAESTRO (Buscador Corregido) ---
if seccion == "Anatomía Maestro":
    st.title("🦴 Anatomía Maestro")
    if os.path.exists(CSV_MAESTRO):
        df = pd.read_csv(CSV_MAESTRO, sep=';').fillna("") # fillna evita errores en el buscador
        busqueda = st.text_input("🔍 Buscar hueso, zona o pildora:")
        
        if busqueda:
            # Buscador corregido para evitar errores de tipo de dato
            mask = df.apply(lambda r: r.astype(str).str.contains(busqueda, case=False).any(), axis=1)
            df = df[mask]

        for _, row in df.iterrows():
            with st.expander(f"{row['Nombre_Hueso']} | {row['Prioridad_BRI']}"):
                st.write(f"**💡 BRI:** {row['Accion_Sugerida']}")
                st.write(f"**📍 Ubicación:** {row['Cara']} - {row['Accidentes_Oseos']}")
                st.write(f"**🔬 Articulación:** {row['Articulaciones_Clave']}")

# --- 2. BIBLIOTECA CARRIÓN (Conexión Corregida) ---
elif seccion == "Biblioteca Carrión":
    st.title("📖 Ciclos Carrión")
    ciclos = listar_alfanumerico(RUTA_SESIONES)
    
    if ciclos:
        ciclo_sel = st.sidebar.selectbox("Seleccionar Ciclo:", ciclos)
        ruta_clases = f"{RUTA_SESIONES}/{ciclo_sel}"
        
        # Leemos y ordenamos los archivos de la carpeta del ciclo
        archivos = sorted([f for f in os.listdir(ruta_clases) if f.endswith('.pdf')])
        
        if archivos:
            cols = st.columns(3)
            for i, arc in enumerate(archivos):
                with cols[i % 3]:
                    mostrar_item(arc, ruta_clases)
        else:
            st.info("No hay PDFs en esta carpeta aún.")

# --- 3. BIBLIOTECA TÉCNICA (Orden Corregido) ---
elif seccion == "Biblioteca Técnica":
    st.title("📚 Libros de Sistemas")
    filtro = st.text_input("🔍 Buscar libro:")
    
    if os.path.exists(RUTA_SISTEMAS):
        # Orden alfanumérico estricto
        libros = sorted([l for l in os.listdir(RUTA_SISTEMAS) if l.endswith('.pdf')])
        if filtro:
            libros = [l for l in libros if filtro.lower() in l.lower()]
            
        cols = st.columns(3)
        for i, lib in enumerate(libros):
            with cols[i % 3]:
                mostrar_item(lib, RUTA_SISTEMAS)
