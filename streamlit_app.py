import streamlit as st
import sys
import os
from MODULOS.motor_huesos import cargar_imagen_local, cargar_csv, BASE_DIR

st.set_page_config(page_title="CJ PROJECT - COMMAND CENTER", layout="wide")

# --- CSS: ESTÉTICA DARK TECH CJ ---
st.markdown("""
    <style>
    /* Fondo Principal y Sidebar */
    .stApp { background-color: #0E1117; color: #E0E0E0; }
    [data-testid="stSidebar"] { background-color: #1A1C24; border-right: 2px solid #00F2FF; }
    
    /* Título con Neón del Logo */
    .titulo-tech {
        font-family: 'Courier New', Courier, monospace;
        color: #00F2FF; /* Cian Neón */
        text-align: center;
        font-size: 60px;
        font-weight: bold;
        text-shadow: 0 0 10px #00F2FF, 0 0 20px #00F2FF;
        margin-bottom: 0px;
    }
    .naranja-tech { color: #FF6600; text-shadow: 0 0 10px #FF6600; }
    
    /* Tarjetas y Contenedores */
    div[data-testid="stVerticalBlock"] > div {
        background-color: #1E2129;
        border-radius: 10px;
        border: 1px solid #333;
    }
    
    /* Botones Estilo Gadget */
    .stButton>button {
        background-color: #00F2FF; color: #000;
        font-weight: bold; border-radius: 5px;
        border: none; transition: 0.3s;
    }
    .stButton>button:hover { background-color: #FF6600; color: white; }
    </style>
""", unsafe_allow_html=True)

LINK_RAW = "https://raw.githubusercontent.com/CJPANTA/cj-project/main/BASE_DATOS/"

# --- SIDEBAR IDENTIDAD ---
with st.sidebar:
    logo_cj = cargar_imagen_local("logo_cj.jpg")
    if logo_cj: st.image(logo_cj, use_container_width=True)
    st.markdown("<h2 style='text-align:center; color:#00F2FF;'>COMMAND CENTER</h2>", unsafe_allow_html=True)
    st.write(f"**👤 LIC. JORGE LUIS**")
    st.divider()
    menu = st.radio("SISTEMA", ["🏠 DASHBOARD", "🦴 ANATOMÍA", "📖 CARRION", "📚 BIBLIOTECA"])

# --- SECCIÓN: DASHBOARD (PORTADA) ---
if menu == "🏠 DASHBOARD":
    st.markdown('<h1 class="titulo-tech">PROJECT <span class="naranja-tech">CJ</span></h1>', unsafe_allow_html=True)
    st.markdown("<p style='text-align:center; color:#888;'>v2.0 | High Efficiency Study System</p>", unsafe_allow_html=True)
    
    # Imagen de impacto tecnológica
    st.image("https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2000&auto=format&fit=crop", use_container_width=True)
    
    col1, col2 = st.columns([2, 1])
    with col1:
        st.subheader("🚀 Estado del Proyecto")
        st.info("Módulos de Anatomía y Repositorio Carrión sincronizados con GitHub.")
    with col2:
        logo_c = cargar_imagen_local("logo_carrion.png")
        if logo_c: st.image(logo_c, width=150)

# --- SECCIÓN: ANATOMÍA (ESTILO TARJETAS DARK) ---
elif menu == "🦴 ANATOMÍA":
    st.title("🦴 Anatomía Maestro")
    df = cargar_csv()
    if df is not None:
        busqueda = st.text_input("🔍 SCANNER DE DATOS:", placeholder="Ingrese hueso o región...")
        if busqueda:
            df = df[df.apply(lambda r: busqueda.lower() in r.astype(str).lower().values, axis=1)]
        
        cols = st.columns(3)
        for i, (_, row) in enumerate(df.iterrows()):
            with cols[i % 3]:
                with st.container(border=True):
                    st.markdown(f"<h3 style='color:#00F2FF;'>{row['Nombre_Hueso']}</h3>", unsafe_allow_html=True)
                    st.write(f"**📍 Región:** {row['Region']}")
                    st.warning(f"**Píldora BRI:** {row['Accion_Sugerida']}")
                    
                    url_p = f"{LINK_RAW}01_CARRION/{row['Link_PDF_Carrion']}".replace(" ","%20")
                    st.link_button("📄 ABRIR DATA", url_p, use_container_width=True)

# --- SECCIÓN: CARRION (PESTAÑAS TECH) ---
elif menu == "📖 CARRION":
    st.title("📖 Repositorio Carrión")
    ruta_c = os.path.join(BASE_DIR, "BASE_DATOS", "01_CARRION")
    ciclos = sorted([d for d in os.listdir(ruta_c) if os.path.isdir(os.path.join(ruta_c, d))])
    
    if ciclos:
        tabs = st.tabs([f"📡 {c}" for c in ciclos])
        for i, ciclo in enumerate(ciclos):
            with tabs[i]:
                ruta_ciclo = os.path.join(ruta_c, ciclo)
                pdfs = [f for f in os.listdir(ruta_ciclo) if f.endswith('.pdf')]
                grid = st.columns(4)
                for j, pdf in enumerate(pdfs):
                    with grid[j % 4]:
                        with st.container(border=True):
                            st.write(f"**{pdf[:18]}**")
                            url_pdf = f"{LINK_RAW}01_CARRION/{ciclo}/{pdf}".replace(" ","%20")
                            if st.button("👁️ VER", key=f"c_{i}_{j}"):
                                st.markdown(f'<iframe src="{url_pdf}" width="100%" height="500px"></iframe>', unsafe_allow_html=True)
