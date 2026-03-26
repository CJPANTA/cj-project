import streamlit as st
import sys
import os

# --- CONFIGURACIÓN BASE (TU TXT) ---
st.set_page_config(page_title="SISTEMA CJ - Lic. Jorge Luis", layout="wide")

# CSS: Mantenemos tu diseño pero aseguramos que el botón sea clickable sobre la tarjeta
st.markdown(f"""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@300;400;600&display=swap');
    .stApp {{ background-color: #06101c !important; color: #FFFFFF; }}
    [data-testid="stSidebar"] {{ background-color: #06101c !important; border-right: 1px solid #6e4f02 !important; min-width: 300px !important; }}
    
    /* FIX: Botón invisible que cubre toda la tarjeta para que sea funcional */
    .stButton>button {{
        position: absolute; top: 0; left: 0; width: 100%; height: 200px;
        background-color: transparent !important; color: transparent !important;
        border: none !important; z-index: 10; cursor: pointer;
    }}
    .contenedor-tarjeta {{
        height: 200px; border: 1px solid #6e4f02; background: rgba(110, 79, 2, 0.05);
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        text-align: center; margin-bottom: 20px; position: relative;
    }}
    .card-num {{ font-family: 'Playfair Display', serif; color: #6e4f02; font-size: 38px; font-weight: bold; }}
    .card-title {{ font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 600; color: #D4AF37; text-transform: uppercase; }}
    </style>
    """, unsafe_allow_html=True)

# --- NAVEGACIÓN ---
with st.sidebar:
    st.markdown("<h3 style='text-align: center; color: #6e4f02; font-family: serif;'>SISTEMA CJ</h3>", unsafe_allow_html=True)
    st.divider()
    menu = st.radio("NAVEGACIÓN", ["🏠 INICIO", "📖 REPOSITORIO CARRION"])

# --- MODULO REPOSITORIO FUNCIONAL ---
if menu == "📖 REPOSITORIO CARRION":
    if 'ciclo_activo' not in st.session_state:
        st.markdown('<h1 style="color: #6e4f02; font-family: serif; text-align: center;">REPOSITORIO ACADÉMICO</h1>', unsafe_allow_html=True)
        
        col1, col2 = st.columns(2)
        # Ciclo 04 - Único con conexión activa por ahora
        with col1:
            st.markdown('<div class="contenedor-tarjeta"><div class="card-num">CICLO 04</div><div class="card-title">CLÍNICA IV</div></div>', unsafe_allow_html=True)
            if st.button("Entrar 04", key="btn_04"):
                st.session_state['ciclo_activo'] = "04"
                st.rerun()
    else:
        st.markdown(f'<h2 style="color: #6e4f02; font-family: serif;">CURSOS: CICLO {st.session_state["ciclo_activo"]}</h2>', unsafe_allow_html=True)
        if st.button("⬅ VOLVER"):
            del st.session_state['ciclo_activo']
            st.rerun()

        # CONEXIÓN A ARCHIVOS
        ruta_ciclo = os.path.join("BASE_DATOS", "01_CARRION", f"CICLO_{st.session_state['ciclo_activo']}")
        
        if os.path.exists(ruta_ciclo):
            archivos = [f for f in os.listdir(ruta_ciclo) if f.lower().endswith(".pdf")]
            if archivos:
                st.success(f"Conexión establecida. {len(archivos)} clases encontradas.")
                for pdf in archivos:
                    with open(os.path.join(ruta_ciclo, pdf), "rb") as f:
                        st.download_button(f"📄 Abrir {pdf}", data=f, file_name=pdf, key=pdf)
            else:
                st.warning("Carpeta encontrada, pero no contiene archivos PDF.")
        else:
            st.error(f"Error de ruta: No se encontró {ruta_ciclo}")
