import streamlit as st

# Configuración de la página
st.set_page_config(page_title="CJ PROJECT", page_icon="🏥")

# Título y Bienvenida
st.title("🏥 CJ PROJECT")
st.subheader("Academia Carrión - Control de Fisioterapia")
st.markdown("---")

st.write(f"¡Hola Jorge Luis! Tu aplicación ya está funcionando desde la nube.")

# Botón interactivo
if st.button("¡Hacer Magia! ✨"):
    st.balloons()
    st.success("Conexión perfecta. El motor de Python está encendido.")

st.sidebar.info("Estado: Conectado a GitHub 🟢")
