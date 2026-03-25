import streamlit as st
import pandas as pd
import os

# --- MAPEO REAL DE TU ESTRUCTURA ---
# motor_huesos.py vive en la raíz
CSV_RUTA = "BASE_DATOS/03_CONFIG/huesos_maestro.csv"
CARPETA_CARRION = "BASE_DATOS/01_CARRION"
CARPETA_SISTEMAS = "BASE_DATOS/02_SISTEMAS"
CARPETA_PORTADAS = "BASE_DATOS/04_PORTADAS"

# Configuración de URL para visualización (Ajusta con tu usuario/repo)
LINK_RAW = "https://raw.githubusercontent.com/TuUsuario/TuRepo/main/"

def cargar_base_datos():
    """Carga el CSV desde 03_CONFIG con tus encabezados estándar"""
    if os.path.exists(CSV_RUTA):
        try:
            df = pd.read_csv(CSV_RUTA, sep=';', encoding='utf-8')
            df.columns = [c.strip() for c in df.columns]
            return df.fillna("")
        except Exception as e:
            st.error(f"Error al leer el CSV: {e}")
    return None

def mostrar_item_biblioteca(archivo_pdf, ruta_carpeta):
    """Muestra portadas y botones de apertura"""
    nombre_base = archivo_pdf.replace(".pdf", "")
    ruta_img = f"{CARPETA_PORTADAS}/{nombre_base}.jpg"
    
    with st.container():
        if os.path.exists(ruta_img):
            st.image(ruta_img, use_container_width=True)
        else:
            st.markdown(f"<div style='height:180px; display:flex; align-items:center; justify-content:center; background:#262730; border-radius:10px; font-size:40px;'>📚</div>", unsafe_allow_html=True)
        
        st.caption(f"**{nombre_base}**")
        url_web = f"{LINK_RAW}{ruta_carpeta}/{archivo_pdf}".replace(" ", "%20")
        st.link_button("👁️ Abrir PDF", url_web, use_container_width=True)

# --- NAVEGACIÓN PRINCIPAL ---
st.sidebar.title("PROYECTO CJ")
seccion = st.sidebar.radio("Sección:", ["Anatomía Maestro", "Biblioteca Carrión", "Biblioteca Técnica"])

# 1. ANATOMÍA MAESTRO (Usando el CSV en 03_CONFIG)
if seccion == "Anatomía Maestro":
    st.title("🦴 Anatomía Maestro")
    df = cargar_base_datos()
    
    if df is not None:
        busqueda = st.text_input("🔍 Buscar (Hueso, Región, Acción):")
        if busqueda:
            df = df[df.apply(lambda r: busqueda.lower() in r.astype(str).lower().values, axis=1)]

        for _, row in df.iterrows():
            # Encabezados originales: ID;Region;Nombre_Hueso;Cara;Accidentes_Oseos...
            with st.expander(f"{row['Nombre_Hueso']} - {row['Region']} | {row['Prioridad_BRI']}"):
                c1, c2 = st.columns([2, 1])
                with c1:
                    st.info(f"**💡 Píldora BRI:** {row['Accion_Sugerida']}")
                    st.write(f"**📍 Cara:** {row['Cara']}")
                    st.write(f"**🔬 Accidente:** {row['Accidentes_Oseos']}")
                    st.write(f"**🤝 Agente:** {row['Agente_Fisico']}")
                with c2:
                    prio = row['Prioridad_BRI']
                    if prio == "Rojo": st.error("CRÍTICO")
                    elif prio == "Verde": st.success("NORMAL")
                    else: st.warning("REVISAR")

# 2. BIBLIOTECA CARRIÓN (Ubicación: 01_CARRION)
elif seccion == "Biblioteca Carrión":
    st.title("📖 Biblioteca Carrión")
    if os.path.exists(CARPETA_CARRION):
        # Orden alfanumérico de subcarpetas (Ciclo 01, 02...)
        ciclos = sorted([d for d in os.listdir(CARPETA_CARRION) if os.path.isdir(os.path.join(CARPETA_CARRION, d))])
        if ciclos:
            ciclo_sel = st.sidebar.selectbox("Seleccionar Ciclo:", ciclos)
            ruta_final = f"{CARPETA_CARRION}/{ciclo_sel}"
            archivos = sorted([f for f in os.listdir(ruta_final) if f.endswith('.pdf')])
            
            cols = st.columns(3)
            for i, arc in enumerate(archivos):
                with cols[i % 3]:
                    mostrar_item_biblioteca(arc, ruta_final)
    else:
        st.error(f"No se detecta la carpeta: {CARPETA_CARRION}")

# 3. BIBLIOTECA TÉCNICA (02_SISTEMAS)
elif seccion == "Biblioteca Técnica":
    st.title("📚 Biblioteca Técnica")
    if os.path.exists(CARPETA_SISTEMAS):
        libros = sorted([l for l in os.listdir(CARPETA_SISTEMAS) if l.endswith('.pdf')])
        cols = st.columns(3)
        for i, lib in enumerate(libros):
            with cols[i % 3]:
                mostrar_item_biblioteca(lib, CARPETA_SISTEMAS)
