import streamlit as st
import sys
import os

# --- CONFIGURACIÓN E IDENTIDAD ---
st.set_page_config(page_title="SISTEMA CJ - Lic. Jorge Luis", layout="wide")

# CSS Basado en tu archivo original 
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

# --- SIDEBAR ---
with st.sidebar:
    st.markdown("<h3 style='text-align: center; color: #6e4f02;'>SISTEMA CJ</h3>", unsafe_allow_html=True)
    st.divider()
    menu = st.radio("NAVEGACIÓN", ["🏠 INICIO", "📖 REPOSITORIO CARRION"])

# --- MODULO REPOSITORIO (CORREGIDO) ---
if menu == "📖 REPOSITORIO CARRION":
    if 'ciclo_activo' not in st.session_state:
        st.markdown('<h1 style="color: #6e4f02; font-family: serif; text-align: center;">REPOSITORIO ACADÉMICO</h1>', unsafe_allow_html=True)
        
        # Generar tarjetas para los 4 ciclos [cite: 14, 15]
        ciclos = ["01", "02", "03", "04"]
        c1, c2 = st.columns(2)
        for i, num in enumerate(ciclos):
            with (c1 if i % 2 == 0 else c2):
                st.markdown(f"""<div class="contenedor-tarjeta"><div class="card-num">CICLO {num}</div></div>""", unsafe_allow_html=True)
                if st.button(f"Entrar {num}", key=f"btn_{num}"):
                    st.session_state['ciclo_activo'] = num
                    st.rerun()
    else:
        # PANTALLA DE ESTUDIO
        ciclo = st.session_state['ciclo_activo']
        st.markdown(f'<h2 style="color: #6e4f02;">CURSOS: CICLO {ciclo}</h2>', unsafe_allow_html=True)
        if st.button("⬅ VOLVER"):
            del st.session_state['ciclo_activo']
            st.rerun()

        # RUTA CORRECTA: 01_CARRION/CICLO_XX 
        ruta_ciclo = os.path.join("01_CARRION", f"CICLO_{ciclo}")
        
        try:
            if os.path.exists(ruta_ciclo):
                archivos = [f for f in os.listdir(ruta_ciclo) if f.endswith(".pdf")]
                if archivos:
                    st.success(f"📚 {len(archivos)} archivos encontrados en {ruta_ciclo}")
                    for pdf in archivos:
                        with st.expander(f"📄 {pdf}"):
                            with open(os.path.join(ruta_ciclo, pdf), "rb") as f:
                                st.download_button(f"Abrir {pdf}", data=f, file_name=pdf, key=f"dl_{pdf}")
                else:
                    st.warning(f"No hay PDFs en la carpeta {ruta_ciclo}")
            else:
                st.error(f"No se encontró la carpeta: {ruta_ciclo}")
        except Exception as e:
            st.error(f"Error de acceso: {e}")

else:
    st.markdown('<h1 style="text-align:center; color:#6e4f02;">PROYECTO CJ</h1>', unsafe_allow_html=True)
