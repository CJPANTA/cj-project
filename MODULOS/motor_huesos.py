import streamlit as st
import pandas as pd
import os

# --- LÓGICA DE RUTAS INTELIGENTE ---
# Obtenemos la ruta de la carpeta donde está este script (ej. /Codigos/)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Construimos las rutas desde la raíz del proyecto
CSV_RUTA = os.path.join(BASE_DIR, "BASE_DATOS", "03_CONFIG", "huesos_maestro.csv")
CARPETA_CARRION = os.path.join(BASE_DIR, "BASE_DATOS", "01_CARRION")
CARPETA_PORTADAS = os.path.join(BASE_DIR, "BASE_DATOS", "04_PORTADAS")

# URL para GitHub (Asegúrate de que apunte a la raíz de tu repo)
LINK_RAW = "https://raw.githubusercontent.com/TuUsuario/TuRepo/main/"

def cargar_datos():
    if os.path.exists(CSV_RUTA):
        try:
            df = pd.read_csv(CSV_RUTA, sep=';', encoding='utf-8')
            df.columns = [c.strip() for c in df.columns]
            return df.fillna("")
        except Exception as e:
            st.error(f"Error al leer CSV: {e}")
    return None

st.sidebar.title("PROYECTO CJ")
menu = st.sidebar.radio("Navegación", ["Anatomía Maestro", "Biblioteca Carrión"])

# --- 1. ANATOMÍA MAESTRO ---
if menu == "Anatomía Maestro":
    st.title("🦴 Anatomía Maestro")
    df = cargar_datos()
    
    if df is not None:
        busqueda = st.text_input("🔍 Filtrar por Hueso o Región:")
        if busqueda:
            df = df[df.apply(lambda r: busqueda.lower() in r.astype(str).lower().values, axis=1)]

        for _, row in df.iterrows():
            # RESPETANDO TUS ENCABEZADOS ESTÁNDAR
            with st.expander(f"{row['Nombre_Hueso']} - {row['Region']} | {row['Prioridad_BRI']}"):
                c1, c2 = st.columns([2, 1])
                with c1:
                    st.info(f"**💡 Píldora BRI:** {row['Accion_Sugerida']}")
                    st.write(f"**📍 Cara:** {row['Cara']}")
                    st.write(f"**🔬 Accidentes:** {row['Accidentes_Oseos']}")
                with c2:
                    prio = row['Prioridad_BRI']
                    if prio == "Rojo": st.error("CRÍTICO")
                    elif prio == "Verde": st.success("ESTABLE")
                    
                    # Link al PDF de Carrión usando la ruta 01_CARRION
                    if row['Link_PDF_Carrion']:
                        url = f"{LINK_RAW}BASE_DATOS/01_CARRION/{row['Link_PDF_Carrion']}".replace(" ","%20")
                        st.link_button("📂 Ver PDF", url)

# --- 2. BIBLIOTECA CARRIÓN ---
elif menu == "Biblioteca Carrión":
    st.title("📖 Biblioteca Carrión")
    if os.path.exists(CARPETA_CARRION):
        ciclos = sorted([d for d in os.listdir(CARPETA_CARRION) if os.path.isdir(os.path.join(CARPETA_CARRION, d))])
        if ciclos:
            sel = st.sidebar.selectbox("Ciclo:", ciclos)
            ruta_ciclo = os.path.join(CARPETA_CARRION, sel)
            archivos = sorted([f for f in os.listdir(ruta_ciclo) if f.endswith('.pdf')])
            
            cols = st.columns(3)
            for i, arc in enumerate(archivos):
                with cols[i % 3]:
                    # Portada con tamaño decente
                    nombre_img = arc.replace(".pdf", ".jpg")
                    ruta_img_full = os.path.join(CARPETA_PORTADAS, nombre_img)
                    
                    if os.path.exists(ruta_img_full):
                        st.image(ruta_img_full, use_container_width=True)
                    else:
                        st.markdown("<div style='height:150px; background:#333; border-radius:10px; display:flex; align-items:center; justify-content:center;'>📚</div>", unsafe_allow_html=True)
                    
                    st.caption(arc)
                    url_f = f"{LINK_RAW}BASE_DATOS/01_CARRION/{sel}/{arc}".replace(" ","%20")
                    st.link_button("Abrir", url_f)
    else:
        st.error(f"No se encontró la carpeta en: {CARPETA_CARRION}")
