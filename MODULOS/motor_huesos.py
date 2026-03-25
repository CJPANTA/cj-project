import streamlit as st
import pandas as pd
import os

# --- CONFIGURACIÓN DE RUTAS ---
BASE_PATH = \"BASE_DATOS\"
RUTA_SESIONES = os.path.join(BASE_PATH, \"01_SESIONES\")
RUTA_SISTEMAS = os.path.join(BASE_PATH, \"02_SISTEMAS\")
RUTA_PORTADAS = os.path.join(BASE_PATH, \"04_PORTADAS\")
CSV_MAESTRO = \"huesos_maestro.csv\"

# URL RAW DE GITHUB (Asegúrate de que termine en /)
LINK_RAW = \"https://raw.githubusercontent.com/TuUsuario/TuRepo/main/\" 

def cargar_datos_blindado():
    \"\"\"Carga el CSV y limpia cualquier error de formato o espacios en las columnas\"\"\"
    if os.path.exists(CSV_MAESTRO):
        try:
            # Forzamos separador ; y limpieza de espacios en los nombres de columnas
            df = pd.read_csv(CSV_MAESTRO, sep=';', encoding='utf-8')
            df.columns = [str(c).strip() for c in df.columns]
            return df.fillna(\"\")
        except Exception as e:
            st.error(f\"Error técnico al leer el CSV: {e}\")
    return None

def mostrar_tarjeta(archivo_pdf, carpeta_repo):
    \"\"\"Renderiza portadas en 3 columnas homogéneas\"\"\"
    nombre_base = archivo_pdf.replace(\".pdf\", \"\")
    ruta_img = os.path.join(RUTA_PORTADAS, f\"{nombre_base}.jpg\")
    
    with st.container():
        if os.path.exists(ruta_img):
            st.image(ruta_img, use_container_width=True)
        else:
            st.markdown(f\"<div style='height:180px; display:flex; align-items:center; justify-content:center; background:#262730; border-radius:10px; font-size:40px;'>📚</div>\", unsafe_allow_html=True)
        
        st.caption(f\"**{nombre_base}**\")
        url_archivo = f\"{LINK_RAW}{carpeta_repo}/{archivo_pdf}\".replace(\" \", \"%20\")
        st.link_button(\"👁️ Abrir\", url_archivo, use_container_width=True)

# --- INTERFAZ ---
st.sidebar.title(\"PROYECTO CJ\")
menu = [\"Anatomía Maestro\", \"Biblioteca Carrión\", \"Biblioteca Técnica\"]
seleccion = st.sidebar.selectbox(\"Seleccione Sección:\", menu)

# --- 1. ANATOMÍA MAESTRO ---
if seleccion == \"Anatomía Maestro\":
    st.title(\"🦴 Anatomía Maestro\")
    df = cargar_datos_blindado()
    
    if df is not None:
        busqueda = st.text_input(\"🔍 Buscador Inteligente (Hueso, Región o Píldora):\")
        
        # Filtrado dinámico
        if busqueda:
            mask = df.apply(lambda r: r.astype(str).str.contains(busqueda, case=False).any(), axis=1)
            df = df[mask]

        # Iteración segura
        for _, row in df.iterrows():
            # Verificamos si la columna existe antes de usarla para evitar el KeyError
            hueso = row['Nombre_Hueso'] if 'Nombre_Hueso' in df.columns else \"Desconocido\"
            region = row['Region'] if 'Region' in df.columns else \"\"
            prio = row['Prioridad_BRI'] if 'Prioridad_BRI' in df.columns else \"Blanco\"
            
            with st.expander(f\"{hueso} - {region} | {prio}\"):
                col1, col2 = st.columns([2, 1])
                with col1:
                    if 'Accion_Sugerida' in df.columns:
                        st.info(f\"**💡 Píldora BRI:** {row['Accion_Sugerida']}\")
                    st.write(f\"**📍 Cara:** {row.get('Cara', '')}\")
                    st.write(f\"**🔬 Accidente:** {row.get('Accidentes_Oseos', '')}\")
                with col2:
                    if prio == \"Rojo\": st.error(\"CRÍTICO\")
                    elif prio == \"Verde\": st.success(\"ESTABLE\")
                    else: st.warning(\"REVISAR\")

# --- 2. BIBLIOTECA CARRIÓN (ORDEN ALFANUMÉRICO) ---
elif seleccion == \"Biblioteca Carrión\":
    st.title(\"📖 Ciclos Carrión\")
    if os.path.exists(RUTA_SESIONES):
        ciclos = sorted([d for d in os.listdir(RUTA_SESIONES) if os.path.isdir(os.path.join(RUTA_SESIONES, d))])
        if ciclos:
            ciclo_sel = st.sidebar.selectbox(\"Elegir Ciclo:\", ciclos)
            ruta_final = os.path.join(RUTA_SESIONES, ciclo_sel)
            archivos = sorted([f for f in os.listdir(ruta_final) if f.endswith('.pdf')])
            
            if archivos:
                cols = st.columns(3)
                for i, arc in enumerate(archivos):
                    with cols[i % 3]:
                        mostrar_tarjeta(arc, f\"BASE_DATOS/01_SESIONES/{ciclo_sel}\")

# --- 3. BIBLIOTECA TÉCNICA ---
elif seleccion == \"Biblioteca Técnica\":
    st.title(\"📚 Libros de Sistemas\")
    if os.path.exists(RUTA_SISTEMAS):
        libros = sorted([l for l in os.listdir(RUTA_SISTEMAS) if l.endswith('.pdf')])
        cols = st.columns(3)
        for i, lib in enumerate(libros):
            with cols[i % 3]:
                mostrar_tarjeta(lib, \"BASE_DATOS/02_SISTEMAS\")
