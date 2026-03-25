import streamlit as st
import sys
import os
import base64

sys.path.append(os.path.join(os.path.dirname(__file__), "MODULOS"))
from motor_huesos import cargar_csv_maestro, buscar_portada, BASE_DIR

# --- CONFIGURACIÓN ---
st.set_page_config(page_title="CJ PROYECTOS - Lic. Jorge Luis", layout="wide")

URL_LOGO = "https://raw.githubusercontent.com/CJPANTA/cj-project/main/BASE_DATOS/04_PORTADAS/LOGO_CJ.png"
LINK_RAW = "https://raw.githubusercontent.com/CJPANTA/cj-project/main/BASE_DATOS/"

def visor_pdf(url):
    """Genera un iframe para ver el PDF online dentro de la app"""
    st.markdown(f'<iframe src="{url}" width="100%" height="600px"></iframe>', unsafe_allow_html=True)

# --- SIDEBAR IDENTIDAD ---
with st.sidebar:
    st.image(URL_LOGO, width=120)
    st.title("CJ PROYECTOS")
    st.write(f"**Lic. Jorge Luis Chiroque**")
    st.divider()
    menu = st.radio("MENÚ", ["🏠 Inicio", "🦴 Anatomía", "📖 Carrión", "📚 Biblioteca"])

# --- SECCIÓN: CARRIÓN CON PESTAÑAS (TABS) ---
if menu == "📖 Carrión":
    st.title("📖 Repositorio Carrión")
    ruta_carrion = os.path.join(BASE_DIR, "BASE_DATOS", "01_CARRION")
    ciclos = sorted([d for d in os.listdir(ruta_carrion) if os.path.isdir(os.path.join(ruta_carrion, d))])
    
    if ciclos:
        tabs = st.tabs(ciclos) # AQUÍ ESTÁN LAS PESTAÑAS QUE PEDISTE
        for i, ciclo in enumerate(ciclos):
            with tabs[i]:
                ruta_ciclo = os.path.join(ruta_carrion, ciclo)
                archivos = [f for f in os.listdir(ruta_ciclo) if f.endswith('.pdf')]
                cols = st.columns(4)
                for j, arc in enumerate(archivos):
                    with cols[j % 4]:
                        with st.container(border=True):
                            img = buscar_portada(arc)
                            if img: st.image(img, use_container_width=True)
                            else: st.markdown("📄")
                            st.write(f"**{arc[:20]}**")
                            url_f = f"{LINK_RAW}01_CARRION/{ciclo}/{arc}".replace(" ","%20")
                            if st.button("Ver Online", key=f"v_{ciclo}_{j}"):
                                visor_pdf(url_f)
                            st.link_button("Descargar", url_f)

# --- SECCIÓN: BIBLIOTECA CON MINIATURAS ---
elif menu == "📚 Biblioteca":
    st.title("📚 Biblioteca Técnica")
    ruta_sistemas = os.path.join(BASE_DIR, "BASE_DATOS", "02_SISTEMAS")
    libros = [f for f in os.listdir(ruta_sistemas) if f.endswith('.pdf')]
    
    cols = st.columns(4)
    for i, lib in enumerate(libros):
        with cols[i % 4]:
            with st.container(border=True):
                img = buscar_portada(lib)
                if img: st.image(img, use_container_width=True)
                else: st.markdown("📘")
                st.write(f"**{lib[:25]}**")
                url_l = f"{LINK_RAW}02_SISTEMAS/{lib}".replace(" ","%20")
                if st.button("Leer", key=f"l_{i}"):
                    visor_pdf(url_l)
                st.link_button("Bajar", url_l)

# --- SECCIÓN: ANATOMÍA ---
elif menu == "🦴 Anatomía":
    st.title("🦴 Anatomía Maestro")
    df, err = cargar_csv_maestro()
    if not err:
        busqueda = st.text_input("🔍 Buscar...")
        # ... (Lógica de filtrado que ya funciona)
        st.dataframe(df) # Temporal para verificar datos
