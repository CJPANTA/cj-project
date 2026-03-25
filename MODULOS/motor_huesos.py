import streamlit as st
import pandas as pd
import os

# --- CONFIGURACIÓN DE RUTAS ---
BASE_PATH = "BASE_DATOS"
RUTA_SESIONES = os.path.join(BASE_PATH, "01_SESIONES")
RUTA_SISTEMAS = os.path.join(BASE_PATH, "02_SISTEMAS")
RUTA_PORTADAS = os.path.join(BASE_PATH, "04_PORTADAS")
CSV_MAESTRO = "huesos_maestro.csv"
LINK_RAW = "https://raw.githubusercontent.com/TuUsuario/TuRepo/main/"

def cargar_datos_v2():
    """Carga el CSV detectando automáticamente el separador y limpiando basura"""
    if os.path.exists(CSV_MAESTRO):
        # Intentamos leer con ; que es el de tu archivo
        df = pd.read_csv(CSV_MAESTRO, sep=';', encoding='utf-8', engine='python')
        # LIMPIEZA CRÍTICA: Quitamos espacios raros de los nombres de columnas
        df.columns = [c.strip() for c in df.columns]
        return df.fillna("")
    return None

def mostrar_tarjeta(archivo_pdf, carpeta_origen):
    nombre_sin_ext = archivo_pdf.replace(".pdf", "")
    ruta_img = os.path.join(RUTA_PORTADAS, f"{nombre_sin_ext}.jpg")
    
    with st.container():
        if os.path.exists(ruta_img):
            st.image(ruta_img, use_container_width=True)
        else:
            st.markdown(f"<div style='height:160px; display:flex; align-items:center; justify-content:center; background:#333; border-radius:10px; font-size:40px;'>📚</div>", unsafe_allow_html=True)
        
        st.caption(f"**{nombre_sin_ext}**")
        url_archivo = f"{LINK_RAW}{carpeta_origen}/{archivo_pdf}".replace(" ", "%20")
        st.link_button("👁️ Abrir", url_archivo, use_container_width=True)

# --- NAVEGACIÓN ---
st.sidebar.title("PROYECTO CJ")
# Eliminamos radios por ahora para asegurar que cargue lo principal
seccion = st.sidebar.selectbox("Ir a:", ["Anatomía Maestro", "Biblioteca Carrión", "Biblioteca Técnica"])

# --- 1. ANATOMÍA MAESTRO ---
if seccion == "Anatomía Maestro":
    st.title("🦴 Anatomía Maestro")
    df = cargar_datos_v2()
    
    if df is not None:
        # Imprime las columnas en la app solo para que tú verifiques que ya las leyó
        # st.write(df.columns.tolist()) # Puedes desmarcar esto para debuggear
        
        busqueda = st.text_input("🔍 Buscador:")
        if busqueda:
            df = df[df.apply(lambda r: busqueda.lower() in r.astype(str).lower().values, axis=1)]

        for _, row in df.iterrows():
            # Usamos row.get para que si falla el nombre, no salga la pantalla roja
            hueso = row.get('Nombre_Hueso', 'Columna no encontrada')
            region = row.get('Region', '')
            prio = row.get('Prioridad_BRI', 'Blanco')
            
            with st.expander(f"{hueso} - {region} | {prio}"):
                col1, col2 = st.columns([2, 1])
                with col1:
                    st.markdown(f"**💡 BRI:** {row.get('Accion_Sugerida', 'N/A')}")
                    st.write(f"**📍 Cara:** {row.get('Cara', '')}")
                    st.write(f"**🔬 Articulación:** {row.get('Articulaciones_Clave', '')}")
                with col2:
                    if prio == "Rojo": st.error("CRÍTICO")
                    elif prio == "Verde": st.success("NORMAL")
                    else: st.info("ESTÁNDAR")

# --- 2. BIBLIOTECA CARRIÓN ---
elif seccion == "Biblioteca Carrión":
    st.title("📖 Ciclos Carrión")
    if os.path.exists(RUTA_SESIONES):
        ciclos = sorted([d for d in os.listdir(RUTA_SESIONES) if os.path.isdir(os.path.join(RUTA_SESIONES, d))])
        if ciclos:
            ciclo_sel = st.sidebar.selectbox("Ciclo:", ciclos)
            ruta_final = os.path.join(RUTA_SESIONES, ciclo_sel)
            archivos = sorted([f for f in os.listdir(ruta_final) if f.endswith('.pdf')])
            
            cols = st.columns(3)
            for i, arc in enumerate(archivos):
                with cols[i % 3]:
                    mostrar_tarjeta(arc, f"BASE_DATOS/01_SESIONES/{ciclo_sel}")
