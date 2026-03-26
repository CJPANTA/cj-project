import streamlit as st
import sys
import os

# --- RUTAS ---
ruta_actual = os.path.dirname(os.path.abspath(__file__))
ruta_modulos = os.path.join(ruta_actual, "MODULOS")
if ruta_modulos not in sys.path:
    sys.path.append(ruta_modulos)

from motor_huesos import cargar_imagen_raiz

# --- CONFIGURACIÓN ---
st.set_page_config(page_title="SISTEMA CJ", layout="wide")

# --- CSS: TARJETAS CLICKABLES Y LOGO ---
st.markdown(f"""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@300;400;600&display=swap');

    .stApp {{ background-color: #06101c !important; color: #FFFFFF; }}

    /* BARRA LATERAL */
    [data-testid="stSidebar"] {{
        background-color: #06101c !important;
        border-right: 1px solid #6e4f02 !important;
        min-width: 300px !important;
    }}

    /* BOTÓN ESTILO TARJETA (Simulando el click en la tarjeta) */
    .stButton>button {{
        background: rgba(110, 79, 2, 0.08) !important;
        border: 1px solid #6e4f02 !important;
        border-radius: 4px !important;
        color: #FFFFFF !important;
        padding: 40px 20px !important; /* Altura para que parezca tarjeta */
        width: 100% !important;
        transition: 0.4s !important;
        text-align: center !important;
    }}
    
    .stButton>button:hover {{
        background: rgba(110, 79, 2, 0.2) !important;
        transform: translateY(-5px) !important;
        box-shadow: 0px 10px 15px rgba(0,0,0,0.4) !important;
        border-color: #876205 !important;
    }}

    .titulo-tarjeta {{
        font-family: 'Playfair Display', serif;
        color: #6e4f02;
        font-size: 24px;
        font-weight: bold;
    }}

    .sub-tarjeta {{
        font-family: 'Montserrat', sans-serif;
        font-size: 11px;
        letter-spacing: 2px;
        opacity: 0.7;
    }}

    .linea-decorativa {{
        border-bottom: 1px solid #6e4f02;
        margin: 20px 0;
    }}
    </style>
    """, unsafe_allow_html=True)

# --- CARGA DE LOGOS ---
logo_cj = cargar_imagen_raiz("logo_cj.jpg") 

# --- SIDEBAR ---
with st.sidebar:
    if logo_cj:
        st.markdown(f'<div style="text-align: center;"><img src="{logo_cj}" width="220" style="border: 1px solid #6e4f02; padding: 5px;"></div>', unsafe_allow_html=True)
    st.markdown("<h3 style='text-align: center; color: #6e4f02; font-family: serif; letter-spacing: 3px;'>SISTEMA CJ</h3>", unsafe_allow_html=True)
    st.divider()
    
    # Usamos session_state para controlar en qué ciclo estamos sin perder el menú
    menu = st.radio("NAVEGACIÓN", ["🏠 INICIO", "🦴 ANATOMÍA", "📖 REPOSITORIO CARRION", "🧬 LABORATORIO"])

# --- LÓGICA DE NAVEGACIÓN ---
if menu == "🏠 INICIO":
    st.markdown('<h1 style="text-align:center; color:#6e4f02; font-family:serif; font-size: 50px;">PROYECTO CJ</h1>', unsafe_allow_html=True)
    st.image("https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070", use_container_width=True)

elif menu == "📖 REPOSITORIO CARRION":
    # Si no hay ciclo seleccionado, mostrar las 4 tarjetas
    if 'ciclo_activo' not in st.session_state:
        st.markdown('<h2 style="color: #6e4f02; font-family: serif;">SELECCIONE CICLO ACADÉMICO</h2>', unsafe_allow_html=True)
        st.markdown("<div class='linea-decorativa'></div>", unsafe_allow_html=True)

        col1, col2 = st.columns(2)
        col3, col4 = st.columns(2)

        ciclos = [
            {"n": "01", "col": col1, "txt": "FUNDAMENTOS"},
            {"n": "02", "col": col2, "txt": "ANATOMÍA FUNCIONAL"},
            {"n": "03", "col": col3, "txt": "AGENTES FÍSICOS I"},
            {"n": "04", "col": col4, "txt": "CLÍNICA AVANZADA"}
        ]

        for c in ciclos:
            with c["col"]:
                # La tarjeta ahora es un botón gigante con el estilo CSS aplicado arriba
                if st.button(f"CICLO {c['n']}\n\n{c['txt']}", key=f"ciclo_{c['n']}"):
                    st.session_state['ciclo_activo'] = c['n']
                    st.rerun()
    
    # Si ya seleccionamos un ciclo, mostrar el contenido de ese ciclo
    else:
        st.markdown(f'<h2 style="color: #6e4f02; font-family: serif;">CONTENIDO: CICLO {st.session_state["ciclo_activo"]}</h2>', unsafe_allow_html=True)
        if st.button("⬅ Volver a Ciclos"):
            del st.session_state['ciclo_activo']
            st.rerun()
        
        st.markdown("<div class='linea-decorativa'></div>", unsafe_allow_html=True)
        
        # Ejemplo de contenido para el Ciclo 04
        if st.session_state['ciclo_activo'] == "04":
            exp1 = st.expander("📚 CURSO: AGENTES FÍSICOS II", expanded=True)
            exp1.write("📄 Tema 01: Introducción a la Termoterapia")
            exp1.write("📄 Tema 02: Corrientes de alta frecuencia")
        else:
            st.info(f"Cargando archivos del Ciclo {st.session_state['ciclo_activo']}...")

else:
    st.info("Módulo en desarrollo...")
