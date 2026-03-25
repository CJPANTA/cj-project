import streamlit as st
import random
import os
from MODULOS.motor_huesos import mostrar_buscador_huesos

# 1. Configuracion de la pagina
st.set_page_config(page_title="Plataforma Clinica CJ", layout="wide")

# 2. Menu Lateral
st.sidebar.image("logo_cj.jpg", width=150)
st.sidebar.title("Menu Principal")
opcion = st.sidebar.radio("Navegacion:", ["Inicio", "Buscador Anatomico", "Repositorio Carrion"])

# --- Lógica de Inicio ---
if opcion == "Inicio":
    st.title("Gestion de Conocimiento Clinico")
    st.write("### Bienvenido, Jorge Luis")
    
    imagenes_educativas = [
        "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=1000",
        "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1000",
        "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?q=80&w=1000"
    ]
    st.image(random.choice(imagenes_educativas), use_container_width=True)
    
    frases = ["La repeticion espaciada es la clave.", "El movimiento es medicina."]
    st.info(f"💡 Tip del dia: {random.choice(frases)}")

# --- Lógica del Buscador ---
elif opcion == "Buscador Anatomico":
    mostrar_buscador_huesos()

# --- Lógica del Repositorio ---
elif opcion == "Repositorio Carrion":
    col_logo, col_titulo = st.columns([1, 5])
    with col_logo:
        # Usamos el logo que ya subiste
        if os.path.exists("logo_carrion.png"):
            st.image("logo_carrion.png", width=100)
        else:
            st.image("https://cdn-icons-png.flaticon.com/512/3063/3063176.png", width=80)
            
    with col_titulo:
        st.title("Repositorio Academico Carrion")
        st.write("Material oficial organizado por ciclos.")

    st.markdown("---")
    tabs = st.tabs(["Ciclo 01", "Ciclo 02", "Ciclo 03", "Ciclo 04"])
    
    with tabs[0]:
        st.subheader("📚 Material Ciclo 01")
        # Aqui listaremos los PDFs de tus carpetas pronto
        st.info("Carpeta: BASE_DATOS/01_CARRION/CICLO_01")
