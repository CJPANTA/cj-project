import streamlit as st
import sys
import os
from MODULOS.motor_huesos import obtener_imagen_base64, BASE_DIR

st.set_page_config(page_title="CJ PROJECT - MASTER", layout="wide")

# --- ESTILO GAMA ALTA CJ ---
st.markdown(f"""
    <style>
    /* Estilo del Título Dorado Marcado */
    .titulo-cj {{
        font-family: 'Inter', sans-serif;
        color: #876205;
        text-align: center;
        font-size: 75px;
        font-weight: 900; /* Letra extra gruesa */
        letter-spacing: -2px;
        margin-bottom: 0px;
        text-transform: uppercase;
    }}
    
    /* Barra Lateral Sobria */
    [data-testid="stSidebar"] {{
        background-color: #101621;
        border-right: 2px solid #876205;
    }}
    
    /* Personalización de Pestañas (Tabs) */
    .stTabs [data-baseweb="tab-list"] {{ gap: 10px; }}
    .stTabs [data-baseweb="tab"] {{
        background-color: #f1f3f6;
        border-radius: 5px;
        padding: 8px 15px;
        font-weight: bold;
        color: #101621;
    }}
    .stTabs [aria-selected="true"] {{
        background-color: #876205 !important;
        color: white !important;
    }}

    /* Imágenes de Sidebar */
    [data-testid="stSidebar"] img {{
        border-radius: 5px;
        margin-bottom: 20px;
    }}
    </style>
""", unsafe_allow_html=True)

# URL para archivos en GitHub
LINK_RAW = "https://raw.githubusercontent.com/CJPANTA/cj-project/main/BASE_DATOS/"

# --- NAVEGACIÓN (LOGO EN SIDEBAR) ---
with st.sidebar:
    logo_path = obtener_imagen_base64("logo_cj.jpg")
    if logo_path:
        st.image(logo_path, use_container_width=True)
    else:
        st.error("Logo no detectado en 04_PORTADAS")
    
    st.markdown("<h4 style='text-align:center; color:white;'>CENTRO DE GESTIÓN</h4>", unsafe_allow_html=True)
    menu = st.radio("SELECCIONE MÓDULO", ["🏠 PORTADA", "🦴 ANATOMÍA", "📖 REPOSITORIO", "📚 BIBLIOTECA"])
    st.divider()
    st.caption("Lic. Jorge Luis Chiroque Panta")

# --- SECCIÓN: PORTADA ---
if menu == "🏠 PORTADA":
    st.markdown('<h1 class="titulo-cj">PROYECTO CJ</h1>', unsafe_allow_html=True)
    st.markdown("<p style='text-align:center; color:#555; font-size:20px;'>Fisioterapia & Tecnología</p>", unsafe_allow_html=True)
    
    # Imagen Principal Profesional
    st.image("https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?q=80&w=2000", use_container_width=True)
    
    col1, col2 = st.columns([2, 1])
    with col1:
        st.subheader("Optimización Académica CJ")
        st.write("Bienvenido al centro de mando. Este entorno ha sido diseñado para centralizar tus estudios de Carrión y herramientas clínicas con la máxima eficiencia visual.")
    with col2:
        logo_c = obtener_imagen_base64("logo_carrion.png")
        if logo_c: st.image(logo_c, width=160)

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
                    grid = st.columns(4)
                    for j, arc in enumerate(archivos):
                        with grid[j % 4]:
                            with st.container(border=True):
                                st.write(f"**{arc[:15]}...**")
                                url_f = f"{LINK_RAW}01_CARRION/{ciclo}/{arc}".replace(" ","%20")
                                if st.button("👁️ Leer", key=f"btn_{i}_{j}"):
                                    st.markdown(f'<iframe src="{url_f}" width="100%" height="500px"></iframe>', unsafe_allow_html=True)
                                st.link_button("📥 Bajar", url_f, use_container_width=True)
