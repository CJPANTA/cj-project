import streamlit as st
from MODULOS.motor_huesos import mostrar_buscador_huesos

# Configuración de página
st.set_page_config(page_title="Sistema CJ 5000", layout="wide")

# Sidebar con Logo
st.sidebar.image("logo_cj.jpg", width=150)
st.sidebar.title("Menú Principal")
opcion = st.sidebar.radio("Ir a:", ["Inicio", "Buscador de Huesos", "Mis Clases Carrión"])

# Lógica de Navegación
if opcion == "Inicio":
    st.title("Bienvenido, Jorge Luis")
    st.write("Selecciona una opción en el menú de la izquierda para empezar a estudiar.")
    st.image("https://images.unsplash.com/photo-1530026405186-ed1f139313f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", caption="Fisioterapia y Tecnología")

elif opcion == "Buscador de Huesos":
    mostrar_buscador_huesos()

elif opcion == "Mis Clases Carrión":
    st.title("📚 Repositorio de Clases")
    st.write("Próximamente: Conexión directa con tus carpetas de Ciclo 01 a 04.")
