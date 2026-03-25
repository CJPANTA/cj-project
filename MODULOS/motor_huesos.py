import streamlit as st
import pandas as pd
import os

# --- RUTAS BASADAS EN TU ESTRUCTURA ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(BASE_DIR, "BASE_DATOS", "03_CONFIG", "huesos_maestro.csv")
DIR_CARRION = os.path.join(BASE_DIR, "BASE_DATOS", "01_CARRION")
DIR_SISTEMAS = os.path.join(BASE_DIR, "BASE_DATOS", "02_SISTEMAS")
DIR_PORTADAS = os.path.join(BASE_DIR, "BASE_DATOS", "04_PORTADAS")

LINK_RAW = "https://raw.githubusercontent.com/CJPANTA/cj-project/main/"

def cargar_datos():
    if os.path.exists(CSV_PATH):
        df = pd.read_csv(CSV_PATH, sep=';', encoding='utf-8').fillna("")
        df.columns = [c.strip() for c in df.columns]
        return df
    return None

def main_app():
    st.sidebar.title("PROYECTO CJ")
    seccion = st.sidebar.radio("Navegación:", ["Anatomía Maestro", "Biblioteca Carrión", "Biblioteca Técnica"])

    if seccion == "Anatomía Maestro":
        st.title("🦴 Anatomía Maestro")
        df = cargar_datos()
        if df is not None:
            busqueda = st.text_input("🔍 Buscar:")
            if busqueda:
                df = df[df.apply(lambda r: busqueda.lower() in r.astype(str).lower().values, axis=1)]
            for _, row in df.iterrows():
                with st.expander(f"{row['Nombre_Hueso']} - {row['Region']}"):
                    st.info(f"**Píldora BRI:** {row['Accion_Sugerida']}")
                    st.write(f"**Terapia:** {row['Agente_Fisico']}")
        else:
            st.error(f"No se encontró el CSV en: {CSV_PATH}")

    elif seccion == "Biblioteca Carrión":
        st.title("📖 Biblioteca Carrión")
        if os.path.exists(DIR_CARRION):
            ciclos = sorted([d for d in os.listdir(DIR_CARRION) if os.path.isdir(os.path.join(DIR_CARRION, d))])
            if ciclos:
                c_sel = st.sidebar.selectbox("Ciclo:", ciclos)
                st.write(f"Mostrando archivos de {c_sel}...")
                # Aquí va la lógica de tarjetas que ya teníamos
    
    elif seccion == "Biblioteca Técnica":
        st.title("📚 Biblioteca Técnica")
        if os.path.exists(DIR_SISTEMAS):
            libros = sorted([f for f in os.listdir(DIR_SISTEMAS) if f.endswith('.pdf')])
            st.write(f"Libros disponibles: {len(libros)}")
