import streamlit as st
import sys
import os
from MODULOS.motor_huesos import cargar_imagen_local, cargar_csv, BASE_DIR

st.set_page_config(page_title="CJ PROYECTOS - Lic. Jorge Luis", layout="wide")

# --- DISEÑO DE COLORES CJ (Azul, Naranja, Blanco) ---
ESTILO_CJ = """
    <style>
    .titulo-principal {
        font-family: 'Helvetica Neue', sans-serif;
        background: linear-gradient(90deg, #003366, #FF6600);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center; font-size: 70px; font-weight: 900;
        margin-bottom: 0px;
    }
    .subtitulo-cj {
        color: #003366; text-align: center; font-size: 20px; 
        font-weight: bold; margin-top: -20px; letter-spacing: 2px;
    }
    [data-testid="stSidebar"] { background-color: #f8f9fa; border-right: 2px solid #003366; }
    </style>
"""
st.markdown(ESTILO_CJ, unsafe_allow_html=True)

LINK_RAW = "https://raw.githubusercontent.com/CJPANTA/cj-project/main/BASE_DATOS/"

# --- SIDEBAR CON EL NUEVO LOGO ---
with st.sidebar:
    # Intentamos cargar el archivo del logo que acabas de subir (asumiendo que lo guardaste como logo_cj_nuevo.jpg)
    logo_data = cargar_imagen_local("logo_cj_nuevo.jpg") # O el nombre exacto que le pusiste en 04_PORTADAS
    if logo_data:
        st.image(logo_data, use_container_width=True)
    else:
        st.markdown("### 🌀 CJ PROYECTOS") # Respaldo si no hay imagen
    
    st.markdown("<br>", unsafe_allow_html=True)
    st.write(f"**👨‍⚕️ Lic. Jorge Luis Chiroque**")
    menu = st.radio("NAVEGACIÓN", ["🏠 PORTADA", "🦴 ANATOMÍA", "📖 CARRION", "📚 BIBLIOTECA"])

# --- SECCIÓN: INICIO ---
if menu == "🏠 PORTADA":
    st.markdown('<p class="titulo-principal">PROYECTO CJ</p>', unsafe_allow_html=True)
    st.markdown('<p class="subtitulo-cj">FISIOTERAPIA & REHABILITACIÓN</p>', unsafe_allow_html=True)
    
    # Imagen de Unsplash enfocada en Fisio Profesional
    st.image("https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop", use_container_width=True)
    
    col1, col2 = st.columns([2, 1])
    with col1:
        st.subheader("Optimización y Eficiencia en el Estudio")
        st.write("Bienvenido Jorge. Esta plataforma centraliza tus bases de datos de anatomía, tus clases de Carrión y la biblioteca técnica de sistemas.")
    with col2:
        logo_c = cargar_imagen_local("logo_carrion.png")
        if logo_c: st.image(logo_c, width=180)

# --- SECCIÓN: ANATOMÍA (CON TARJETAS PROFESIONALES) ---
elif menu == "🦴 ANATOMÍA":
    st.title("🦴 Anatomía Maestro")
    df = cargar_csv()
    if df is not None:
        busqueda = st.text_input("🔍 Buscar por Hueso o Región...")
        if busqueda:
            df = df[df.apply(lambda r: busqueda.lower() in r.astype(str).lower().values, axis=1)]
        
        grid = st.columns(3)
        for i, (_, row) in enumerate(df.iterrows()):
            with grid[i % 3]:
                with st.container(border=True):
                    st.image(f"https://loremflickr.com/400/250/skeleton,bone/all?lock={i}")
                    st.markdown(f"### {row['Nombre_Hueso']}")
                    st.info(f"**Píldora BRI:** {row['Accion_Sugerida']}")
                    
                    with st.expander("Detalles Técnicos"):
                        st.write(f"**Cara:** {row['Cara']}")
                        st.write(f"**Terapia:** {row['Agente_Fisico']}")
                    
                    url_p = f"{LINK_RAW}01_CARRION/{row['Link_PDF_Carrion']}".replace(" ","%20")
                    st.link_button("📄 Ver Clase", url_p, use_container_width=True)

# --- SECCIÓN: CARRION (PESTAÑAS) ---
elif menu == "📖 CARRION":
    st.title("📖 Ciclos Carrión")
    ruta_c = os.path.join(BASE_DIR, "BASE_DATOS", "01_CARRION")
    ciclos = sorted([d for d in os.listdir(ruta_c) if os.path.isdir(os.path.join(ruta_c, d))])
    
    if ciclos:
        tabs = st.tabs(ciclos)
        for i, ciclo in enumerate(ciclos):
            with tabs[i]:
                ruta_ciclo = os.path.join(ruta_c, ciclo)
                pdfs = [f for f in os.listdir(ruta_ciclo) if f.endswith('.pdf')]
                grid_c = st.columns(4)
                for j, pdf in enumerate(pdfs):
                    with grid_c[j % 4]:
                        with st.container(border=True):
                            st.image("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400", height=150)
                            st.write(f"**{pdf[:20]}**")
                            url_pdf = f"{LINK_RAW}01_CARRION/{ciclo}/{pdf}".replace(" ","%20")
                            if st.button("👁️ Leer", key=f"c_{i}_{j}"):
                                st.markdown(f'<iframe src="{url_pdf}" width="100%" height="500px"></iframe>', unsafe_allow_html=True)
                            st.link_button("📥 Bajar", url_pdf)
