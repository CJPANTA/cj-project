import streamlit as st
import os

# 1. Configuración de Nivel Administrador
st.set_page_config(page_title="CJ PROJECT | Panel", page_icon="🏦", layout="wide")

# 2. CSS Avanzado: Estética Profesional y "Letra Bonita"
st.markdown("""
    <style>
    /* Fondo y Letra General */
    .main { background-color: #0e1117; color: #e0e0e0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    
    /* Títulos y Subtítulos */
    h1, h2, h3 { color: #d4af37 !important; font-weight: 700; }
    
    /* Estilo de Tarjetas de Cursos (Botones) */
    div.stButton > button {
        background-color: #1c2128;
        color: #d4af37;
        border: 2px solid #30363d;
        border-radius: 12px;
        padding: 25px;
        font-size: 18px;
        font-weight: bold;
        width: 100%;
        text-align: left;
        transition: all 0.3s ease;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    }
    div.stButton > button:hover {
        background-color: #24292e;
        border-color: #d4af37;
        transform: translateY(-3px);
    }

    /* Indicadores (KPIs) */
    .stMetric { background-color: #1c2128; padding: 20px; border-radius: 12px; border: 1px solid #30363d; }
    .stMetric label { color: #8b949e !important; }
    .stMetric .stMetricValue { color: #d4af37 !important; }

    /* Barra Lateral */
    .css-1d391kg { background-color: #161b22; }
    .stSelectbox label { color: #d4af37 !important; font-weight: bold; }
    </style>
    """, unsafe_allow_html=True)

# 3. Encabezado del Dashboard
st.title("🏦 CJ PROJECT - Sistema de Gestión")
st.write(f"Bienvenido, Administrador Jorge Luis. Panel de Control de Recursos Académicos.")

# --- SECCIÓN 1: INDICADORES CLAVE (v0 style) ---
col1, col2, col3, col4 = st.columns(4)
col1.metric("Ciclos Activos", "4")
col2.metric("Sedes", "Aucallama / Lima")
col3.metric("Base de Datos", "Conectada")
col4.metric("Estado", "🟢 Online")

st.markdown("---")

# --- SECCIÓN 2: EXPLORADOR VISUAL (Tu Idea de Tarjetas) ---
st.sidebar.header("📂 NAVEGACIÓN")

# Lógica automática para detectar tus ciclos
carpetas_ciclo = [d for d in os.listdir('.') if os.path.isdir(d) and d.startswith('CICLO_')]
carpetas_ciclo.sort()

if carpetas_ciclo:
    # FILTRO 1: Ciclo (en la barra lateral)
    ciclo_sel = st.sidebar.selectbox("Seleccionar Ciclo", carpetas_ciclo)
    st.header(f"🗂️ Cursos del {ciclo_sel}")

    # Dentro del ciclo, buscamos los cursos para crear las TARJETAS
    ruta_ciclo = ciclo_sel
    cursos = [d for d in os.listdir(ruta_ciclo) if os.path.isdir(os.path.join(ruta_ciclo, d))]
    
    if cursos:
        # CREACIÓN DE TARJETAS (Grilla de 2 columnas)
        cols_cursos = st.columns(2)
        for i, curso in enumerate(cursos):
            with cols_cursos[i % 2]:
                # Cada curso es un BOTÓN grande (tarjeta)
                if st.button(f"📖 {curso}", key=curso):
                    # Al darle clic, guardamos el curso seleccionado en la "memoria" de la App
                    st.session_state['curso_activo'] = curso
                    st.session_state['ruta_curso_activo'] = os.path.join(ruta_ciclo, curso)

        # MOSTRAR TEMAS (PDFs) DEL CURSO SELECCIONADO
        if 'curso_activo' in st.session_state:
            st.markdown("---")
            st.subheader(f"📋 Temas Disponibles: {st.session_state['curso_activo']}")
            
            ruta_curso = st.session_state['ruta_curso_activo']
            archivos_pdf = [f for f in os.listdir(ruta_curso) if f.lower().endswith('.pdf')]
            
            if archivos_pdf:
                # Mostramos los PDFs como una lista limpia
                for pdf in archivos_pdf:
                    col_pdf, col_btn = st.columns([3, 1])
                    col_pdf.write(f"📄 {pdf}")
                    
                    # Botón Dorado para abrir el PDF en pestaña nueva
                    with open(os.path.join(ruta_curso, pdf), "rb") as file:
                        col_btn.download_button(
                            label="Abrir",
                            data=file,
                            file_name=pdf,
                            mime="application/pdf",
                            key=pdf # Clave única para cada botón
                        )
            else:
                st.warning("No se encontraron archivos PDF en este curso.")
    else:
        st.info("Crea subcarpetas de cursos dentro de este ciclo en GitHub.")
else:
    st.error("Error: No se detectan las carpetas CICLO_XX. Revisa tus nombres en GitHub.")

st.sidebar.markdown("---")
st.sidebar.write("👤 Jorge Luis - Admin")
