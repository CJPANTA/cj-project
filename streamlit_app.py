import streamlit as st
import os

# --- CONFIGURACIÓN Y ESTILO (TU DISEÑO ORIGINAL) ---
st.set_page_config(page_title="SISTEMA CJ - Lic. Jorge Luis", layout="wide")

st.markdown(f"""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@300;400;600&display=swap');
    .stApp {{ background-color: #06101c !important; color: #FFFFFF; }}
    [data-testid="stSidebar"] {{ background-color: #06101c !important; border-right: 1px solid #6e4f02 !important; }}
    
    .stButton>button {{
        position: absolute; top: 0; left: 0; width: 100%; height: 200px;
        background-color: transparent !important; color: transparent !important;
        border: none !important; z-index: 10; cursor: pointer;
    }}
    .contenedor-tarjeta {{
        height: 200px; border: 1px solid #6e4f02; background: rgba(110, 79, 2, 0.05);
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        text-align: center; margin-bottom: 20px; position: relative; transition: 0.4s;
    }}
    .contenedor-tarjeta:hover {{ background: rgba(110, 79, 2, 0.18); transform: scale(1.02); }}
    .card-num {{ font-family: 'Playfair Display', serif; color: #6e4f02; font-size: 38px; font-weight: bold; }}
    .card-title {{ font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 600; color: #D4AF37; text-transform: uppercase; }}
    </style>
    """, unsafe_allow_html=True)

# --- SIDEBAR ---
with st.sidebar:
    st.markdown("<h3 style='text-align: center; color: #6e4f02;'>SISTEMA CJ</h3>", unsafe_allow_html=True)
    menu = st.radio("NAVEGACIÓN", ["🏠 INICIO", "📖 REPOSITORIO CARRION"])

# --- LÓGICA DE REPOSITORIO ---
if menu == "📖 REPOSITORIO CARRION":
    if 'ciclo_activo' not in st.session_state:
        st.markdown('<h1 style="color: #6e4f02; font-family: serif; text-align: center;">REPOSITORIO ACADÉMICO</h1>', unsafe_allow_html=True)
        col1, col2 = st.columns(2)
        
        ciclos = [
            {"id": "01", "tit": "FUNDAMENTOS"}, {"id": "02", "tit": "ANATOMÍA"},
            {"id": "03", "tit": "AGENTES I"}, {"id": "04", "tit": "CLÍNICA IV"}
        ]
        
        for i, c in enumerate(ciclos):
            with (col1 if i % 2 == 0 else col2):
                st.markdown(f'<div class="contenedor-tarjeta"><div class="card-num">CICLO {c["id"]}</div><div class="card-title">{c["tit"]}</div></div>', unsafe_allow_html=True)
                if st.button(f"Entrar {c['id']}", key=f"btn_{c['id']}"):
                    st.session_state['ciclo_activo'] = c['id']
                    st.rerun()
    else:
        st.header(f"📂 CURSOS DETECTADOS - CICLO {st.session_state['ciclo_activo']}")
        if st.button("⬅ VOLVER"):
            del st.session_state['ciclo_activo']
            st.rerun()

        # BÚSQUEDA RECURSIVA DE PDFs
        ruta_base = os.path.join("BASE_DATOS", "01_CARRION", f"CICLO_{st.session_state['ciclo_activo']}")
        
        encontrados = False
        if os.path.exists(ruta_base):
            # Recorremos subcarpetas (Agentes, Masoterapia, etc.)
            for root, dirs, files in os.walk(ruta_base):
                pdfs = [f for f in files if f.lower().endswith(".pdf")]
                if pdfs:
                    encontrados = True
                    nombre_curso = os.path.basename(root).replace("_", " ")
                    with st.expander(f"📚 {nombre_curso}", expanded=True):
                        for pdf in pdfs:
                            ruta_pdf = os.path.join(root, pdf)
                            with open(ruta_pdf, "rb") as f:
                                st.download_button(f"📄 {pdf}", f, file_name=pdf, key=ruta_pdf)
            
            if not encontrados:
                st.warning(f"No se hallaron archivos en las subcarpetas de {ruta_base}.")
        else:
            st.error(f"No existe la ruta: {ruta_base}")
