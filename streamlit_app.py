import streamlit as st
import sys
import os

# --- 1. CONFIGURACIÓN DE RUTAS ---
ruta_actual = os.path.dirname(os.path.abspath(__file__))
ruta_modulos = os.path.join(ruta_actual, "MODULOS")

if ruta_modulos not in sys.path:
    sys.path.append(ruta_modulos)

# Importación protegida
try:
    from motor_huesos import cargar_imagen_raiz
except ImportError as e:
    st.error(f"Error técnico: No se encuentra la función en motor_huesos.py. Detalles: {e}")
    st.stop()

# --- 2. CONFIGURACIÓN DE PÁGINA ---
st.set_page_config(page_title="CJ PROYECTOS - Jorge Luis", layout="wide")

# Diseño Responsive
st.markdown("""
    <style>
    .titulo-dorado {
        font-family: 'serif';
        color: #B8860B;
        text-align: center;
        font-weight: bold;
        padding: 10px;
    }
    @media (min-width: 768px) { .titulo-dorado { font-size: 60px; } }
    @media (max-width: 767px) { .titulo-dorado { font-size: 35px; } }
    </style>
    """, unsafe_allow_html=True)

# --- 3. CARGA DE LOGOS ---
# Si los logos están en la raíz, el motor los encontrará
logo_cj = cargar_imagen_raiz("logo_cj.jpg")
logo_carrion = cargar_imagen_raiz("logo_carrion.png")

# --- 4. BARRA LATERAL ---
with st.sidebar:
    if logo_cj:
        st.image(logo_cj, width=120)
    else:
        st.warning("⚠️ logo_cj.jpg no detectado en la raíz")
    
    st.markdown("### **PROYECTO CJ**")
    st.write("Lic. Jorge Luis Chiroque")
    st.divider()
    menu = st.radio("NAVEGACIÓN", ["🏠 INICIO", "🦴 ANATOMÍA", "📖 CARRION", "📚 BIBLIOTECA"])

# --- 5. SECCIÓN: INICIO ---
if menu == "🏠 INICIO":
    st.markdown('<h1 class="titulo-dorado">PROYECTO CJ</h1>', unsafe_allow_html=True)
    
    st.image("https://images.unsplash.com/photo-1576091160550-2173dbc999ef?q=80&w=2070", 
             caption="Excelencia en Fisioterapia y Rehabilitación", 
             use_container_width=True)
    
    st.divider()
    
    col1, col2 = st.columns([2, 1])
    with col1:
        st.subheader("Sistema de Optimización de Estudio")
        st.write("Bienvenido, Jorge Luis. Tu centro de gestión ahora es responsive.")
    with col2:
        if logo_carrion:
            st.image(logo_carrion, width=150)
        else:
            st.caption("Falta logo_carrion.png en raíz")

else:
    st.info(f"Sección **{menu}** en espera del Paso 2.")
