import streamlit as st
import sys
import os
from MODULOS.motor_huesos import cargar_imagen_raiz, listar_carpetas_carrion

# --- CONFIGURACIÓN ---
st.set_page_config(page_title="SISTEMA CJ - Jorge Luis", layout="wide")

# URL BASE PARA GITHUB RAW
LINK_RAW = "https://raw.githubusercontent.com/CJPANTA/cj-project/main/BASE_DATOS/"

# --- CSS PREMIUM (Blindaje de Diseño) ---
st.markdown("""
    <style>
    .stApp { background-color: #06101c; color: #d1d5db; }
    
    /* Título Dorado con degradado */
    .titulo-premium {
        font-family: 'serif';
        background: linear-gradient(to bottom, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center; font-weight: bold;
    }

    /* Centrado Sidebar */
    [data-testid="stSidebar"] [data-testid="stVerticalBlock"] {
        display: flex; flex-direction: column; align-items: center; text-align: center;
    }

    /* Estilo para PDFs y Botones */
    .stButton>button {
        background-color: #008080 !important; color: white !important;
        border: 1px solid #6e4f02; border-radius: 5px; width: 100%;
    }
    
    @media (max-width: 767px) { .titulo-premium { font-size: 40px; } }
    @media (min-width: 768px) { .titulo-premium { font-size: 70px; } }
    </style>
    """, unsafe_allow_html=True)

# --- SIDEBAR IDENTIDAD ---
logo_cj = cargar_imagen_raiz("logo_cj.jpg")
with st.sidebar:
    if logo_cj:
        st.markdown(f'<div style="text-align: center;"><img src="{logo_cj}" width="150"></div>', unsafe_allow_html=True)
    st.markdown("<h2 style='color: #6e4f02; margin-bottom: 0;'>PROYECTO CJ</h2>", unsafe_allow_html=True)
    st.markdown("<p style='opacity: 0.7;'>Lic. Jorge Luis Chiroque</p>", unsafe_allow_html=True)
    st.divider()
    menu = st.radio("MENÚ PRINCIPAL", ["🏠 INICIO", "📖 REPOSITORIO CARRION", "🦴 ANATOMÍA", "📚 BIBLIOTECA"])

# --- SECCIÓN: INICIO (Portada) ---
if menu == "🏠 INICIO":
    st.markdown('<h1 class="titulo-premium">PROYECTO CJ</h1>', unsafe_allow_html=True)
    st.markdown('<div style="border-radius:15px; overflow:hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">', unsafe_allow_html=True)
    st.image("https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?q=80&w=2000", use_container_width=True)
    st.markdown('</div>', unsafe_allow_html=True)
    st.divider()
    st.markdown("<h3 style='color: #6e4f02; text-align: center;'>Gestión Académica y Clínica</h3>", unsafe_allow_html=True)

# --- SECCIÓN: REPOSITORIO CARRION ---
elif menu == "📖 REPOSITORIO CARRION":
    col_t, col_l = st.columns([4, 1])
    col_t.markdown('<h1 style="color: #6e4f02;">Repositorio Institucional</h1>', unsafe_allow_html=True)
    logo_c = cargar_imagen_raiz("logo_carrion.png")
    if logo_c: col_l.image(logo_c, width=120)

    ciclos, ruta_base = listar_carpetas_carrion()
    
    # Buscador Global
    busqueda = st.text_input("🔍 Buscar documento en todos los ciclos...", placeholder="Ej: Anatomía, Masoterapia...")

    if ciclos:
        tabs = st.tabs([c.replace("_", " ").upper() for c in ciclos])
        for i, ciclo in enumerate(ciclos):
            with tabs[i]:
                ruta_ciclo = os.path.join(ruta_base, ciclo)
                archivos = [f for f in os.listdir(ruta_ciclo) if f.endswith('.pdf')]
                
                # Filtrar si hay búsqueda
                if busqueda:
                    archivos = [f for f in archivos if busqueda.lower() in f.lower()]

                if archivos:
                    cols = st.columns(3)
                    for j, arc in enumerate(archivos):
                        with cols[j % 3]:
                            with st.container(border=True):
                                st.write(f"📄 **{arc[:20]}...**")
                                url = f"{LINK_RAW}01_CARRION/{ciclo}/{arc}".replace(" ","%20")
                                if st.button("👁️ Ver", key=f"v_{i}_{j}"):
                                    st.markdown(f'<iframe src="{url}" width="100%" height="500px"></iframe>', unsafe_allow_html=True)
                                st.link_button("📥 Bajar", url)
                else:
                    st.warning("No se encontraron archivos con ese nombre.")

else:
    st.markdown(f'<h2 style="color: #6e4f02;">Sección {menu}</h2>', unsafe_allow_html=True)
    st.write("Próximamente disponible en el siguiente paso del proyecto.")
