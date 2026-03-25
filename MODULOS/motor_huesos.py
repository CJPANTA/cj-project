import streamlit as st
import pandas as pd
import os

# --- CONFIGURACIÓN DE RUTAS ---
BASE_PATH = "BASE_DATOS"
RUTA_SESIONES = os.path.join(BASE_PATH, "01_SESIONES")
RUTA_SISTEMAS = os.path.join(BASE_PATH, "02_SISTEMAS")
RUTA_PORTADAS = os.path.join(BASE_PATH, "04_PORTADAS")
CSV_MAESTRO = "huesos_maestro.csv"
# Ajusta con tu link real de GitHub
LINK_RAW = "https://raw.githubusercontent.com/TuUsuario/TuRepo/main/" 

def cargar_datos_estandar():
    """Carga el CSV respetando los encabezados originales del usuario"""
    if os.path.exists(CSV_MAESTRO):
        # Forzamos el separador ; y la limpieza de espacios invisibles
        df = pd.read_csv(CSV_MAESTRO, sep=';', encoding='utf-8')
        df.columns = [c.strip() for c in df.columns]
        return df.fillna("")
    return None

def mostrar_tarjeta_maestra(archivo_pdf, carpeta_origen):
    """Visualización homogénea de portadas"""
    nombre_base = archivo_pdf.replace(".pdf", "")
    ruta_img = os.path.join(RUTA_PORTADAS, f"{nombre_base}.jpg")
    
    with st.container():
        if os.path.exists(ruta_img):
            st.image(ruta_img, use_container_width=True)
        else:
            st.markdown(f"<div style='height:180px; display:flex; align-items:center; justify-content:center; background:#262730; border-radius:10px; font-size:40px;'>📚</div>", unsafe_allow_html=True)
        
        st.caption(f"**{nombre_base}**")
        url_archivo = f"{LINK_RAW}{carpeta_origen}/{archivo_pdf}".replace(" ", "%20")
        st.link_button("👁️ Ver", url_archivo, use_container_width=True)

# --- NAVEGACIÓN ---
st.sidebar.title("PROYECTO CJ")
opciones = ["Anatomía Maestro", "Biblioteca Carrión", "Biblioteca Técnica"]
seleccion = st.sidebar.selectbox("Ir a:", opciones)

# --- 1. SECCIÓN ANATOMÍA (Encabezados Originales) ---
if seleccion == "Anatomía Maestro":
    st.title("🦴 Anatomía Maestro")
    df = cargar_datos_estandar()
    
    if df is not None:
        busqueda = st.text_input("🔍 Búsqueda Inteligente:")
        if busqueda:
            df = df[df.apply(lambda r: busqueda.lower() in r.astype(str).lower().values, axis=1)]

        for _, row in df.iterrows():
            # USANDO TUS ENCABEZADOS ESTÁNDAR:
            titulo = f"{row['Nombre_Hueso']} - {row['Region']}"
            prio = row['Prioridad_BRI']
            
            with st.expander(f"{titulo} | {prio}"):
                c1, c2 = st.columns([2, 1])
                with c1:
                    st.info(f"**💡 Píldora BRI:** {row['Accion_Sugerida']}")
                    st.write(f"**📍 Cara / Accidentes:** {row['Cara']} - {row['Accidentes_Oseos']}")
                    st.write(f"**🔬 Articulación:** {row['Articulaciones_Clave']}")
                    st.write(f"**🤝 Terapia:** {row['Agente_Fisico']}")
                with c2:
                    if prio == "Rojo": st.error("CRÍTICO")
                    elif prio == "Verde": st.success("NORMAL")
                    else: st.warning("REVISAR")
                    
                    # Link dinámico si existe el PDF de la clase
                    if row['Link_PDF_Carrion']:
                        st.caption(f"Ref: {row['Link_PDF_Carrion']}")

# --- 2. SECCIÓN CARRIÓN (Detección Automática) ---
elif seleccion == "Biblioteca Carrión":
    st.title("📖 Ciclos Carrión")
    if os.path.exists(RUTA_SESIONES):
        ciclos = sorted([d for d in os.listdir(RUTA_SESIONES) if os.path.isdir(os.path.join(RUTA_SESIONES, d))])
        if ciclos:
            ciclo_sel = st.sidebar.selectbox("Seleccionar Ciclo:", ciclos)
            ruta_final = os.path.join(RUTA_SESIONES, ciclo_sel)
            archivos = sorted([f for f in os.listdir(ruta_final) if f.endswith('.pdf')])
            
            cols = st.columns(3)
            for i, arc in enumerate(archivos):
                with cols[i % 3]:
                    mostrar_tarjeta_maestra(arc, f"BASE_DATOS/01_SESIONES/{ciclo_sel}")

# --- 3. BIBLIOTECA TÉCNICA ---
elif seleccion == "Biblioteca Técnica":
    st.title("📚 Libros de Sistemas")
    if os.path.exists(RUTA_SISTEMAS):
        libros = sorted([l for l in os.listdir(RUTA_SISTEMAS) if l.endswith('.pdf')])
        cols = st.columns(3)
        for i, lib in enumerate(libros):
            with cols[i % 3]:
                mostrar_tarjeta_maestra(lib, "BASE_DATOS/02_SISTEMAS")
