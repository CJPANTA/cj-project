import streamlit as st
from MODULOS.motor_huesos import mostrar_buscador_huesos

# Configuración seria
st.set_page_config(page_title="Sistema de Gestión Anatómica - CJ", layout="wide")

# Sidebar
st.sidebar.image("logo_cj.jpg", width=150)
st.sidebar.title("Plataforma Clínica CJ")
opcion = st.sidebar.radio("Navegación:", ["Inicio", "Buscador Anatómico", "Repositorio Carrión"])

if opcion == "Inicio":
    st.title("Gestión de Conocimiento en Fisioterapia")
    st.write("Bienvenido, Jorge Luis. Esta herramienta está optimizada para la consulta rápida de estructuras y agentes físicos.")
    # Imagen de sistema muscular para un fisio de verdad
    st.image("https://images.unsplash.com/photo-1559757175-5700dde675bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80", caption="Anatomía Muscular Aplicada")

elif opcion == "Buscador Anatómico":
    mostrar_buscador_huesos()

elif opcion == "Repositorio Carrión":
    st.title("📚 Repositorio de Clases (PDFs de Oro)")
    st.info("Estamos conectando la base de datos... pronto verás tus ciclos aquí.")
