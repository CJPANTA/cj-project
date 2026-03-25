import streamlit as st
import pandas as pd
import os

# --- CONFIGURACIÓN DE RUTAS REALES ---
# Al estar dentro de 'MODULOS', subimos un nivel para encontrar 'BASE_DATOS'
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(BASE_DIR, "BASE_DATOS", "03_CONFIG", "huesos_maestro.csv")
DIR_CARRION = os.path.join(BASE_DIR, "BASE_DATOS", "01_CARRION")
DIR_SISTEMAS = os.path.join(BASE_DIR, "BASE_DATOS", "02_SISTEMAS")
DIR_PORTADAS = os.path.join(BASE_DIR, "BASE_DATOS", "04_PORTADAS")

# URL RAW de tu GitHub (Asegúrate de que sea tu usuario/repo)
LINK_RAW = "https://raw.githubusercontent.com/CJPANTA/cj-project/main/"

def cargar_datos():
    if os.path.exists(CSV_PATH):
        try:
            # Leemos con ; y limpiamos encabezados de espacios invisibles
            df = pd.read_csv(CSV_PATH, sep=';', encoding='utf-8')
            df.columns = [c.strip() for c in df.columns]
            return df.fillna("")
        except Exception as e:
            st.error(f"Error al leer el CSV: {e}")
    return None

def mostrar_biblioteca(ruta_local, sub_ruta_git):
    if os.path.exists(ruta_local):
        archivos = sorted([f for f in os.listdir(ruta_local) if f.endswith('.pdf')])
        cols = st.columns(3)
        for i, arc in enumerate(archivos):
            with cols[i % 3]:
                nombre = arc.replace(".pdf", "")
                st.write(f"**{nombre}**")
                url_web = f"{LINK_RAW}{sub_ruta_git}/{arc}".replace(" ", "%20")
                st.link_button("👁️ Abrir", url_web, use_container_width=True)

def ejecutar_proyecto_cj():
    st.sidebar.title("PROYECTO CJ")
    menu = st.sidebar.radio("Navegación:", ["Anatomía Maestro", "Biblioteca Carrión", "Biblioteca Técnica"])

    if menu == "Anatomía Maestro":
        st.title("🦴 Anatomía Maestro")
        df = cargar_datos()
        if df is not None:
            busqueda = st.text_input("🔍 Buscar Hueso o Región:")
            if busqueda:
                # Búsqueda flexible en todo el DataFrame
                df = df[df.apply(lambda r: busqueda.lower() in r.astype(str).lower().values, axis=1)]

            for _, row in df.iterrows():
                # Uso de .get() para evitar el error de 'KeyError' si hay un typo
                hueso = row.get('Nombre_Hueso', 'N/A')
                region = row.get('Region', 'N/A')
                with st.expander(f"{hueso} - {region}"):
                    st.info(f"**Píldora BRI:** {row.get('Accion_Sugerida', 'N/A')}")
                    st.write(f"**📍 Detalle:** {row.get('Cara', '')} | {row.get('Accidentes_Oseos', '')}")
                    st.write(f"**🤝 Terapia:** {row.get('Agente_Fisico', '')}")

    elif menu == "Biblioteca Carrión":
        st.title("📖 Biblioteca Carrión")
        if os.path.exists(DIR_CARRION):
            ciclos = sorted([d for d in os.listdir(DIR_CARRION) if os.path.isdir(os.path.join(DIR_CARRION, d))])
            if ciclos:
                c_sel = st.sidebar.selectbox("Seleccionar Ciclo:", ciclos)
                mostrar_biblioteca(os.path.join(DIR_CARRION, c_sel), f"BASE_DATOS/01_CARRION/{c_sel}")

    elif menu == "Biblioteca Técnica":
        st.title("📚 Biblioteca Técnica")
        mostrar_biblioteca(DIR_SISTEMAS, "BASE_DATOS/02_SISTEMAS")
