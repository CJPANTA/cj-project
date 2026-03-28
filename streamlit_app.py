import streamlit as st
import pandas as pd
import json
import random

# --- 1. CONFIGURACIÓN GENERAL ---
st.set_page_config(
    page_title="PROYECTO CJ - Tablero de Control",
    page_icon="logo_cj.jpg", # Icono de la app
    layout="wide", # Layout ancho para PC (se ajusta solo a móvil)
    initial_sidebar_state="expanded" # Sidebar abierto por defecto
)

# --- 2. CEREBRO TÉCNICO: CARGAR CSS Y JSON ---
# Leer biblioteca.json
def cargar_biblioteca():
    try:
        with open('biblioteca.json', 'r') as file:
            return json.load(file)
    except FileNotFoundError:
        st.error("Error: No se encontró el archivo 'biblioteca.json'.")
        return {}

# Cargar biblioteca al inicio
biblioteca = cargar_biblioteca()

# Leer style.css
def local_css(file_name):
    with open(file_name) as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

# Cargar CSS
local_css("style.css")

# --- 3. BARRA LATERAL (MENÚ DE NAVEGACIÓN - TABLERO DE CONTROL) ---
with st.sidebar:
    # A. Título Central (Biblioteca - Repositorio Académico)
    st.markdown("<h2 class='titulo-premium'>BIBLIOTECA - REPOSITORIO ACADÉMICO</h2>", unsafe_allow_html=True)
    
    # B. Sección de Logos (Rectangulares, Finos)
    col_logos_top1, col_logos_top2 = st.columns([1, 1])
    with col_logos_top1:
        st.markdown("<div class='marco-fino-gold'>", unsafe_allow_html=True)
        try:
            st.image("logo_cj.jpg", use_column_width=True)
        except:
            st.warning("logo_cj.jpg no encontrado")
        st.markdown("</div>", unsafe_allow_html=True)
        
    with col_logos_top2:
        st.markdown("<div class='marco-fino-gold'>", unsafe_allow_html=True)
        try:
            st.image("logo_carrion.png", use_column_width=True)
        except:
            st.warning("logo_carrion.png no encontrado")
        st.markdown("</div>", unsafe_allow_html=True)
    
    st.markdown("---") # Línea divisora
    
    # C. Botones de Navegación (Interacciones Premium hover/active)
    # Lista roja de tu dibujo: CARRION, LIBROS, DICCIONARIO.
    st.write("📖 SECCIONES PRINCIPALES")
    menu_opciones = ["HOME", "REPOSITORIO (CARRION)", "LIBROS", "DICCIONARIO"]
    
    # Simular navegación con botones y query params
    selected_option = st.selectbox("Navegar a", menu_opciones) # Streamlit necesita selectbox o radio para navegar fácilmente
    
    st.markdown("---") # Línea divisora
    
    # D. Sección Coautores Chiquita (Bottom Sidebar)
    # Línea horizontal ultrafina
    st.markdown("<div class='coautores-section'>", unsafe_allow_html=True)
    col_coautores1, col_coautores2 = st.columns([1, 1])
    with col_coautores1:
        st.markdown("<div class='marco-fino-gold'>", unsafe_allow_html=True)
        try:
            st.image("logo_cj.jpg", width=50) # Chiquito
        except:
            st.warning("logo_cj.jpg no encontrado")
        st.markdown("</div>", unsafe_allow_html=True)
        
    with col_coautores2:
        st.markdown("<div class='marco-fino-gold'>", unsafe_allow_html=True)
        try:
            st.image("logo_carrion.png", width=50) # Chiquito (usando el mismo logo de estrella para representar a Gemini, chiquito)
        except:
            st.warning("logo_carrion.png no encontrado")
        st.markdown("</div>", unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)

# --- 4. PANEL CENTRAL (ÁREA DE CONTENIDO - HOME) ---
# Simular navegación mostrando contenido diferente según la opción seleccionada
if selected_option == "HOME":
    
    # A. Título Central (Biblioteca - Repositorio Académico)
    st.markdown("<h1 class='titulo-premium'>BIBLIOTECA - REPOSITORIO ACADÉMICO</h1>", unsafe_allow_html=True)
    
    # B. Imagen Central y Frase (Look & Feel)
    col_img, col_frase = st.columns([3, 2]) # 3/5 imagen, 2/5 frase
    
    with col_img:
        st.markdown("<div class='marco-fino-gold'>", unsafe_allow_html=True)
        try:
            st.image("logo_cj.jpg", use_column_width=True) # Usando el logo de CJ como placeholder, mañana la cambiamos
        except:
            st.warning("Imagen central no encontrada")
        st.markdown("</div>", unsafe_allow_html=True)
        
    with col_frase:
        st.markdown("<div style='padding-left: 20px;'>", unsafe_allow_html=True)
        st.markdown("<p style='color: #bf953f; font-weight: bold; font-size: 20px; font-style: italic;'>&quot;LA CLAVE DEL ÉXITO ES EL ESTUDIO Y EL ESFUERZO PERSONAL&quot;</p>", unsafe_allow_html=True)
        st.markdown("</div>", unsafe_allow_html=True)
        
    # C. Personalización (¡Hola, José!)
    st.markdown("---")
    st.write(f"¡HOLA, JOSÉ! (Usuario)") # Simulación, mañana logramos el login real
    
    # D. Frase de Coautores (Firma Corregida)
    st.markdown("<p style='text-align: right; color: #d1d5db; font-size: 14px;'>Lic. Chiroque Panta, Jorge Luis (jejeje corregido 😊) - Gemini</p>", unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)

else:
    # Placeholder para las otras secciones, mañana las planificamos
    st.markdown(f"<h1 class='titulo-premium'>{selected_option}</h1>", unsafe_allow_html=True)
    st.write("Estamos en construcción. Mañana planificamos los detalles visuales de esta sección.")
