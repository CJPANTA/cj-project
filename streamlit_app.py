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
st.set_page_config(page_title="SISTEMA CJ - Lic. Jorge Luis", layout="wide")

# --- TU CSS ORIGINAL (Azul: #06101c, Dorado: #6e4f02) ---
st.markdown(f"""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@300;400;600&display=swap');
    .stApp {{ background-color: #06101c !important; color: #FFFFFF; }}
    [data-testid="stSidebar"] {{ background-color: #06101c !important; border-right: 1px solid #6e4f02 !important; min-width: 300px !important; }}
    .stButton>button {{ position: absolute; top: 0; left: 0; width: 100%; height: 200px; background-color: transparent !important; color: transparent !important; border: none !important; z-index: 10; cursor: pointer; }}
    .contenedor-tarjeta {{ height: 200px; border: 1px solid #6e4f02; background: rgba(110, 79, 2, 0.05); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; transition: 0.4s; margin-bottom: 20px; position: relative; }}
    .card-label {{ font-family: 'Montserrat', sans-serif; font-size: 10px; letter-spacing: 3px; opacity: 0.6; }}
    .card-num {{ font-family: 'Playfair Display', serif; color: #6e4f02; font-size: 38px; font-weight: bold; margin: 5px 0; }}
    .card-title {{ font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 600; color: #D4AF37; text-transform: uppercase; letter-spacing: 1px; }}
    .linea-fina {{ border-bottom: 1px solid #6e4f02; margin: 25px 0; opacity: 0.4; }}
    </style>
    """, unsafe_allow_html=True)

# --- IDENTIDAD ---
logo_cj = cargar_imagen_raiz("logo_cj.jpg") 

# --- SIDEBAR ---
with st.sidebar:
    if logo_cj:
        st.markdown(f'<div style="text-align: center; padding: 20px;"><img src="{logo_cj}" width="220" style="border: 1px solid #6e4f02; padding: 5px;"></div>', unsafe_allow_html=True)
    st.markdown("<h3 style='text-align: center; color: #6e4f02; font-family: serif; letter-spacing: 3px;'>SISTEMA CJ</h3>", unsafe_allow_html=True)
    st.divider()
    menu = st.radio("NAVEGACIÓN", ["🏠 INICIO", "🦴 ANATOMÍA", "📖 REPOSITORIO CARRION", "🧬 LABORATORIO"])

# --- MODULO REPOSITORIO (CONEXIÓN MEJORADA) ---
if menu == "📖 REPOSITORIO CARRION":
    if 'ciclo_activo' not in st.session_state:
        st.markdown('<h1 style="color: #6e4f02; font-family: serif; text-align: center; font-size: 40px;">REPOSITORIO ACADÉMICO</h1>', unsafe_allow_html=True)
        st.markdown("<div class='linea-fina'></div>", unsafe_allow_html=True)

        ciclos = [
            {"id": "01", "name": "FUNDAMENTOS", "sub": "HISTORIA Y BASES"},
            {"id": "02", "name": "ANATOMÍA", "sub": "ESTRUCTURA HUMANA"},
            {"id": "03", "name": "AGENTES I", "sub": "TERAPIAS FÍSICAS"},
            {"id": "04", "name": "CLÍNICA IV", "sub": "CASOS Y PROTOCOLOS"}
        ]

        c1, c2 = st.columns(2)
        for i, c in enumerate(ciclos):
            with (c1 if i % 2 == 0 else c2):
                st.markdown(f"""<div class="contenedor-tarjeta"><div class="card-label">NIVEL CARRION</div><div class="card-num">CICLO {c['id']}</div><div class="card-title">{c['name']}</div><div style="font-size: 9px; opacity: 0.5; margin-top: 5px;">{c['sub']}</div></div>""", unsafe_allow_html=True)
                if st.button(f"Entrar {c['id']}", key=f"btn_{c['id']}"):
                    st.session_state['ciclo_activo'] = c['id']
                    st.rerun()
    else:
        st.markdown(f'<h2 style="color: #6e4f02; font-family: serif;">CURSOS: CICLO {st.session_state["ciclo_activo"]}</h2>', unsafe_allow_html=True)
        if st.button("⬅ VOLVER A CICLOS", key="btn_volver_ciclos"):
            del st.session_state['ciclo_activo']
            st.rerun()
        st.markdown("<div class='linea-fina'></div>", unsafe_allow_html=True)

        # RUTA REAL HACIA TUS PDFS
        ruta_ciclo = os.path.join("BASE_DATOS", "01_CARRION", f"CICLO_{st.session_state['ciclo_activo']}")
        
        if os.path.exists(ruta_ciclo):
            pdfs = [f for f in os.listdir(ruta_ciclo) if f.lower().endswith(".pdf")]
            if pdfs:
                for pdf in pdfs:
                    with open(os.path.join(ruta_ciclo, pdf), "rb") as f:
                        st.download_button(label=f"📖 Abrir {pdf}", data=f, file_name=pdf, key=f"dl_{pdf}")
            else:
                st.warning(f"No se encontraron PDFs en {ruta_ciclo}")
        else:
            st.error(f"Error: No se encontró la carpeta {ruta_ciclo}")

else:
    st.markdown(f'<h1 style="text-align:center; color:#6e4f02; font-family:serif; font-size: 55px;">PROYECTO CJ</h1>', unsafe_allow_html=True)
    st.image("https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070", use_container_width=True)
