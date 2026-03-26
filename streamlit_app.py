import streamlit as st
import sys
import os

# --- CONFIGURACIÓN BASADA EN TU TXT ---
st.set_page_config(page_title="SISTEMA CJ - Lic. Jorge Luis", layout="wide")

# Mantenemos tus estilos originales (Azul: #06101c, Dorado: #6e4f02)
st.markdown(f"""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@300;400;600&display=swap');
    .stApp {{ background-color: #06101c !important; color: #FFFFFF; }}
    [data-testid="stSidebar"] {{ background-color: #06101c !important; border-right: 1px solid #6e4f02 !important; min-width: 300px !important; }}
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

# --- MÓDULO REPOSITORIO AFINADO ---
if menu == "📖 REPOSITORIO CARRION":
    if 'ciclo_activo' not in st.session_state:
        st.markdown('<h1 style="color: #6e4f02; font-family: serif; text-align: center;">REPOSITORIO ACADÉMICO</h1>', unsafe_allow_html=True)
        
        ciclos = ["01", "02", "03", "04"]
        c1, c2 = st.columns(2)
        for i, num in enumerate(ciclos):
            with (c1 if i % 2 == 0 else c2):
                st.markdown(f'<div class="contenedor-tarjeta"><div class="card-num">CICLO {num}</div></div>', unsafe_allow_html=True)
                if st.button(f"Entrar {num}", key=f"btn_{num}"):
                    st.session_state['ciclo_activo'] = num
                    st.rerun()
    else:
        ciclo = st.session_state['ciclo_activo']
        st.markdown(f'<h2 style="color: #6e4f02;">CURSOS: CICLO {ciclo}</h2>', unsafe_allow_html=True)
        if st.button("⬅ VOLVER"):
            del st.session_state['ciclo_activo']
            st.rerun()

        # --- LÓGICA DE CONEXIÓN URGENTE ---
        # Probamos las rutas posibles según tu captura de pantalla
        rutas_a_probar = [
            os.path.join("01_CARRION", f"CICLO_{ciclo}"),
            os.path.join("01_CARRION", f"ciclo_{ciclo}"),
            f"01_CARRION/CICLO_{ciclo}"
        ]
        
        carpeta_final = None
        for r in rutas_a_probar:
            if os.path.exists(r):
                carpeta_final = r
                break
        
        if carpeta_final:
            archivos = [f for f in os.listdir(carpeta_final) if f.lower().endswith(".pdf")]
            if archivos:
                st.success(f"✅ Conexión establecida con {carpeta_final}")
                for pdf in archivos:
                    with st.expander(f"📄 {pdf}"):
                        path_completo = os.path.join(carpeta_final, pdf)
                        with open(path_completo, "rb") as f:
                            st.download_button(f"Estudiar {pdf}", data=f, file_name=pdf, key=f"dl_{pdf}")
            else:
                st.warning(f"La carpeta {carpeta_final} está vacía.")
        else:
            st.error(f"⚠️ No se encontró la carpeta del Ciclo {ciclo}. Revisa que en GitHub el nombre sea exactamente '01_CARRION'.")
            # Lista los archivos de la raíz para diagnosticar el error
            st.write("Archivos detectados en la raíz:", os.listdir("."))

else:
    st.markdown('<h1 style="text-align:center; color:#6e4f02;">PROYECTO CJ</h1>', unsafe_allow_html=True)
