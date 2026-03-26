import streamlit as st
import sys
import os

# --- CONFIGURACIÓN E IDENTIDAD ---
st.set_page_config(page_title="SISTEMA CJ - Lic. Jorge Luis", layout="wide")

# CSS Basado en tu archivo original con tus colores [cite: 1, 2]
st.markdown(f"""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@300;400;600&display=swap');
    .stApp {{ background-color: #06101c !important; color: #FFFFFF; }}
    [data-testid="stSidebar"] {{ background-color: #06101c !important; border-right: 1px solid #6e4f02 !important; }}
    
    .contenedor-tarjeta {{
        height: 200px; border: 1px solid #6e4f02; background: rgba(110, 79, 2, 0.05);
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        text-align: center; transition: 0.4s; margin-bottom: 20px; position: relative;
    }}
    .card-num {{ font-family: 'Playfair Display', serif; color: #6e4f02; font-size: 38px; font-weight: bold; }}
    .card-title {{ font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 600; color: #D4AF37; text-transform: uppercase; }}
    </style>
    """, unsafe_allow_html=True)

# --- NAVEGACIÓN ---
with st.sidebar:
    st.markdown("<h3 style='text-align: center; color: #6e4f02;'>SISTEMA CJ</h3>", unsafe_allow_html=True)
    menu = st.radio("NAVEGACIÓN", ["🏠 INICIO", "📖 REPOSITORIO CARRION"])

# --- MODULO REPOSITORIO ---
if menu == "📖 REPOSITORIO CARRION":
    if 'ciclo_activo' not in st.session_state:
        st.markdown('<h1 style="color: #6e4f02; font-family: serif; text-align: center;">REPOSITORIO ACADÉMICO</h1>', unsafe_allow_html=True)
        
        # Tarjeta del Ciclo 04 
        col1, col2 = st.columns(2)
        with col1:
            st.markdown("""<div class="contenedor-tarjeta"><div class="card-num">CICLO 04</div><div class="card-title">CLÍNICA IV</div></div>""", unsafe_allow_html=True)
            if st.button("Entrar 04", key="btn_04"):
                st.session_state['ciclo_activo'] = "04"
                st.rerun()
    else:
        # PANTALLA DE ESTUDIO (Lo que necesitas para el celular)
        st.markdown(f'<h2 style="color: #6e4f02;">CURSOS: CICLO {st.session_state["ciclo_activo"]}</h2>', unsafe_allow_html=True)
        if st.button("⬅ VOLVER"):
            del st.session_state['ciclo_activo']
            st.rerun()

        # LÓGICA DE ARCHIVOS (Busca en la raíz y en 02_SISTEMAS)
        directorio = "02_SISTEMAS"
        try:
            archivos = [f for f in os.listdir(directorio) if f.endswith(".pdf")] if os.path.exists(directorio) else []
            if archivos:
                st.success(f"📚 {len(archivos)} archivos encontrados para estudiar.")
                for pdf in archivos:
                    with st.expander(f"📄 {pdf}"):
                        with open(os.path.join(directorio, pdf), "rb") as f:
                            st.download_button("📖 Abrir/Descargar PDF", data=f, file_name=pdf, key=pdf)
            else:
                st.warning("⚠️ No hay PDFs en la carpeta '02_SISTEMAS'. Verifica tu GitHub.")
        except Exception as e:
            st.error("Error al acceder a los archivos.")

else:
    st.markdown('<h1 style="text-align:center; color:#6e4f02;">PROYECTO CJ</h1>', unsafe_allow_html=True)
    st.info("Selecciona 'REPOSITORIO CARRION' en el menú para empezar a estudiar.")
