import streamlit as st
import os
import urllib.parse

# 1. Configuración de App Móvil
st.set_page_config(page_title="CJ PROJECT", page_icon="🏥", layout="centered")

# 2. Estética "Premium" (Letra bonita y diseño fluido)
st.markdown("""
    <style>
    .main { background-color: #0e1117; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
    h1 { color: #d4af37; text-align: center; font-size: 26px; font-weight: 800; margin-bottom: 5px; }
    .stButton>button {
        background-color: #1c2128;
        color: #d4af37;
        border: 1px solid #30363d;
        border-radius: 12px;
        padding: 15px;
        font-weight: bold;
        width: 100%;
    }
    .pdf-card { 
        background: #1c2128; 
        padding: 20px; 
        border-radius: 15px; 
        margin-bottom: 15px; 
        border-left: 5px solid #d4af37;
        box-shadow: 0 4px 15px rgba(0,0,0,0.5);
    }
    .pdf-title { color: #ffffff; font-size: 16px; font-weight: 600; margin-bottom: 15px; }
    </style>
    """, unsafe_allow_html=True)

# --- LOGO PERSONALIZADO ---
# Aquí es donde pondremos tu logo. Por ahora usamos un icono profesional.
st.markdown("<h1>🏦 CJ PROJECT</h1>", unsafe_allow_html=True)
st.markdown("<p style='text-align: center; color: #8b949e; font-size: 14px;'>SISTEMA DE GESTIÓN ACADÉMICA</p>", unsafe_allow_html=True)

# 3. Lógica de Navegación
carpetas_ciclo = sorted([d for d in os.listdir('.') if os.path.isdir(d) and d.startswith('CICLO_')])
ciclo_sel = st.sidebar.selectbox("📂 Seleccionar Ciclo", carpetas_ciclo)

if ciclo_sel:
    ruta_ciclo = ciclo_sel
    cursos = sorted([d for d in os.listdir(ruta_ciclo) if os.path.isdir(os.path.join(ruta_ciclo, d))])
    
    st.markdown(f"### 📚 {ciclo_sel}")
    
    # Grid de Cursos (Botones grandes)
    cols = st.columns(2)
    for i, curso in enumerate(cursos):
        with cols[i % 2]:
            if st.button(f"📁 {curso}", key=curso):
                st.session_state['curso_actual'] = curso

    # Mostrar PDFs del curso seleccionado
    if 'curso_actual' in st.session_state:
        st.markdown("---")
        curso_activo = st.session_state['curso_actual']
        st.markdown(f"<h3 style='color: #d4af37;'>📖 {curso_activo}</h3>", unsafe_allow_html=True)
        
        ruta_curso = os.path.join(ruta_ciclo, curso_activo)
        archivos = sorted([f for f in os.listdir(ruta_curso) if f.lower().endswith('.pdf')])
        
        for pdf in archivos:
            # Tarjeta por cada PDF
            st.markdown(f"""<div class='pdf-card'><div class='pdf-title'>📄 {pdf}</div></div>""", unsafe_allow_html=True)
            
            # Botones de Acción (Ojo y Descarga)
            col_ver, col_desc = st.columns(2)
            
            # Lógica para VER (Google Viewer)
            raw_url = f"https://raw.githubusercontent.com/CJPANTA/cj-project/main/{ciclo_sel}/{curso_activo}/{pdf}"
            encoded_url = urllib.parse.quote(raw_url, safe='')
            google_viewer_url = f"https://docs.google.com/viewer?url={encoded_url}&embedded=true"
            
            with col_ver:
                if st.button(f"👁️ Ver en Línea", key=f"ver_{pdf}"):
                    st.markdown(f'<iframe src="{google_viewer_url}" width="100%" height="600"></iframe>', unsafe_allow_html=True)
            
            with col_desc:
                with open(os.path.join(ruta_curso, pdf), "rb") as f:
                    st.download_button(
                        label="📥 Descargar",
                        data=f,
                        file_name=pdf,
                        mime="application/pdf",
                        key=f"desc_{pdf}"
                    )

st.sidebar.markdown("---")
st.sidebar.write("👤 Jorge Luis - Admin")
