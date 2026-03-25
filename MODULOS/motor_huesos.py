import streamlit as st
import pandas as pd
import os

# --- RUTAS BASADAS EN TU ESTRUCTURA REAL ---
# Si motor_huesos.py está en la carpeta 'Codigos', subimos un nivel para ir a BASE_DATOS
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_MAESTRO = os.path.join(BASE_DIR, "BASE_DATOS", "03_CONFIG", "huesos_maestro.csv")
RUTA_CARRION = os.path.join(BASE_DIR, "BASE_DATOS", "01_CARRION")
RUTA_SISTEMAS = os.path.join(BASE_DIR, "BASE_DATOS", "02_SISTEMAS")
RUTA_PORTADAS = os.path.join(BASE_DIR, "BASE_DATOS", "04_PORTADAS")

# Link de GitHub (Asegúrate de que apunte a la raíz de tu repositorio)
LINK_RAW = "https://raw.githubusercontent.com/TuUsuario/TuRepo/main/"

def cargar_csv():
    if os.path.exists(CSV_MAESTRO):
        try:
            df = pd.read_csv(CSV_MAESTRO, sep=';', encoding='utf-8')
            df.columns = [c.strip() for c in df.columns]
            return df.fillna("")
        except Exception as e:
            st.error(f"Error al leer el CSV: {e}")
    return None

def mostrar_portada(archivo_pdf, carpeta_git):
    """Renderiza portadas en 3 columnas como teníamos antes"""
    nombre_base = archivo_pdf.replace(".pdf", "")
    ruta_img_local = os.path.join(RUTA_PORTADAS, f"{nombre_base}.jpg")
    
    with st.container():
        if os.path.exists(ruta_img_local):
            st.image(ruta_img_local, use_container_width=True)
        else:
            st.markdown(f"<div style='height:160px; display:flex; align-items:center; justify-content:center; background:#262730; border-radius:10px; font-size:40px;'>📚</div>", unsafe_allow_html=True)
        
        st.write(f"**{nombre_base}**")
        url_archivo = f"{LINK_RAW}{carpeta_git}/{archivo_pdf}".replace(" ", "%20")
        st.link_button("👁️ Abrir", url_archivo, use_container_width=True)

# --- NAVEGACIÓN ---
st.set_page_config(page_title="Proyecto CJ", layout="wide")
st.sidebar.title("PROYECTO CJ")
opcion = st.sidebar.radio("Sección:", ["Anatomía Maestro", "Biblioteca Carrión", "Biblioteca Técnica"])

# --- 1. ANATOMÍA MAESTRO (CON PROTOCOLO DE FISIO) ---
if opcion == "Anatomía Maestro":
    st.title("🦴 Anatomía Maestro")
    df = cargar_csv()
    if df is not None:
        busqueda = st.text_input("🔍 Buscar por Hueso, Región o Píldora BRI:")
        if busqueda:
            mask = df.apply(lambda r: busqueda.lower() in r.astype(str).lower().values, axis=1)
            df = df[mask]

        for _, row in df.iterrows():
            with st.expander(f"{row['Nombre_Hueso']} - {row['Region']} | {row['Prioridad_BRI']}"):
                col1, col2 = st.columns([2, 1])
                with col1:
                    st.info(f"**💡 Píldora BRI:** {row['Accion_Sugerida']}")
                    st.write(f"**📍 Cara / Accidente:** {row['Cara']} - {row['Accidentes_Oseos']}")
                    st.write(f"**🔬 Articulación:** {row['Articulaciones_Clave']}")
                    st.write(f"**🤝 Terapia Sugerida:** {row['Agente_Fisico']}")
                with col2:
                    prio = row['Prioridad_BRI']
                    if prio == "Rojo": st.error("CRÍTICO")
                    elif prio == "Verde": st.success("NORMAL")
                    
                    if row['Link_PDF_Carrion']:
                        url_pdf = f"{LINK_RAW}BASE_DATOS/01_CARRION/{row['Link_PDF_Carrion']}".replace(" ","%20")
                        st.link_button("📄 Ver Clase", url_pdf, use_container_width=True)

# --- 2. BIBLIOTECA CARRIÓN (ORGANIZADO POR CICLOS) ---
elif opcion == "Biblioteca Carrión":
    st.title("📖 Biblioteca Carrión")
    if os.path.exists(RUTA_CARRION):
        ciclos = sorted([d for d in os.listdir(RUTA_CARRION) if os.path.isdir(os.path.join(RUTA_CARRION, d))])
        if ciclos:
            ciclo_sel = st.sidebar.selectbox("Seleccionar Ciclo:", ciclos)
            ruta_ciclo = os.path.join(RUTA_CARRION, ciclo_sel)
            archivos = sorted([f for f in os.listdir(ruta_ciclo) if f.endswith('.pdf')])
            
            cols = st.columns(3)
            for i, arc in enumerate(archivos):
                with cols[i % 3]:
                    mostrar_portada(arc, f"BASE_DATOS/01_CARRION/{ciclo_sel}")

# --- 3. BIBLIOTECA TÉCNICA (SISTEMAS) ---
elif opcion == "Biblioteca Técnica":
    st.title("📚 Libros de Sistemas")
    if os.path.exists(RUTA_SISTEMAS):
        libros = sorted([l for l in os.listdir(RUTA_SISTEMAS) if l.endswith('.pdf')])
        cols = st.columns(3)
        for i, lib in enumerate(libros):
            with cols[i % 3]:
                mostrar_portada(lib, "BASE_DATOS/02_SISTEMAS")
