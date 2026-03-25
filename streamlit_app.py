import streamlit as st
import random
import os
from MODULOS.motor_huesos import mostrar_buscador_huesos

# Configuracion base
st.set_page_config(page_title="Plataforma Clinica CJ", layout="wide")

# --- SIDEBAR (Navegacion) ---
st.sidebar.image("logo_cj.jpg", width=150)
st.sidebar.title("Menu Principal")
opcion = st.sidebar.radio("Navegacion:", ["Inicio", "Buscador Anatomico", "Repositorio Carrion", "Biblioteca Tecnica"])

# --- VARIABLES DE ENTORNO (Encanto) ---
imagenes_educativas = [
    "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=1000",
    "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1000",
    "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?q=80&w=1000",
    "https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=1000"
]

frases_motivadoras = [
    "La repeticion espaciada es la clave para dominar la anatomia.",
    "El movimiento es medicina, y tu eres el dosificador.",
    "Un buen diagnostico nace de una excelente palpacion.",
    "La constancia del administrador vence a la dificultad del estudio."
]

# --- LOGICA DE PAGINAS ---

if opcion == "Inicio":
    st.title("Gestion de Conocimiento - Fisioterapia")
    st.write(f"### ¡Bienvenido, Jorge Luis!")
    st.image(random.choice(imagenes_educativas), use_container_width=True)
    st.info(f"💡 **Tip del dia:** {random.choice(frases_motivadoras)}")

elif opcion == "Buscador Anatomico":
    mostrar_buscador_huesos()

elif opcion == "Repositorio Carrion":
    # Logo Carrion centrado y grande
    c1, c2, c3 = st.columns([1,3,1])
    with c2:
        if os.path.exists("logo_carrion.png"):
            st.image("logo_carrion.png", width=400)
    
    st.markdown("<h2 style='text-align: center;'>REPOSITORIO ACADEMICO CARRION</h2>", unsafe_allow_html=True)
    
    tabs = st.tabs(["Ciclo 01", "Ciclo 02", "Ciclo 03", "Ciclo 04"])
    for i, tab in enumerate(tabs):
        with tab:
            ciclo_dir = f"BASE_DATOS/01_CARRION/CICLO_0{i+1}"
            if os.path.exists(ciclo_dir):
                cursos = [d for d in os.listdir(ciclo_dir) if os.path.isdir(os.path.join(ciclo_dir, d))]
                if cursos:
                    for curso in cursos:
                        with st.expander(f"📁 Curso: {curso.replace('_', ' ')}"):
                            archivos = os.listdir(os.path.join(ciclo_dir, curso))
                            pdfs = [f for f in archivos if f.endswith('.pdf')]
                            if pdfs:
                                for pdf in pdfs:
                                    st.write(f"📄 {pdf}")
                            else:
                                st.write("No hay archivos PDF en este curso.")
                else:
                    st.info("Organiza tus archivos en carpetas por nombre de curso.")
            else:
                st.error(f"No se encuentra la ruta: {ciclo_dir}")

elif opcion == "Biblioteca Tecnica":
    st.title("📚 Biblioteca de Sistemas")
    st.write("Busqueda flexible por palabra clave (ej. Netter, Estiramiento).")
    
    filtro = st.text_input("🔍 ¿Que libro o tema buscas?")
    ruta_sistemas = "BASE_DATOS/02_SISTEMAS"
    
    if os.path.exists(ruta_sistemas):
        todos = [f for f in os.listdir(ruta_sistemas) if f.endswith('.pdf')]
        filtrados = [f for f in todos if filtro.lower() in f.lower()]
        
        if filtrados:
            cols = st.columns(4)
            for idx, lib in enumerate(filtrados):
                with cols[idx % 4]:
                    st.image("https://cdn-icons-png.flaticon.com/512/3308/3308335.png", width=80)
                    st.write(f"**{lib.replace('.pdf','').replace('_',' ')}**")
                    st.caption("Ubicacion: 02_SISTEMAS")
        else:
            st.warning("No se encontraron libros con ese nombre.")
