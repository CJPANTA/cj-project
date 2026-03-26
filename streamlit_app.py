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

# --- CSS: ESTILO PREMIUM "GLASS & GOLD" ---
st.markdown(f"""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Montserrat:wght@300;500;600&display=swap');

    .stApp {{ background-color: #06101c !important; color: #FFFFFF; }}

    /* BARRA LATERAL */
    [data-testid="stSidebar"] {{
        background-color: #06101c !important;
        border-right: 1px solid #6e4f02 !important;
        min-width: 300px !important;
    }}

    /* EL BOTÓN QUE SE COMPORTA COMO TARJETA DE LUJO */
    .stButton>button {{
        background: rgba(110, 79, 2, 0.05) !important;
        border: 1px solid #6e4f02 !important;
        border-radius: 2px !important;
        color: #FFFFFF !important;
        padding: 0px !important; /* El contenido HTML interno dará el padding */
        width: 100% !important;
        height: 180px !important;
        transition: all 0.4s ease-in-out !important;
        display: block !important;
    }}
    
    .stButton>button:hover {{
        background: rgba(110, 79, 2, 0.15) !important;
        border-color: #D4AF37 !important;
        transform: translateY(-5px) !important;
        box-shadow: 0px 10px 25px rgba(0,0,0,0.6) !important;
    }}

    /* ESTILO DE TEXTO DENTRO DE LA TARJETA */
    .card-header {{
        font-family: 'Montserrat', sans-serif;
        font-size: 10px;
        letter-spacing: 3px;
        color: #FFFFFF;
        opacity: 0.6;
        margin-top: 20px;
    }}
    
    .card-number {{
        font-family: 'Playfair Display', serif;
        color: #6e4f02;
        font-size: 32px;
        font-weight: bold;
        margin: 5px 0;
    }}
    
    .card-desc {{
        font-family: 'Montserrat', sans-serif;
        font-size: 13px;
        font-weight: 500;
        letter-spacing: 1px;
        color: #D4AF37;
        text-transform: uppercase;
    }}

    .linea-decorativa {{
        border-bottom: 1px solid #6e4f02;
        margin: 25px 0;
        opacity: 0.5;
    }}
    </style>
    """, unsafe_allow_html=True)

# --- CARGA DE LOGOS ---
logo_cj = cargar_imagen_raiz("logo_cj.jpg") 

# --- SIDEBAR ---
with st.sidebar:
    if logo_cj:
        st.markdown(f'<div style="text-align: center;"><img src="{logo_cj}" width="220" style="border: 1px solid #6e4f02; padding: 5px; background: #06101c;"></div>', unsafe_allow_html=True)
    st.markdown("<h3 style='text-align: center; color: #6e4f02; font-family: serif; letter-spacing: 3px; margin-top:15px;'>SISTEMA CJ</h3>", unsafe_allow_html=True)
    st.divider()
    menu = st.radio("NAVEGACIÓN", ["🏠 INICIO", "🦴 ANATOMÍA", "📖 REPOSITORIO CARRION", "🧬 LABORATORIO"])

# --- LÓGICA REPOSITORIO ---
if menu == "📖 REPOSITORIO CARRION":
    if 'ciclo_activo' not in st.session_state:
        st.markdown('<h2 style="color: #6e4f02; font-family: serif; text-align: center;">REPOSITORIO ACADÉMICO</h2>', unsafe_allow_html=True)
        st.markdown("<div class='linea-decorativa'></div>", unsafe_allow_html=True)

        # Definición de Ciclos con descripciones mejoradas
        ciclos = [
            {"id": "01", "desc": "Bases de la Fisioterapia", "meta": "FUNDAMENTOS E HISTORIA"},
            {"id": "02", "desc": "Estructura y Función", "meta": "ANATOMÍA Y BIOMECÁNICA"},
            {"id": "03", "desc": "Agentes Físicos I", "meta": "TERAPIAS BÁSICAS"},
            {"id": "04", "desc": "Clínica Especializada", "meta": "REHABILITACIÓN AVANZADA"}
        ]

        # Grid de Tarjetas
        col1, col2 = st.columns(2)
        
        for i, c in enumerate(ciclos):
            target_col = col1 if i % 2 == 0 else col2
            with target_col:
                # Inyectamos el diseño visual dentro del botón
                html_btn = f"""
                    <div style="text-align: center;">
                        <div class="card-header">NIVEL ACADÉMICO</div>
                        <div class="card-number">CICLO {c['id']}</div>
                        <div class="card-desc">{c['desc']}</div>
                        <div style="font-size: 9px; opacity: 0.5; margin-top: 10px;">{c['meta']}</div>
                    </div>
                """
                if st.button(f"Entrar Ciclo {c['id']}", key=f"btn_{c['id']}", help=f"Ver contenido del Ciclo {c['id']}"):
                    st.session_state['ciclo_activo'] = c['id']
                    st.rerun()
                
                # Superponemos el estilo visual sobre el botón con markdown (Truco visual)
                st.markdown(f"""<div style="margin-top: -165px; pointer-events: none; text-align: center; margin-bottom: 60px;">{html_btn}</div>""", unsafe_allow_html=True)

    else:
        # Pantalla Interior del Ciclo
        st.markdown(f'<h2 style="color: #6e4f02; font-family: serif;">CONTENIDO: CICLO {st.session_state["ciclo_activo"]}</h2>', unsafe_allow_html=True)
        if st.button("⬅ VOLVER A CICLOS"):
            del st.session_state['ciclo_activo']
            st.rerun()
        
        st.markdown("<div class='linea-decorativa'></div>", unsafe_allow_html=True)
        st.info(f"Mostrando archivos y temas del Ciclo {st.session_state['ciclo_activo']}...")

else:
    st.markdown(f'<h1 style="text-align:center; color:#6e4f02; font-family:serif; font-size: 50px;">PROYECTO CJ</h1>', unsafe_allow_html=True)
    st.image("https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070", use_container_width=True)
