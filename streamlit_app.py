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

# --- CSS: AFINADO DE TARJETAS TIPO BOTÓN ---
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

    /* CONTENEDOR DE TARJETA */
    .contenedor-tarjeta {{
        position: relative;
        height: 200px;
        border: 1px solid #6e4f02;
        background: rgba(110, 79, 2, 0.05);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        transition: 0.4s ease;
        margin-bottom: 20px;
    }}
    
    .contenedor-tarjeta:hover {{
        background: rgba(110, 79, 2, 0.15);
        border-color: #D4AF37;
        transform: translateY(-5px);
        box-shadow: 0px 8px 20px rgba(0,0,0,0.6);
    }}

    /* BOTÓN INVISIBLE QUE CUBRE LA TARJETA */
    .stButton>button {{
        position: absolute;
        top: 0; left: 0; width: 100%; height: 200px;
        background-color: transparent !important;
        color: transparent !important;
        border: none !important;
        z-index: 10;
        cursor: pointer;
    }}

    /* TEXTO DENTRO DE LA TARJETA (Debajo del botón) */
    .card-label {{ font-family: 'Montserrat', sans-serif; font-size: 10px; letter-spacing: 3px; opacity: 0.6; }}
    .card-num {{ font-family: 'Playfair Display', serif; color: #6e4f02; font-size: 35px; font-weight: bold; margin: 10px 0; }}
    .card-title {{ font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 600; color: #D4AF37; text-transform: uppercase; }}

    .linea-fina {{ border-bottom: 1px solid #6e4f02; margin: 30px 0; opacity: 0.4; }}
    </style>
    """, unsafe_allow_html=True)

# --- CARGA DE IDENTIDAD ---
logo_cj = cargar_imagen_raiz("logo_cj.jpg") 

# --- SIDEBAR ---
with st.sidebar:
    if logo_cj:
        st.markdown(f'<div style="text-align: center; padding: 15px;"><img src="{logo_cj}" width="220" style="border: 1px solid #6e4f02; padding: 5px;"></div>', unsafe_allow_html=True)
    st.markdown("<h3 style='text-align: center; color: #6e4f02; font-family: serif; letter-spacing: 3px;'>SISTEMA CJ</h3>", unsafe_allow_html=True)
    st.divider()
    menu = st.radio("NAVEGACIÓN", ["🏠 INICIO", "🦴 ANATOMÍA", "📖 REPOSITORIO CARRION", "🧬 LABORATORIO"])

# --- REPOSITORIO CARRION ---
if menu == "📖 REPOSITORIO CARRION":
    if 'ciclo_activo' not in st.session_state:
        st.markdown('<h2 style="color: #6e4f02; font-family: serif; text-align: center;">REPOSITORIO ACADÉMICO</h2>', unsafe_allow_html=True)
        st.markdown("<div class='linea-fina'></div>", unsafe_allow_html=True)

        ciclos = [
            {"id": "01", "name": "FUNDAMENTOS", "sub": "HISTORIA Y BASES"},
            {"id": "02", "name": "ANATOMÍA", "sub": "ESTRUCTURA HUMANA"},
            {"id": "03", "name": "AGENTES I", "sub": "TERAPIAS FÍSICAS"},
            {"id": "04", "name": "CLÍNICA IV", "sub": "REHABILITACIÓN"}
        ]

        col1, col2 = st.columns(2)
        
        for i, c in enumerate(ciclos):
            target_col = col1 if i % 2 == 0 else col2
            with target_col:
                # 1. Dibujamos la tarjeta visual primero
                st.markdown(f"""
                    <div class="contenedor-tarjeta">
                        <div class="card-label">NIVEL ACADÉMICO</div>
                        <div class="card-num">CICLO {c['id']}</div>
                        <div class="card-title">{c['name']}</div>
                        <div style="font-size: 9px; opacity: 0.5; margin-top: 8px;">{c['sub']}</div>
                    </div>
                """, unsafe_allow_html=True)
                
                # 2. Ponemos el botón invisible encima (se posiciona con el CSS anterior)
                if st.button(f"Seleccionar {c['id']}", key=f"btn_{c['id']}"):
                    st.session_state['ciclo_activo'] = c['id']
                    st.rerun()

    else:
        st.markdown(f'<h2 style="color: #6e4f02; font-family: serif;">CICLO {st.session_state["ciclo_activo"]}</h2>', unsafe_allow_html=True)
        if st.button("⬅ VOLVER AL REPOSITORIO"):
            del st.session_state['ciclo_activo']
            st.rerun()
        st.markdown("<div class='linea-fina'></div>", unsafe_allow_html=True)
        st.write("Selecciona una materia para ver los recursos.")

else:
    st.markdown(f'<h1 style="text-align:center; color:#6e4f02; font-family:serif; font-size: 50px;">PROYECTO CJ</h1>', unsafe_allow_html=True)
    st.image("https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070", use_container_width=True)
