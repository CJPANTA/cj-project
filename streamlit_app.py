import streamlit as st
import sys
import os
from MODULOS.motor_huesos import cargar_imagen_raiz

# --- CONFIGURACIÓN ESTÉTICA ADAPTABLE ---
st.set_page_config(page_title="CJ PROYECTOS - Jorge Luis", layout="wide")

# CSS Mejorado para Móviles
st.markdown("""
    <style>
    /* Título que cambia de tamaño según la pantalla */
    .titulo-dorado {
        font-family: 'Playfair Display', serif;
        color: #B8860B;
        text-align: center;
        font-weight: bold;
        padding: 10px;
        line-height: 1.2;
    }
    
    /* Escritorio */
    @media (min-width: 768px) {
        .titulo-dorado { font-size: 60px; }
    }
    /* Celular */
    @media (max-width: 767px) {
        .titulo-dorado { font-size: 35px; }
        .stImage { width: 100% !important; }
    }

    /* Ajuste de márgenes para que no se vea pegado al borde en el cel */
    .main .block-container {
        padding-top: 2rem;
        padding-bottom: 2rem;
    }
    </style>
    """, unsafe_allow_html=True)

# --- CARGA DE LOGOS ---
logo_cj = cargar_imagen_raiz("logo_cj.jpg")
logo_carrion = cargar_imagen_raiz("logo_carrion.png")

# --- SIDEBAR ---
with st.sidebar:
    if logo_cj:
        st.image(logo_cj, width=120) # Un poco más pequeño para que no ocupe toda la barra lateral
    st.markdown("### **PROYECTO CJ**")
    st.write("Lic. Jorge Luis Chiroque")
    st.divider()
    menu = st.radio("NAVEGACIÓN", ["🏠 INICIO", "🦴 ANATOMÍA", "📖 CARRION", "📚 BIBLIOTECA"])

# --- SECCIÓN: INICIO ---
if menu == "🏠 INICIO":
    st.markdown('<h1 class="titulo-dorado">PROYECTO CJ</h1>', unsafe_allow_html=True)
    
    # Imagen con use_container_width=True para que se ajuste sola
    st.image("https://images.unsplash.com/photo-1576091160550-2173dbc999ef?q=80&w=2070", 
             caption="Excelencia en Fisioterapia y Rehabilitación", 
             use_container_width=True)
    
    st.divider()
    
    # En celular, las columnas se ponen una debajo de otra automáticamente
    col1, col2 = st.columns([2, 1])
    with col1:
        st.subheader("Sistema de Optimización de Estudio")
        st.write("Bienvenido, Jorge Luis. Tu centro de gestión académica y clínica ahora en tu bolsillo.")
    with col2:
        if logo_carrion:
            # Centrado del logo en móviles
            st.image(logo_carrion, width=150)

else:
    st.warning(f"Sección {menu} en construcción. Vamos paso a paso.")
