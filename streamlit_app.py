import streamlit as st
import os

# 1. CONFIGURACIÓN VISUAL (Tus colores #06101c y #6e4f02)
st.set_page_config(page_title="CJ - Repaso Ciclo 04", layout="centered")

st.markdown(f"""
    <style>
    .stApp {{ background-color: #06101c; color: #d1d5db; }}
    h1, h2 {{ color: #6e4f02 !important; text-align: center; }}
    .curso-card {{
        background-color: #0e2f38;
        padding: 20px;
        border-radius: 15px;
        border-left: 8px solid #6e4f02;
        margin-bottom: 15px;
    }}
    .boton-acceso {{
        display: block;
        width: 100%;
        padding: 10px;
        background-color: #008080;
        color: white;
        text-align: center;
        border-radius: 8px;
        text-decoration: none;
        font-weight: bold;
    }}
    </style>
    """, unsafe_allow_html=True)

st.title("🏥 PORTAL CICLO 04 - CJ")
st.write("Selecciona el curso para abrir tus PDFs de Carrión:")

# 2. DEFINICIÓN DE CURSOS DEL CICLO 04 (Basado en tus archivos)
cursos = {
    "⚡ Agentes Físicos II": "C04_Agentes_Fisicos_II",
    "🦴 Morfofisiología del Aparato Locomotor": "C04_Morfofisio",
    "🏃 Biomecánica": "C04_Biomecanica",
    "💆 Masoterapia Clínica": "C04_Masoterapia",
    "☯️ Terapias Alternativas (Moxa)": "C04_Terapias"
}

# 3. GENERADOR DE INTERFAZ MÓVIL
for curso, prefijo in cursos.items():
    with st.container():
        st.markdown(f"""
        <div class="curso-card">
            <h3>{curso}</h3>
            <p>Accede a tus clases, resúmenes y tablas de parámetros.</p>
        </div>
        """, unsafe_allow_html=True)
        
        # Filtro inteligente: Busca en tu carpeta 02_SISTEMAS archivos que empiecen con el prefijo
        try:
            archivos_carpeta = os.listdir("02_SISTEMAS")
            archivos_curso = [f for f in archivos_carpeta if f.startswith(prefijo)]
            
            if archivos_curso:
                archivo_sel = st.selectbox(f"Clases disponibles ({curso})", archivos_curso, key=prefijo)
                if st.button(f"Abrir Clase", key=f"btn_{prefijo}"):
                    # Aquí la App abrirá el PDF directamente
                    st.success(f"Abriendo: {archivo_sel}")
                    st.download_button("Descargar para ver offline", data="contenido", file_name=archivo_sel)
            else:
                st.warning("No se encontraron archivos con este nombre en GitHub.")
        except:
            st.error("Error: Asegúrate de que la carpeta '02_SISTEMAS' exista en GitHub.")

# 4. BOTÓN DE EMERGENCIA: REPASO RÁPIDO AGENTES
st.markdown("---")
if st.button("🚨 RESUMEN DE EMERGENCIA EXAMEN"):
    st.info("**Recordatorio Flash:**\n\n"
            "* **TENS:** Agudo (Frecuencia ↑ / Fase ↓) | Crónico (Frecuencia ↓ / Fase ↑)\n"
            "* **Ultrasonido:** 1MHz (Profundo) | 3MHz (Superficial)\n"
            "* **Magneto:** Cicatrización y Fracturas (Baja Frecuencia)")
