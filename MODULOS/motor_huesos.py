import streamlit as st
import pandas as pd
import os

# --- LÓGICA DE RUTAS (Sube un nivel desde /Codigos/ para hallar /BASE_DATOS/) ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(BASE_DIR, "BASE_DATOS", "03_CONFIG", "huesos_maestro.csv")
DIR_CARRION = os.path.join(BASE_DIR, "BASE_DATOS", "01_CARRION")
DIR_SISTEMAS = os.path.join(BASE_DIR, "BASE_DATOS", "02_SISTEMAS")
DIR_PORTADAS = os.path.join(BASE_DIR, "BASE_DATOS", "04_PORTADAS")

# Link RAW para GitHub (Ajustar a tu repositorio)
LINK_RAW = "https://raw.githubusercontent.com/TuUsuario/TuRepo/main/"

def cargar_csv():
    if os.path.exists(CSV_PATH):
        try:
            df = pd.read_csv(CSV_PATH, sep=';', encoding='utf-8')
            df.columns = [c.strip() for c in df.columns]
            return df.fillna("")
        except Exception as e:
            st.error(f"Error al leer CSV: {e}")
    return None

def render_tarjeta(pdf_name, folder_path_git):
    """Muestra la portada y botones de Ver/Bajar en 3 columnas"""
    nombre_base = pdf_name.replace(".pdf", "")
    img_local = os.path.join(DIR_PORTADAS, f"{nombre_base}.jpg")
    
    with st.container():
        if os.path.exists(img_local):
            st.image(img_local, use_container_width=True)
        else:
            st.markdown(f"<div style='height:160px; display:flex; align-items:center; justify-content:center; background:#262730; border-radius:10px; font-size:40px;'>📚</div>", unsafe_allow_html=True)
        
        st.write(f"**{nombre_base}**")
        url_file = f"{LINK_RAW}{folder_path_git}/{pdf_name}".replace(" ", "%20")
        
        c_v, c_d = st.columns(2)
        c_v.link_button("👁️ Ver", url_file, use_container_width=True)
        c_d.link_button("📥 Bajar", url_file, use_container_width=True)

# --- INTERFAZ PRINCIPAL ---
st.set_page_config(page_title="Proyecto CJ", layout="wide")
st.sidebar.title("PROYECTO CJ")
seccion = st.sidebar.radio("Menú:", ["Anatomía Maestro", "Biblioteca Carrión", "Biblioteca Técnica"])

# 1. ANATOMÍA MAESTRO (Data + Fisioterapia)
if seccion == "Anatomía Maestro":
    st.title("🦴 Anatomía Maestro")
    df = cargar_csv()
    if df is not None:
        busqueda = st.text_input("🔍 Buscar (Hueso, Región, Píldora):")
        if busqueda:
            mask = df.apply(lambda r: busqueda.lower() in r.astype(str).lower().values, axis=1)
            df = df[mask]

        for _, row in df.iterrows():
            with st.expander(f"{row['Nombre_Hueso']} - {row['Region']} | BRI: {row['Prioridad_BRI']}"):
                col_a, col_b = st.columns([2, 1])
                with col_a:
                    st.info(f"**💡 Píldora BRI:** {row['Accion_Sugerida']}")
                    st.write(f"**📍 Cara:** {row['Cara']} | **🔬 Accidente:** {row['Accidentes_Oseos']}")
                    st.write(f"**🤝 Terapia:** {row['Agente_Fisico']}")
                    st.write(f"**⚙️ Función:** {row['Funcion_Bio']}")
                with col_b:
                    if row['Prioridad_BRI'] == "Rojo": st.error("CRÍTICO")
                    elif row['Prioridad_BRI'] == "Verde": st.success("ESTABLE")
                    
                    if row['Link_PDF_Carrion']:
                        url_clase = f"{LINK_RAW}BASE_DATOS/01_CARRION/{row['Link_PDF_Carrion']}".replace(" ","%20")
                        st.link_button("📄 Clase Carrión", url_clase, use_container_width=True)

# 2. BIBLIOTECA CARRION (Ciclos Dinámicos)
elif seccion == "Biblioteca Carrión":
    st.title("📖 Ciclos Carrión")
    if os.path.exists(DIR_CARRION):
        ciclos = sorted([d for d in os.listdir(DIR_CARRION) if os.path.isdir(os.path.join(DIR_CARRION, d))])
        if ciclos:
            ciclo_sel = st.sidebar.selectbox("Elegir Ciclo:", ciclos)
            ruta_final = os.path.join(DIR_CARRION, ciclo_sel)
            archivos = sorted([f for f in os.listdir(ruta_final) if f.endswith('.pdf')])
            
            grid = st.columns(3)
            for i, arc in enumerate(archivos):
                with grid[i % 3]:
                    render_tarjeta(arc, f"BASE_DATOS/01_CARRION/{ciclo_sel}")

# 3. BIBLIOTECA TÉCNICA
elif seccion == "Biblioteca Técnica":
    st.title("📚 Libros de Sistemas")
    if os.path.exists(DIR_SISTEMAS):
        libros = sorted([l for l in os.listdir(DIR_SISTEMAS) if l.endswith('.pdf')])
        grid = st.columns(3)
        for i, lib in enumerate(libros):
            with grid[i % 3]:
                render_tarjeta(lib, "BASE_DATOS/02_SISTEMAS")
