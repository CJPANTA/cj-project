import streamlit as st
import sys
import os
from MODULOS.motor_huesos import obtener_imagen_base64, BASE_DIR

st.set_page_config(page_title="CJ PROJECT - MASTER", layout="wide")

# --- ESTILO GAMA ALTA CJ ---
st.markdown(f"""
    <style>
    /* Título Dorado Marcado */
    .titulo-cj {{
        font-family: 'Helvetica', sans-serif;
        color: #876205;
        text-align: center;
        font-size: 70px;
        font-weight: 900;
        margin-bottom: 5px;
        text-transform: uppercase;
    }}
    
    /* Barra Lateral Sobria #101621 */
    [data-testid="stSidebar"] {{
        background-color: #101621;
        border-right: 2px solid #876205;
    }}
    
    /* Pestañas (Tabs) Estilo Profesional */
    .stTabs [data-baseweb="tab-list"] {{ gap: 10px; }}
    .stTabs [data-baseweb="tab"] {{
        background-color: #f1f3f6;
        border-radius: 5px;
        color: #101621;
        font-weight: bold;
    }}
    .stTabs [aria-selected="true"] {{
        background-color: #876205 !important;
        color: white !important;
    }}

    /* Ajuste de Logo en Sidebar */
    [data-testid="stSidebar"] img {{
        border-radius: 10px;
        border: 1px solid #876205;
    }}
    </style>
""", unsafe_allow_html=True)

LINK_RAW = "https://raw.githubusercontent.com/CJPANTA/cj-project/main/BASE_DATOS/"

# --- SIDEBAR (LOGO Y NAVEGACIÓN) ---
with st.sidebar:
    # Carga automática del logo desde 04_PORTADAS
    logo_path = obtener_imagen_base64("logo_cj.jpg")
    if logo_path:
        st.image(logo_path, use_container_width=True)
    
    st.markdown("<h4 style='text-align:center; color:white;'>CENTRO DE GESTIÓN</h4>", unsafe_allow_html=True)
    st.divider()
    menu = st.radio("MÓDULOS", ["🏠 PORTADA", "🦴 ANATOMÍA", "📖 REPOSITORIO", "📚 BIBLIOTECA"])
    st.sidebar.markdown("---")
    st.sidebar.caption("Lic. Jorge Luis Chiroque Panta")

# --- SECCIÓN: PORTADA ---
if menu == "🏠 PORTADA":
    st.markdown('<h1 class="titulo-cj">PROYECTO CJ</h1>', unsafe_allow_html=True)
    st.markdown("<p style='text-align:center; color:#555; font-size:18px; letter-spacing: 4px;'>FISIOTERAPIA & TECNOLOGÍA</p>", unsafe_allow_html=True)
    
    st.image("https://images.unsplash.com/photo-1576091160550-2173dbc999ef?q=80&w=2000", use_container_width=True)
    
    col1, col2 = st.columns([2, 1])
    with col1:
        st.subheader("Eficiencia Académica")
        st.write("Entorno centralizado para el análisis de anatomía y gestión de recursos Carrión.")
    with col2:
        logo_c = obtener_imagen_base64("logo_carrion.png")
        if logo_c: st.image(logo_c, width=150)

# --- SECCIÓN: REPOSITORIO ---
elif menu == "📖 REPOSITORIO":
    st.markdown("<h2 style='color:#876205;'>📚 REPOSITORIO CARRIÓN</h2>", unsafe_allow_html=True)
    ruta_c = os.path.join(BASE_DIR, "BASE_DATOS", "01_CARRION")
    if os.path.exists(ruta_c):
        ciclos = sorted([d for d in os.listdir(ruta_c) if os.path.isdir(os.path.join(ruta_c, d))])
        if ciclos:
            tabs = st.tabs(ciclos)
            for i, ciclo in enumerate(ciclos):
                with tabs[i]:
                    ruta_ciclo = os.path.join(ruta_c, ciclo)
                    archivos = [f for f in os.listdir(ruta_ciclo) if f.endswith('.pdf')]
                    cols = st.columns(4)
                    for j, arc in enumerate(archivos):
                        with cols[j % 4]:
                            with st.container(border=True):
                                st.write(f"**{arc[:18]}**")
                                url_f = f"{LINK_RAW}01_CARRION/{ciclo}/{arc}".replace(" ","%20")
                                if st.button("Ver", key=f"btn_{i}_{j}"):
                                    st.markdown(f'<iframe src="{url_f}" width="100%" height="500px"></iframe>', unsafe_allow_html=True)
                                st.link_button("Bajar", url_f)
