import streamlit as st
import os
import urllib.parse
from MODULOS.motor_huesos import cargar_imagen_raiz

# --- CONFIGURACIÓN ---
st.set_page_config(page_title="SISTEMA CJ - Biblioteca", layout="wide")

# --- CSS DEFINITIVO (COLORES SOLICITADOS) ---
st.markdown(f"""
    <style>
    .stApp {{ background-color: #06101c !important; color: #FFFFFF; }}
    
    /* BARRA LATERAL */
    [data-testid="stSidebar"] {{
        background-color: #06101c !important;
        border-right: 1px solid #6e4f02 !important;
    }}

    /* TARJETAS DE CICLO (Dorado y Esmeralda) */
    .contenedor-tarjeta {{
        height: 180px;
        border: 2px solid #6e4f02;
        background: rgba(0, 128, 128, 0.05); /* Toque verde esmeralda suave */
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        text-align: center; border-radius: 15px;
        transition: 0.4s; margin-bottom: 20px;
    }}
    
    .contenedor-tarjeta:hover {{
        background: rgba(0, 128, 128, 0.2); /* Brillo verde esmeralda al pasar mouse */
        border-color: #008080;
        transform: scale(1.05);
    }}

    .card-num {{ color: #6e4f02; font-size: 30px; font-weight: bold; }}
    .card-title {{ color: #d1d5db; font-size: 14px; font-weight: 600; text-transform: uppercase; }}
    </style>
    """, unsafe_allow_html=True)

# --- SIDEBAR IDENTIDAD ---
logo_cj = cargar_imagen_raiz("logo_cj.jpg") 
with st.sidebar:
    if logo_cj:
        st.markdown(f'<div style="text-align: center;"><img src="{logo_cj}" width="180" style="border: 1px solid #6e4f02;"></div>', unsafe_allow_html=True)
    st.markdown("<h3 style='text-align: center; color: #6e4f02;'>SISTEMA CJ</h3>", unsafe_allow_html=True)
    st.divider()
    menu = st.radio("NAVEGACIÓN", ["🏠 INICIO", "📖 REPOSITORIO"])

# --- LÓGICA DE REPOSITORIO ---
if menu == "📖 REPOSITORIO":
    if 'ciclo_activo' not in st.session_state:
        st.markdown('<h1 style="color: #6e4f02; text-align: center;">REPOSITORIO ACADÉMICO</h1>', unsafe_allow_html=True)
        
        ciclos = [
            {"id": "01", "name": "FUNDAMENTOS", "sub": "HISTORIA Y BASES"},
            {"id": "02", "name": "ANATOMÍA", "sub": "ESTRUCTURA HUMANA"},
            {"id": "03", "name": "AGENTES I", "sub": "TERAPIAS FÍSICAS"},
            {"id": "04", "name": "CLÍNICA IV", "sub": "CASOS Y PROTOCOLOS"}
        ]

        c1, c2 = st.columns(2)
        for i, c in enumerate(ciclos):
            with (c1 if i % 2 == 0 else c2):
                # La tarjeta visual
                st.markdown(f"""
                    <div class="contenedor-tarjeta">
                        <div style="font-size: 10px; opacity: 0.6;">NIVEL CARRION</div>
                        <div class="card-num">CICLO {c['id']}</div>
                        <div class="card-title">{c['name']}</div>
                    </div>
                """, unsafe_allow_html=True)
                # El botón real que hace el cambio
                if st.button(f"ABRIR {c['name']}", key=f"btn_{c['id']}"):
                    st.session_state['ciclo_activo'] = c['id']
                    st.rerun()
    else:
        # VISTA DE ARCHIVOS (Conexión real a tus carpetas)
        sel = st.session_state['ciclo_activo']
        st.markdown(f'<h2 style="color: #6e4f02;">ARCHIVOS: CICLO {sel}</h2>', unsafe_allow_html=True)
        
        if st.button("⬅ VOLVER A CICLOS"):
            del st.session_state['ciclo_activo']
            st.rerun()

        # DICCIONARIO DE ARCHIVOS (Esto es lo que me faltaba "leer")
        # Jorge, aquí pondremos la lista de tus PDFs. Ejemplo para Ciclo 01:
        archivos_c01 = ["01-conceptos_basicos-1.pdf", "02-histologia.pdf", "03-conceptos_basicos-2.pdf"]
        
        for arc in archivos_c01:
            with st.container(border=True):
                col1, col2 = st.columns([4, 1])
                col1.write(f"📄 {arc}")
                # Link directo a tu GitHub Raw
                url = f"https://raw.githubusercontent.com/CJPANTA/cj-project/main/BASE_DATOS/01_CARRION/CICLO_01/anatomia_y_fisiologia/{urllib.parse.quote(arc)}"
                col2.link_button("VER", url)
