import streamlit as st
import sys
import os

# --- RUTAS ---
ruta_actual = os.path.dirname(os.path.abspath(__file__))
ruta_modulos = os.path.join(ruta_actual, "MODULOS")
ruta_portadas = os.path.join(ruta_actual, "BASE_DATOS", "04_PORTADAS")

if ruta_modulos not in sys.path:
    sys.path.append(ruta_modulos)

from motor_huesos import cargar_imagen_raiz

# --- CONFIGURACIÓN ---
st.set_page_config(page_title="CJ PROYECTOS", layout="wide")

# --- CSS: REFINAMIENTO DE LÍNEAS Y JERARQUÍA ---
st.markdown(f"""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@300;400;600&display=swap');

    .stApp {{ background-color: #06101c !important; color: #FFFFFF; }}

    /* BARRA LATERAL */
    [data-testid="stSidebar"] {{
        background-color: #06101c !important;
        border-right: 1px solid #6e4f02 !important;
    }}
    
    .stRadio label p {{
        color: #FFFFFF !important;
        font-family: 'Montserrat', sans-serif;
        font-size: 13px !important;
        text-transform: uppercase;
        white-space: nowrap;
    }}

    /* TARJETAS DE CICLO (GLASSMORPHISM) */
    .ciclo-card {{
        border: 1px solid #6e4f02;
        padding: 15px;
        background: rgba(110, 79, 2, 0.05);
        border-radius: 4px;
        margin-bottom: 10px;
        transition: 0.3s;
    }}
    
    .ciclo-card:hover {{
        background: rgba(110, 79, 2, 0.15);
    }}

    .titulo-seccion {{
        font-family: 'Playfair Display', serif;
        color: #6e4f02;
        border-bottom: 1px solid #6e4f02;
        padding-bottom: 10px;
        margin-bottom: 20px;
    }}
    </style>
    """, unsafe_allow_html=True)

# --- CARGA DE IDENTIDAD ---
logo_cj = cargar_imagen_raiz("logo_cj.jpg") # Logo de la Clínica
# Asumo que tu foto o logo personal se llama 'logo_personal.png' en la misma ruta
logo_personal = cargar_imagen_raiz("logo_personal.png") 

# --- SIDEBAR ---
with st.sidebar:
    col_log1, col_log2 = st.columns(2)
    with col_log1:
        if logo_cj: st.image(logo_cj, width=80)
    with col_log2:
        if logo_personal: st.image(logo_personal, width=80)
    
    st.markdown("<h4 style='text-align: center; color: #6e4f02; font-family: serif; margin-top:10px;'>SISTEMA CJ</h4>", unsafe_allow_html=True)
    st.markdown("<p style='text-align: center; font-size: 11px; opacity:0.8;'>LIC. JORGE LUIS CHIROQUE</p>", unsafe_allow_html=True)
    st.divider()
    
    menu = st.radio("NAVEGACIÓN", ["🏠 INICIO", "🦴 ANATOMÍA", "📖 REPOSITORIO CARRION", "🧬 LABORATORIO"])

# --- CONTENIDO ---
if menu == "🏠 INICIO":
    st.markdown('<h1 style="text-align:center; color:#6e4f02; font-family:serif;">PROYECTO CJ</h1>', unsafe_allow_html=True)
    st.image("https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070", use_container_width=True)

elif menu == "📖 REPOSITORIO CARRION":
    st.markdown('<h2 class="titulo-seccion">REPOSITORIO ACADÉMICO</h2>', unsafe_allow_html=True)
    
    # Simulación de Estructura de Ciclos 1 al 4
    for i in range(1, 5):
        with st.expander(f"📌 CICLO 0{i}"):
            # Sub-nivel: Cursos (Ejemplo para el Ciclo 4)
            if i == 4:
                col_c1, col_c2 = st.columns(2)
                with col_c1:
                    st.markdown("### 📚 Agentes Físicos II")
                    with st.container():
                        st.write("🟢 Tema 1: Termoterapia avanzada")
                        st.write("🟢 Tema 2: Crioterapia clínica")
                        st.button("Ver Material", key=f"btn_c4_a{i}")
                with col_c2:
                    st.markdown("### 📚 Anatomía Palpatoria")
                    st.write("🟢 Tema 1: Miembro Superior")
                    st.write("🟢 Tema 2: Miembro Inferior")
                    st.button("Ver Material", key=f"btn_c4_b{i}")
            else:
                st.info(f"Contenido del Ciclo 0{i} archivado. Haz clic para desplegar cursos.")
                st.button(f"Explorar Ciclo 0{i}", key=f"exp_{i}")

else:
    st.info("Módulo en construcción...")
