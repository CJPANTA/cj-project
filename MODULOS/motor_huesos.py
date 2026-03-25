import streamlit as st
import pandas as pd
import os

# --- CONFIGURACIÓN DE RUTAS ---
# Mantenemos la estructura de carpetas que confirmamos
BASE_PATH = "BASE_DATOS"
RUTA_SESIONES = f"{BASE_PATH}/01_SESIONES"
RUTA_PORTADAS = f"{BASE_PATH}/04_PORTADAS"
CSV_MAESTRO = "huesos_maestro.csv"
LINK_RAW = "https://github.com/TuUsuario/TuRepo/raw/main/" # Cambia TuUsuario/TuRepo

def listar_alfanumerico(ruta):
    """Lista directorios de forma ordenada (Ciclo 01, 02... 06)"""
    if os.path.exists(ruta):
        return sorted([d for d in os.listdir(ruta) if os.path.isdir(os.path.join(ruta, d))])
    return []

def mostrar_portada_decente(archivo_pdf, subcarpeta):
    """Muestra portadas homogéneas. Si no existe, pone un placeholder."""
    nombre_base = archivo_pdf.replace(".pdf", "")
    ruta_img = f"{RUTA_PORTADAS}/{nombre_base}.jpg"
    
    # Contenedor para mantener alineación vertical
    with st.container():
        if os.path.exists(ruta_img):
            st.image(ruta_img, use_container_width=True)
        else:
            # Cuadro gris estético si falta la imagen
            st.markdown(f"<div style='height:200px; display:flex; align-items:center; justify-content:center; background:#262730; border-radius:10px;'>📚</div>", unsafe_allow_html=True)
        
        st.caption(f"**{nombre_base}**")
        
        # Botones de acción directa al GitHub
        url_v = f"{LINK_RAW}{subcarpeta}/{archivo_pdf}".replace(" ", "%20")
        st.link_button("👁️ Ver", url_v, use_container_width=True)

# --- INTERFAZ PRINCIPAL ---
st.sidebar.title("Proyecto CJ")
seccion = st.sidebar.radio("Menú Principal:", ["Anatomía Maestro", "Biblioteca Carrión"])

if seccion == "Anatomía Maestro":
    st.title("🦴 Anatomía Maestro")
    if os.path.exists(CSV_MAESTRO):
        df = pd.read_csv(CSV_MAESTRO, sep=';')
        
        # Búsqueda abierta (detecta cualquier texto en el CSV)
        busqueda = st.text_input("🔍 Búsqueda Inteligente (Hueso, Acción o Prioridad):")
        if busqueda:
            df = df[df.apply(lambda r: busqueda.lower() in r.astype(str).lower().values, axis=1)]

        for _, row in df.iterrows():
            # Píldora BRI integrada en el expander
            label = f"{row['Nombre_Hueso']} | BRI: {row['Prioridad_BRI']}"
            with st.expander(label):
                c1, c2 = st.columns([2, 1])
                with c1:
                    st.write(f"**💡 Píldora BRI:** {row['Accion_Sugerida']}")
                    st.write(f"**📍 Ubicación:** {row['Cara']} - {row['Accidentes_Oseos']}")
                    st.write(f"**🤝 Terapia:** {row['Agente_Fisico']}")
                with c2:
                    # Indicador visual rápido
                    if row['Prioridad_BRI'] == "Rojo": st.error("URGENTE")
                    elif row['Prioridad_BRI'] == "Verde": st.success("PREVENTIVO")
                    else: st.info("ESTÁNDAR")

elif seccion == "Biblioteca Carrión":
    st.title("📖 Biblioteca Carrión")
    ciclos = listar_alfanumerico(RUTA_SESIONES)
    
    if ciclos:
        ciclo_sel = st.sidebar.selectbox("Seleccionar Ciclo:", ciclos)
        ruta_actual = f"{RUTA_SESIONES}/{ciclo_sel}"
        
        archivos = sorted([f for f in os.listdir(ruta_actual) if f.endswith('.pdf')])
        
        # 3 columnas para que las portadas se vean grandes y homogéneas
        cols = st.columns(3)
        for i, arc in enumerate(archivos):
            with cols[i % 3]:
                mostrar_portada_decente(arc, ruta_actual)
    else:
        st.warning("No se detectaron carpetas de ciclos en 01_SESIONES.")
