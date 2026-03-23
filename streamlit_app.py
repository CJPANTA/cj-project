import streamlit as st
import os
import base64

# 1. CONFIGURACIÓN DE PÁGINA (ESTILO PROFESIONAL)
st.set_page_config(page_title="CJ PROJECT", page_icon="🏥", layout="wide")

# Estética en Negro y Dorado
st.markdown("""
    <style>
    .main { background-color: #0e1117; color: white; }
    .stSelectbox label { color: #d4af37 !important; font-weight: bold; }
    .stButton>button { background-color: #d4af37; color: black; font-weight: bold; width: 100%; }
    </style>
    """, unsafe_allow_html=True)

st.title("🏥 CJ PROJECT - Biblioteca Carrión")

# 2. FUNCIÓN PARA MOSTRAR EL PDF EN PANTALLA
def display_pdf(file_path):
    with open(file_path, "rb") as f:
        base64_pdf = base64.b64encode(f.read()).decode('utf-8')
    pdf_display = f'<iframe src="data:application/pdf;base64,{base64_pdf}" width="100%" height="900" type="application/pdf"></iframe>'
    st.markdown(pdf_display, unsafe_allow_html=True)

# 3. NAVEGACIÓN AUTOMÁTICA DE CARPETAS
# Busca todas las carpetas que empiecen con "CICLO_"
carpetas_ciclo = [d for d in os.listdir('.') if os.path.isdir(d) and d.startswith('CICLO_')]
carpetas_ciclo.sort()

st.sidebar.header("📂 Menú de Estudios")
if carpetas_ciclo:
    ciclo_sel = st.sidebar.selectbox("Selecciona el Ciclo", carpetas_ciclo)
    
    # Explorar cursos dentro del ciclo seleccionado
    ruta_ciclo = ciclo_sel
    cursos = [d for d in os.listdir(ruta_ciclo) if os.path.isdir(os.path.join(ruta_ciclo, d))]
    
    if cursos:
        curso_sel = st.sidebar.selectbox("Selecciona el Curso", cursos)
        ruta_curso = os.path.join(ruta_ciclo, curso_sel)
        
        # Buscar archivos PDF dentro del curso
        archivos_pdf = [f for f in os.listdir(ruta_curso) if f.lower().endswith('.pdf')]
        
        if archivos_pdf:
            st.subheader(f"📖 Material de: {curso_sel}")
            pdf_final = st.selectbox("Elige un documento para leer", archivos_pdf)
            ruta_pdf = os.path.join(ruta_curso, pdf_final)
            
            # Botón para visualizar
            if st.button(f"Visualizar {pdf_final}"):
                display_pdf(ruta_pdf)
        else:
            st.warning("No se encontraron archivos PDF en esta carpeta.")
    else:
        st.info("Crea subcarpetas de cursos dentro de este ciclo para ver el contenido.")
else:
    st.error("No se detectaron carpetas de 'CICLO_'. Revisa tus nombres en GitHub.")

st.sidebar.markdown("---")
st.sidebar.write("🟢 **Sesión:** Jorge Luis - Admin")
