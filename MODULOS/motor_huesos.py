import streamlit as st
import pandas as pd
import os

# --- RUTAS DINÁMICAS ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(BASE_DIR, "BASE_DATOS", "03_CONFIG", "huesos_maestro.csv")
DIR_CARRION = os.path.join(BASE_DIR, "BASE_DATOS", "01_CARRION")
DIR_SISTEMAS = os.path.join(BASE_DIR, "BASE_DATOS", "02_SISTEMAS")
DIR_PORTADAS = os.path.join(BASE_DIR, "BASE_DATOS", "04_PORTADAS")

# Link RAW para GitHub (Ajusta con tu usuario/repo real)
LINK_RAW = "https://raw.githubusercontent.com/CJPANTA/cj-project/main/"

def cargar_datos_seguros():
    if os.path.exists(CSV_PATH):
        try:
            # Leemos con punto y coma y forzamos limpieza de columnas
            df = pd.read_csv(CSV_PATH, sep=';', encoding='utf-8', engine='python')
            df.columns = [c.strip() for c in df.columns] # ELIMINA ESPACIOS INVISIBLES
            return df.fillna("")
        except Exception as e:
            st.error(f"Error al leer el archivo: {e}")
    return None

def mostrar_biblioteca(ruta_carpeta, sub_ruta_git):
    if os.path.exists(ruta_carpeta):
        archivos = sorted([f for f in os.listdir(ruta_carpeta) if f.endswith('.pdf')])
        cols = st.columns(3)
        for i, arc in enumerate(archivos):
            with cols[i % 3]:
                nombre = arc.replace(".pdf", "")
                st.write(f"**{nombre}**")
                url = f"{LINK_RAW}{sub_ruta_git}/{arc}".replace(" ", "%20")
                st.link_button("👁️ Abrir", url, use_container_width=True)

def main_app():
    st.sidebar.title("PROYECTO CJ")
    seccion = st.sidebar.radio("Navegación:", ["Anatomía Maestro", "Biblioteca Carrión", "Biblioteca Técnica"])

    if seccion == "Anatomía Maestro":
        st.title("🦴 Anatomía Maestro")
        df = cargar_datos_seguros()
        
        if df is not None:
            # DEBUG: Esto te mostrará qué columnas está viendo la IA si falla
            # st.write("Columnas detectadas:", list(df.columns)) 
            
            busqueda = st.text_input("🔍 Buscar Hueso o Región:")
            if busqueda:
                df = df[df.apply(lambda r: busqueda.lower() in r.astype(str).lower().values, axis=1)]

            for _, row in df.iterrows():
                # USAMOS .get() PARA QUE NO SALGA PANTALLA ROJA SI EL NOMBRE CAMBIA
                hueso = row.get('Nombre_Hueso', 'Sin Nombre')
                region = row.get('Region', 'Sin Región')
                
                with st.expander(f"{hueso} - {region}"):
                    st.info(f"**💡 Píldora BRI:** {row.get('Accion_Sugerida', 'N/A')}")
                    st.write(f"**📍 Detalle:** {row.get('Cara', '')} - {row.get('Accidentes_Oseos', '')}")
                    st.write(f"**🤝 Terapia:** {row.get('Agente_Fisico', '')}")

    elif seccion == "Biblioteca Carrión":
        st.title("📖 Biblioteca Carrión")
        if os.path.exists(DIR_CARRION):
            ciclos = sorted([d for d in os.listdir(DIR_CARRION) if os.path.isdir(os.path.join(DIR_CARRION, d))])
            ciclo_sel = st.sidebar.selectbox("Elegir Ciclo:", ciclos)
            mostrar_biblioteca(os.path.join(DIR_CARRION, ciclo_sel), f"BASE_DATOS/01_CARRION/{ciclo_sel}")

    elif seccion == "Biblioteca Técnica":
        st.title("📚 Libros de Sistemas")
        mostrar_biblioteca(DIR_SISTEMAS, "BASE_DATOS/02_SISTEMAS")
