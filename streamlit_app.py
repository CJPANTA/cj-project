import streamlit as st
import sys
import os

# --- CONFIGURACIÓN DE RUTAS ---
ruta_actual = os.path.dirname(os.path.abspath(__file__))
ruta_modulos = os.path.join(ruta_actual, "MODULOS")
ruta_portadas = os.path.join(ruta_actual, "BASE_DATOS", "04_PORTADAS")

if ruta_modulos not in sys.path:
    sys.path.append(ruta_modulos)

from motor_huesos import cargar_imagen_raiz

# --- CONFIGURACIÓN DE PÁGINA ---
st.set_page_config(page_title="SISTEMA CJ - Lic. Jorge Luis", layout="wide")

# --- CSS: IDENTIDAD VISUAL BLINDADA (#06101c y #6e4f02) ---
st.markdown(f"""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@300;400;600&display=swap');

    .stApp {{ background-color: #06101c !important; color: #FFFFFF; }}

    /* BARRA LATERAL: LOGO GRANDE Y TEXTO EN UNA LÍNEA */
    [data-testid="stSidebar"] {{
        background-color: #06101c !important;
        border-right: 1px solid #6e4f02 !important;
        min-width: 320px !important;
    }}
    
    .stRadio label p {{
        color: #FFFFFF !important;
        font-family: 'Montserrat', sans-serif;
        font-size: 13px !important;
        text-transform: uppercase;
        white-space: nowrap;
        letter-spacing: 1px;
    }}

    /* TARJETAS DE NAVEGACIÓN (CENTRO) */
    .card-ciclo {{
        background: rgba(110, 79, 2, 0.08);
        border: 1px solid #6e4f02;
        padding: 25px;
        border-radius: 4px;
        text-align: center;
        transition: 0.4s;
        cursor: pointer;
        margin-bottom: 20px;
    }}
    
    .card-ciclo:hover {{
        background: rgba(110, 79, 2, 0.2);
        transform: translateY(-5px);
        box-shadow: 0px 10px 20px rgba(0,0,0,0.5);
    }}

    .titulo-ciclo {{
        font-family: 'Playfair Display', serif;
        color: #6e4f02;
        font-size: 28px;
        margin-bottom: 5px;
    }}

    .sub-detalle {{
        font-family: 'Montserrat', sans-serif;
        font-size: 11px;
        letter-spacing: 2px;
        opacity: 0.7;
    }}

    /* LÍNEAS FINAS DE DISEÑO */
    .linea-decorativa {{
        border-bottom: 1px solid #6e4f02;
        width: 100%;
        margin: 20px 0;
    }}
    </style>
    """, unsafe_allow_html=True)

# --- CARGA DE LOGOS ---
logo_cj = cargar_imagen_raiz("logo_cj.jpg") 

# --- SIDEBAR (LOGO PROPORCIONAL Y GRANDE) ---
with st.sidebar:
    if logo_cj:
        # Logo más grande, ocupando el ancho proporcional
        st.markdown(f'''
            <div style="text-align: center; padding-bottom: 10px;">
                <img src="{logo_cj}" style="width: 220px; border: 1px solid #6e4f02; padding: 5px;">
            </div>
        ''', unsafe_allow_html=True)
    
    st.markdown("<h3 style='text-align: center; color: #6e4f02; font-family: serif; letter-spacing: 4px; margin-bottom: 0;'>SISTEMA CJ</h3>", unsafe_allow_html=True)
    st.markdown("<p style='text-align: center; font-size: 12px; letter-spacing: 2px; opacity: 0.8;'>LIC. JORGE LUIS CHIROQUE</p>", unsafe_allow_html=True)
    st.markdown("<div class='linea-decorativa'></div>", unsafe_allow_html=True)
    
    menu = st.radio("NAVEGACIÓN", ["🏠 INICIO", "🦴 ANATOMÍA MAESTRO", "📖 REPOSITORIO CARRION", "🧬 LABORATORIO AUCALLAMA"])

# --- CONTENIDO PRINCIPAL ---
if menu == "🏠 INICIO":
    st.markdown('<h1 style="text-align:center; color:#6e4f02; font-family:serif; font-size: 55px;">PROYECTO CJ</h1>', unsafe_allow_html=True)
    st.image("https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070", use_container_width=True)

elif menu == "📖 REPOSITORIO CARRION":
    st.markdown('<h2 style="color: #6e4f02; font-family: serif;">REPOSITORIO ACADÉMICO</h2>', unsafe_allow_html=True)
    st.markdown("<p style='opacity: 0.6; margin-top: -15px;'>Seleccione el ciclo para desplegar cursos y temas</p>", unsafe_allow_html=True)
    st.markdown("<div class='linea-decorativa'></div>", unsafe_allow_html=True)

    # Navegación por Tarjetas en el Centro
    col1, col2 = st.columns(2)
    col3, col4 = st.columns(2)

    ciclos = [
        {"n": "01", "col": col1, "desc": "FUNDAMENTOS FISIO"},
        {"n": "02", "col": col2, "desc": "ANATOMÍA FUNCIONAL"},
        {"n": "03", "col": col3, "desc": "AGENTES FÍSICOS I"},
        {"n": "04", "col": col4, "desc": "CLÍNICA AVANZADA"}
    ]

    for c in ciclos:
        with c["col"]:
            st.markdown(f'''
                <div class="card-ciclo">
                    <div class="sub-detalle">NIVEL ACADÉMICO</div>
                    <div class="titulo-ciclo">CICLO {c["n"]}</div>
                    <div style="color: #FFFFFF; font-size: 13px; opacity: 0.8;">{c["desc"]}</div>
                </div>
            ''', unsafe_allow_html=True)
            if st.button(f"ABRIR CONTENIDO C-{c['n']}", key=c['n']):
                st.session_state['ciclo_sel'] = c['n']

    # Simulación de despliegue al seleccionar un ciclo
    if 'ciclo_sel' in st.session_state:
        st.markdown("<div class='linea-decorativa'></div>", unsafe_allow_html=True)
        st.subheader(f"Explorando Ciclo {st.session_state['ciclo_sel']}")
        
        # Aquí se cargarían los cursos del ciclo seleccionado
        with st.expander("📚 CURSOS DISPONIBLES", expanded=True):
            st.write("🟢 Curso 01: Temas y Materiales")
            st.write("🟢 Curso 02: Evaluaciones")

else:
    st.info("Módulo en desarrollo...")
