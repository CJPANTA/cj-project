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
    
    # Bienvenida personalizada (Esto cambiara cuando pongamos Login)
    st.write("### Bienvenido, Jorge Luis")
    
    # Galeria educativa de Fisioterapia (10 imagenes reales)
    imagenes_educativas = [
        "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=1000", # Musculos Espalda
        "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1000", # Neurona
        "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?q=80&w=1000", # Rehabilitacion Rodilla
        "https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=1000", # Columna Vertebral
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000", # Ejercicio Funcional
        "https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?q=80&w=1000", # Craneo Lateral
        "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=1000", # Red Neuronal
        "https://images.unsplash.com/photo-1579154235820-221200062b14?q=80&w=1000", # Microcosmos Celular
        "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1000", # Analisis Medico
        "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1000"  # Laboratorio Anatomico
    ]
    
    img_hoy = random.choice(imagenes_educativas)
    st.image(img_hoy, use_container_width=True)
    st.info("💡 Tip del dia: La repeticion espaciada es la clave para dominar la anatomia.")

elif opcion == "Buscador Anatomico":
    mostrar_buscador_huesos()

elif opcion == "Repositorio Carrion":
    st.title("Repositorio de Clases (PDFs de Oro)")
    st.info("Conectando con BASE_DATOS/01_CARRION...")
