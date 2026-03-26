import streamlit as st
import sys
import os
from MODULOS.motor_huesos import cargar_imagen_raiz

# --- CONFIGURACIÓN ESTÉTICA ---
st.set_page_config(page_title="CJ PROYECTOS - Jorge Luis", layout="wide")

st.markdown("""
    <style>
    .titulo-dorado {
        font-family: 'Playfair Display', serif;
        color: #B8860B; /* Dorado Oscuro */
        text-align: center;
        font-size: 60px;
        font-weight: bold;
        padding-top: 20px;
    }
    </style>
    """, unsafe_allow_html=True)

# --- CARGA DE LOGOS (Desde la Raíz) ---
logo_cj = cargar_imagen_raiz("logo_cj.jpg")
logo_carrion = cargar_imagen_raiz("logo_carrion.png")

# --- SIDEBAR ---
with st.sidebar:
    if logo_cj:
        st.image(logo_cj, width=150)
    st.markdown("### **PROYECTO CJ**")
    st.write("Lic. Jorge Luis Chiroque")
    st.divider()
    menu = st.radio("NAVEGACIÓN", ["🏠 INICIO", "🦴 ANATOMÍA", "📖 CARRION", "📚 BIBLIOTECA"])

# --- SECCIÓN: INICIO (Paso 1) ---
if menu == "🏠 INICIO":
    st.markdown('<h1 class="titulo-dorado">PROYECTO CJ</h1>', unsafe_allow_html=True)
    
    # Imagen de Unsplash enfocada en Fisioterapia
    st.image("https://images.unsplash.com/photo-1576091160550-2173dbc999ef?q=80&w=2070", 
             caption="Fisioterapia y Rehabilitación de Alto Nivel", use_container_width=True)
    
    st.divider()
    
    col1, col2 = st.columns([2, 1])
    with col1:
        st.subheader("Sistema de Optimización de Estudio")
        st.write("Bienvenido, Jorge Luis. Este es tu centro de gestión académica y clínica.")
    with col2:
        if logo_carrion:
            st.image(logo_carrion, width=180)

else:
    st.warning(f"Sección {menu} en construcción para el siguiente paso.")
