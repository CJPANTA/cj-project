import streamlit as st
import random
from MODULOS.motor_huesos import mostrar_buscador_huesos

st.set_page_config(page_title="Plataforma Clinica CJ", layout="wide")

# Sidebar
st.sidebar.image("logo_cj.jpg", width=150)
st.sidebar.title("Menu Principal")
opcion = st.sidebar.radio("Navegacion:", ["Inicio", "Buscador Anatomico", "Repositorio Carrion"])

if opcion == "Inicio":
    st.title("Gestion de Conocimiento - Fisioterapia")
    st.write(f"Bienvenido, Jorge Luis. Listo para una sesion de estudio eficiente.")
    
    # Lista de imagenes de fisioterapia para ir rotando
    imagenes_fisio = [
        "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1000", # Terapia manual
        "https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?q=80&w=1000", # Anatomia
        "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?q=80&w=1000"  # Rehabilitacion
    ]
    
    # Selecciona una imagen al azar cada vez que se carga
    img_seleccionada = random.choice(imagenes_fisio)
    st.image(img_seleccionada, use_container_width=True, caption="Enfoque Clinico Profesional")

elif opcion == "Buscador Anatomico":
    mostrar_buscador_huesos()

elif opcion == "Repositorio Carrion":
    st.title("Repositorio de Clases (PDFs de Oro)")
    st.info("Conexion en proceso... pronto veras tus ciclos aqui.")
