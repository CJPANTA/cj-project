import streamlit as st
import pandas as pd
import os

# Configuración de rutas (Sube un nivel desde MODULOS para hallar BASE_DATOS)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(BASE_DIR, "BASE_DATOS", "03_CONFIG", "huesos_maestro.csv")
DIR_CARRION = os.path.join(BASE_DIR, "BASE_DATOS", "01_CARRION")
DIR_SISTEMAS = os.path.join(BASE_DIR, "BASE_DATOS", "02_SISTEMAS")
DIR_PORTADAS = os.path.join(BASE_DIR, "BASE_DATOS", "04_PORTADAS")

# Link RAW para GitHub
LINK_RAW = "https://raw.githubusercontent.com/CJPANTA/cj-project/main/"

def mostrar_interfaz_completa():
    st.sidebar.title("PROYECTO CJ")
    seccion = st.sidebar.radio("Ir a:", ["Anatomía Maestro", "Biblioteca Carrión", "Biblioteca Técnica"])

    if seccion == "Anatomía Maestro":
        st.title("🦴 Anatomía Maestro")
        if os.path.exists(CSV_PATH):
            df = pd.read_csv(CSV_PATH, sep=';', encoding='utf-8').fillna("")
            busqueda = st.text_input("🔍 Buscar por Hueso o Región:")
            if busqueda:
                df = df[df.apply(lambda r: busqueda.lower() in r.astype(str).lower().values, axis=1)]
            
            for _, row in df.iterrows():
                with st.expander(f"{row['Nombre_Hueso']} - {row['Region']}"):
                    st.write(f"**📍 Cara:** {row['Cara']} | **🔬 Accidente:** {row['Accidentes_Oseos']}")
                    st.info(f"**🤝 Terapia Sugerida:** {row['Agente_Fisico']}")
        else:
            st.error("No se encontró el archivo CSV en 03_CONFIG")

    elif seccion == "Biblioteca Carrión":
        st.title("📖 Biblioteca Carrión")
        if os.path.exists(DIR_CARRION):
            ciclos = [d for d in os.listdir(DIR_CARRION) if os.path.isdir(os.path.join(DIR_CARRION, d))]
            ciclo_sel = st.sidebar.selectbox("Ciclo:", sorted(ciclos))
            # ... (Lógica de visualización de PDFs)
            st.write(f"Explorando: {ciclo_sel}")

    elif seccion == "Biblioteca Técnica":
        st.title("📚 Libros de Sistemas")
        # ... (Lógica de visualización de PDFs técnicos)
