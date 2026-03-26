import streamlit as st
import os

# 1. ESTILO PREMIUM CJ
st.set_page_config(page_title="Repaso Urgente CJ", layout="centered")
st.markdown(f"""
    <style>
    .stApp {{ background-color: #06101c; color: #d1d5db; }}
    h1 {{ color: #6e4f02 !important; }}
    .stSelectbox {{ color: black; }}
    </style>
    """, unsafe_allow_html=True)

st.title("🛡️ PORTAL DE EMERGENCIA - CICLO 04")

# 2. LOCALIZADOR DE ARCHIVOS
# Intentamos buscar en varias rutas comunes
rutas_posibles = ["./", "02_SISTEMAS/", "../02_SISTEMAS/"]
todos_los_archivos = []

for r in rutas_posibles:
    try:
        archivos = os.listdir(r)
        todos_los_archivos.extend([os.path.join(r, f) for f in archivos if f.endswith('.pdf')])
    except:
        continue

# 3. INTERFAZ DE ESTUDIO RÁPIDO
if not todos_los_archivos:
    st.error("❌ No encontré PDFs en '02_SISTEMAS'.")
    st.info("Sube un PDF aquí rápido para leerlo ahora mismo:")
    archivo_subido = st.file_uploader("Cargar clase de Carrión", type="pdf")
    if archivo_subido:
        st.success("¡Listo! Ya puedes leerlo abajo.")
        # Aquí podrías usar un iframe para visualizarlo
else:
    st.success(f"✅ Se encontraron {len(todos_los_archivos)} archivos del ciclo.")
    seleccion = st.selectbox("Selecciona tu clase para estudiar:", todos_los_archivos)
    
    if seleccion:
        with open(seleccion, "rb") as f:
            st.download_button(
                label="🚀 ABRIR PDF AHORA",
                data=f,
                file_name=os.path.basename(seleccion),
                mime="application/pdf"
            )

# 4. BOTÓN DE REPASO MENTAL (Sin archivos)
st.markdown("---")
st.subheader("💡 Repaso Relámpago (Agentes Físicos II)")
col1, col2 = st.columns(2)
with col1:
    st.write("**Inflamación Aguda:**")
    st.caption("Frío, TENS (80-120Hz), Reposo.")
with col2:
    st.write("**Inflamación Crónica:**")
    st.caption("Calor, Magneto, TENS (1-10Hz).")
