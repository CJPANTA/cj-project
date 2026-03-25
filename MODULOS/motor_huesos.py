import streamlit as st
import pandas as pd
import os

# --- RUTAS ---
BASE_PATH = "BASE_DATOS"
RUTA_SESIONES = os.path.join(BASE_PATH, "01_SESIONES")
RUTA_SISTEMAS = os.path.join(BASE_PATH, "02_SISTEMAS")
RUTA_PORTADAS = os.path.join(BASE_PATH, "04_PORTADAS")
CSV_MAESTRO = "huesos_maestro.csv"
LINK_RAW = "https://raw.githubusercontent.com/TuUsuario/TuRepo/main/"

def cargar_csv_seguro():
    if os.path.exists(CSV_MAESTRO):
        # Leemos con el separador real de tu archivo
        df = pd.read_csv(CSV_MAESTRO, sep=';', encoding='utf-8')
        df.columns = df.columns.str.strip() # Limpia espacios invisibles
        return df.fillna("")
    return None

def mostrar_tarjeta(archivo_pdf, carpeta_origen):
    nombre_sin_ext = archivo_pdf.replace(".pdf", "")
    ruta_img = os.path.join(RUTA_PORTADAS, f"{nombre_sin_ext}.jpg")
    
    with st.container():
        if os.path.exists(ruta_img):
            st.image(ruta_img, use_container_width=True)
        else:
            st.markdown(f"<div style='height:180px; display:flex; align-items:center; justify-content:center; background:#262730; border-radius:10px; font-size:40px;'>📚</div>", unsafe_allow_html=True)
        
        st.caption(f"**{nombre_sin_ext}**")
        url_archivo = f"{LINK_RAW}{carpeta_origen}/{archivo_pdf}".replace(" ", "%20")
        st.link_button("👁️ Abrir", url_archivo, use_container_width=True)

# --- NAVEGACIÓN ---
st.sidebar.title("PROYECTO CJ")
seccion = st.sidebar.radio("Menú:", ["Anatomía Maestro", "Biblioteca Carrión", "Biblioteca Técnica"])

if seccion == "Anatomía Maestro":
    st.title("🦴 Anatomía Maestro")
    df = cargar_csv_seguro()
    
    if df is not None:
        busqueda = st.text_input("🔍 Búsqueda Inteligente:")
        if busqueda:
            df = df[df.apply(lambda r: busqueda.lower() in r.astype(str).lower().values, axis=1)]

        for _, row in df.iterrows():
            # USANDO COLUMNAS REALES DE TU ARCHIVO:
            # ID;Region;Nombre_Hueso;Cara;Accidentes_Oseos;Musculos_Relacionados;Funcion_Bio;Articulaciones_Clave;Agente_Fisico;Referencia_Netter;Link_PDF_Carrion;Prioridad_BRI;Accion_Sugerida
            titulo = f"{row['Nombre_Hueso']} ({row['Region']})"
            with st.expander(titulo):
                c1, c2 = st.columns([2, 1])
                with c1:
                    st.write(f"**💡 Píldora BRI:** {row['Accion_Sugerida']}")
                    st.write(f"**📍 Cara/Accidente:** {row['Cara']} - {row['Accidentes_Oseos']}")
                    st.write(f"**🤝 Agente:** {row['Agente_Fisico']}")
                with c2:
                    prio = row['Prioridad_BRI']
                    if prio == "Rojo": st.error(f"PRIORIDAD: {prio}")
                    elif prio == "Verde": st.success(f"PRIORIDAD: {prio}")
                    else: st.info(f"PRIORIDAD: {prio}")
                    
                    # Link directo a la sesión de Carrión asociada
                    if row['Link_PDF_Carrion']:
                        st.caption(f"Ref: {row['Link_PDF_Carrion']}")

elif seccion == "Biblioteca Carrión":
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
                    mostrar_tarjeta(arc, f"BASE_DATOS/01_SESIONES/{ciclo_sel}")

elif seccion == "Biblioteca Técnica":
    st.title("📚 Libros de Sistemas")
    if os.path.exists(RUTA_SISTEMAS):
        libros = sorted([l for l in os.listdir(RUTA_SISTEMAS) if l.endswith('.pdf')])
        cols = st.columns(3)
        for i, lib in enumerate(libros):
            with cols[i % 3]:
                mostrar_tarjeta(lib, "BASE_DATOS/02_SISTEMAS")
