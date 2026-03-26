import streamlit as st
import sys
import os

# --- 1. CORRECCIÓN DE RUTA (INDISPENSABLE) ---
ruta_actual = os.path.dirname(os.path.abspath(__file__))
ruta_modulos = os.path.join(ruta_actual, "MODULOS")

if ruta_modulos not in sys.path:
    sys.path.append(ruta_modulos)

# Importación segura del motor
try:
    from motor_huesos import cargar_imagen_raiz
except ImportError:
    st.error("No se pudo encontrar 'motor_huesos.py' dentro de la carpeta 'MODULOS'.")
    st.stop()

# --- 2. CONFIGURACIÓN DE PÁGINA ---
st.set_page_config(page_title="CJ PROYECTOS - Jorge Luis", layout="wide")

# --- 3. DISEÑO RESPONSIVE (CELULAR + LAPTOP) ---
st.markdown("""
    <style>
    .titulo-dorado {
        font-family: 'Playfair Display', serif;
        color: #B8860B;
        text-align: center;
        font-weight: bold;
        padding: 10px;
        line-height: 1.2;
    }
    
    /* Ajuste de tamaño de letra según pantalla */
    @media (min-width: 768px) { .titulo-dorado { font-size: 60px; } }
    @media (max-width: 767px) { .titulo-dorado { font-size: 35px; } }

    .main .block-container { padding-top: 2rem; }
    </style>
    """, unsafe_allow_html=True)

# --- 4. CARGA DE LOGOS (DESDE LA RAÍZ) ---
logo_cj = cargar_imagen_raiz("logo_cj.jpg")
logo_carrion = cargar_imagen_raiz("logo_carrion.png")

# --- 5. BARRA LATERAL (SIDEBAR) ---
with st.sidebar:
    if logo_cj:
        st.image(logo_cj, width=120)
    st.markdown("### **PROYECTO CJ**")
    st.write("Lic. Jorge Luis Chiroque")
    st.divider()
    menu = st.radio("NAVEGACIÓN", ["🏠 INICIO", "🦴 ANATOMÍA", "📖 CARRION", "📚 BIBLIOTECA"])

# --- 6. SECCIÓN: INICIO ---
if menu == "🏠 INICIO":
    st.markdown('<h1 class="titulo-dorado">PROYECTO CJ</h1>', unsafe_allow_html=True)
    
    # Imagen de Fisioterapia de Unsplash
    st.image("https://images.unsplash.com/photo-1576091160550-2173dbc999ef?q=80&w=2070", 
             caption="Excelencia en Fisioterapia y Rehabilitación", 
             use_container_width=True)
    
    st.divider()
    
    col1, col2 = st.columns([2, 1])
    with col1:
        st.subheader("Sistema de Optimización de Estudio")
        st.write("Bienvenido, Jorge Luis. Tu centro de gestión académica y clínica ahora adaptado a todos tus dispositivos.")
    with col2:
        if logo_carrion:
            st.image(logo_carrion, width=150)

else:
    # Aviso temporal para las secciones que haremos en el Paso 2
    st.info(f"La sección **{menu}** se activará en el siguiente paso de actualización.")
