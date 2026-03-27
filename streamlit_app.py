import streamlit as st
import os
import urllib.parse
from MODULOS.motor_huesos import cargar_imagen_raiz

# --- CONFIGURACIÓN ---
st.set_page_config(page_title="SISTEMA CJ - Repositorio", layout="wide")

# URL BASE GITHUB RAW
LINK_RAW = "https://raw.githubusercontent.com/CJPANTA/cj-project/main/BASE_DATOS/01_CARRION/"

# --- CSS DEFINITIVO (Volvemos a la elegancia) ---
st.markdown(f"""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
    
    .stApp {{ background-color: #06101c !important; color: #d1d5db; }}
    
    /* TÍTULO DORADO */
    .titulo-cj {{
        font-family: 'Playfair Display', serif;
        background: linear-gradient(to bottom, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        text-align: center; font-weight: bold; font-size: 50px; margin-bottom: 20px;
    }}

    /* ESTILO DE PESTAÑAS (TABS) */
    .stTabs [data-baseweb="tab-list"] {{
        background-color: #06101c;
        border-bottom: 2px solid #6e4f02;
    }}
    .stTabs [data-baseweb="tab"] {{
        color: #d1d5db !important;
        font-weight: 600;
    }}
    .stTabs [aria-selected="true"] {{
        color: #008080 !important;
        border-bottom-color: #008080 !important;
    }}

    /* BOTONES VERDE ESMERALDA */
    div.stButton > button {{
        background-color: #008080 !important; color: white !important;
        border-radius: 8px; border: 1px solid #6e4f02; width: 100%;
    }}
    </style>
    """, unsafe_allow_html=True)

# --- SIDEBAR ---
logo_cj = cargar_imagen_raiz("logo_cj.jpg")
with st.sidebar:
    if logo_cj: st.markdown(f'<div style="text-align: center;"><img src="{logo_cj}" width="150"></div>', unsafe_allow_html=True)
    st.markdown("<h2 style='text-align: center; color: #6e4f02;'>PROYECTO CJ</h2>", unsafe_allow_html=True)
    st.divider()
    menu = st.radio("MENÚ", ["🏠 INICIO", "📖 REPOSITORIO"])

# --- INICIO (Recuperado) ---
if menu == "🏠 INICIO":
    st.markdown('<h1 class="titulo-cj">PROYECTO CJ</h1>', unsafe_allow_html=True)
    st.image("https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?q=80&w=2000", use_container_width=True)
    st.markdown("<h3 style='color: #6e4f02; text-align: center;'>Lic. Jorge Luis Chiroque</h3>", unsafe_allow_html=True)

# --- REPOSITORIO (Jerarquía por Pestañas) ---
elif menu == "📖 REPOSITORIO":
    col_t, col_l = st.columns([4, 1])
    col_t.markdown('<h1 style="color: #6e4f02; margin:0;">BIBLIOTECA CARRION</h1>', unsafe_allow_html=True)
    logo_c = cargar_imagen_raiz("logo_carrion.png")
    if logo_c: col_l.image(logo_c, width=90)

    # Pestañas de Ciclos (Mucho más estable en celular)
    t1, t2, t3, t4 = st.tabs(["CICLO 01", "CICLO 02", "CICLO 03", "CICLO 04"])

    with t1:
        st.write("### Cursos disponibles:")
        expander = st.expander("📘 MASOTERAPIA", expanded=True)
        with expander:
            # Archivo confirmado por Jorge
            archivo = "01_conceptos_basicos_masoterapia.pdf"
            c1, c2 = st.columns([3, 1])
            c1.write(f"📄 {archivo}")
            
            # URL Limpia para GitHub
            url = f"{LINK_RAW}CICLO_01/MASOTERAPIA/{urllib.parse.quote(archivo)}"
            
            if c2.button("👁️ VER", key="ver_maso"):
                st.markdown(f'<iframe src="{url}" width="100%" height="600px" style="border:2px solid #6e4f02;"></iframe>', unsafe_allow_html=True)
        
        st.expander("📘 ANATOMIA Y FISIOLOGIA").info("Contenido en carga...")
        st.expander("📘 BIOFISICA").info("Contenido en carga...")

    with t2: st.info("Ciclo 02 - Próximamente")
    with t3: st.info("Ciclo 03 - Próximamente")
    with t4: st.info("Ciclo 04 - Próximamente")
