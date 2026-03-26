import streamlit as st
import os

# --- CONFIGURACIÓN BASE (TU ESTILO) ---
st.set_page_config(page_title="SISTEMA CJ - Lic. Jorge Luis", layout="wide")

st.markdown(f"""
    <style>
    .stApp {{ background-color: #06101c !important; color: #FFFFFF; }}
    [data-testid="stSidebar"] {{ background-color: #06101c !important; border-right: 1px solid #6e4f02 !important; }}
    
    /* DISEÑO DE TARJETA */
    .contenedor-tarjeta {{
        height: 180px; border: 1px solid #6e4f02; background: rgba(110, 79, 2, 0.05);
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        text-align: center; margin-bottom: 10px; border-radius: 5px;
    }}
    .card-num {{ color: #6e4f02; font-size: 32px; font-weight: bold; font-family: serif; }}
    .card-title {{ color: #D4AF37; font-size: 14px; font-weight: 600; text-transform: uppercase; }}
    </style>
    """, unsafe_allow_html=True)

# --- NAVEGACIÓN ---
with st.sidebar:
    st.markdown("<h3 style='text-align: center; color: #6e4f02;'>SISTEMA CJ</h3>", unsafe_allow_html=True)
    menu = st.radio("NAVEGACIÓN", ["🏠 INICIO", "📖 REPOSITORIO CARRION"])

# --- MODULO REPOSITORIO ---
if menu == "📖 REPOSITORIO CARRION":
    if 'ciclo_activo' not in st.session_state:
        st.markdown('<h1 style="color: #6e4f02; text-align: center;">REPOSITORIO ACADÉMICO</h1>', unsafe_allow_html=True)
        
        col1, col2 = st.columns(2)
        # Ciclo 04
        with col1:
            st.markdown('<div class="contenedor-tarjeta"><div class="card-num">CICLO 04</div><div class="card-title">CLÍNICA IV</div></div>', unsafe_allow_html=True)
            if st.button("ACCEDER AL CICLO 04", use_container_width=True):
                st.session_state['ciclo_activo'] = "04"
                st.rerun()
    else:
        st.subheader(f"📂 ARCHIVOS: CICLO {st.session_state['ciclo_activo']}")
        if st.button("⬅ VOLVER"):
            del st.session_state['ciclo_activo']
            st.rerun()

        # CONEXIÓN DIRECTA A TU CARPETA
        ruta_carrion = os.path.join("BASE_DATOS", "01_CARRION", f"CICLO_{st.session_state['ciclo_activo']}")
        
        if os.path.exists(ruta_carrion):
            archivos = [f for f in os.listdir(ruta_carrion) if f.lower().endswith('.pdf')]
            if archivos:
                for pdf in archivos:
                    with open(os.path.join(ruta_carrion, pdf), "rb") as f:
                        st.download_button(label=f"📖 Descargar {pdf}", data=f, file_name=pdf, key=pdf)
            else:
                st.warning("Carpeta vacía. No se encontraron PDFs.")
        else:
            st.error(f"No se detecta la carpeta: {ruta_carrion}")
