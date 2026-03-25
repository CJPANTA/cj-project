import streamlit as st
import random
import os
from MODULOS.motor_huesos import mostrar_buscador_huesos

# 1. Configuracion de la pagina
st.set_page_config(page_title="Plataforma Clinica CJ", layout="wide")

# 2. Menu Lateral
st.sidebar.image("logo_cj.jpg", width=150)
st.sidebar.title("Menu Principal")
opcion = st.sidebar.radio("Navegacion:", ["Inicio", "Buscador Anatomico", "Repositorio Carrion", "Biblioteca Tecnica"])

# --- VARIABLES DE ENCANTO (Imagenes y Frases) ---
imagenes_educativas = [
    "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=1000",
    "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1000",
    "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?q=80&w=1000",
    "https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=1000",
    "https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?q=80&w=1000",
    "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=1000",
    "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1000"
]

frases_motivadoras = [
    "La repeticion espaciada es la clave para dominar la anatomia.",
    "El movimiento es medicina, y tu eres el dosificador.",
    "Un buen diagnostico nace de una excelente palpacion.",
    "La constancia del administrador vence a la dificultad del estudio.",
    "Tu futuro gabinete de terapia empieza en estos archivos.",
    "Enfocate en el proceso y el exito llegara por añadidura."
]

# --- LOGICA DE NAVEGACION ---

if opcion == "Inicio":
    st.title("Gestion de Conocimiento Clinico")
    st.write(f"### ¡Bienvenido, Jorge Luis!")
    
    # El encanto recuperado: Imagen y Frase aleatoria
    img_hoy = random.choice(imagenes_educativas)
    st.image(img_hoy, use_container_width=True)
    
    st.info(f"💡 **Tip del dia:** {random.choice(frases_motivadoras)}")
    st.success("Selecciona una opcion en el menu lateral para comenzar tu sesion de estudio.")

elif opcion == "Buscador Anatomico":
    mostrar_buscador_huesos()

elif opcion == "Repositorio Carrion":
    # Branding Carrion
    col1, col2, col3 = st.columns([1,2,1])
    with col2:
        if os.path.exists("logo_carrion.png"):
            st.image("logo_carrion.png", use_container_width=True)
    
    st.markdown("<h1 style='text-align: center;'>Repositorio Academico</h1>", unsafe_allow_html=True)
    
    tabs = st.tabs(["Ciclo 01", "Ciclo 02", "Ciclo 03", "Ciclo 04"])
    for i, tab in enumerate(tabs):
        with tab:
            ciclo_num = f"0{i+1}"
            ruta_ciclo = f"BASE_DATOS/01_CARRION/CICLO_{ciclo_num}"
            
            if os.path.exists(ruta_ciclo):
                # Escaneo de carpetas por curso
                cursos = [c for c in os.listdir(ruta_ciclo) if os.path.isdir(os.path.join(ruta_ciclo, c))]
                if cursos:
                    for curso in cursos:
                        with st.expander(f"📚 {curso.replace('_', ' ')}"):
                            ruta_curso = os.path.join(ruta_ciclo, curso)
                            archivos = [f for f in os.listdir(ruta_curso) if f.endswith('.pdf')]
                            if archivos:
                                for archi in archivos:
                                    st.write(f"📄 {archi}")
                            else:
                                st.write("No hay PDFs en este curso aun.")
                else:
                    st.info("No se encontraron carpetas de cursos.")
            else:
                st.error(f"Ruta no encontrada: {ruta_ciclo}")

elif opcion == "Biblioteca Tecnica":
    st.title("📚 Biblioteca de Sistemas (Buscador Flexible)")
    filtro = st.text_input("🔍 Escribe una palabra clave (ej. Netter, Estiramiento, Biomecanica):")
    
    ruta_libros = "BASE_DATOS/02_SISTEMAS"
    if os.path.exists(ruta_libros):
        libros = [l for l in os.listdir(ruta_libros) if l.endswith('.pdf')]
        libros_filtrados = [l for l in libros if filtro.lower() in l.lower()]
        
        if libros_filtrados:
            cols = st.columns(3)
            for idx, libro in enumerate(libros_filtrados):
                with cols[idx % 3]:
                    st.image("https://cdn-icons-png.flaticon.com/512/3308/3308335.png", width=80)
                    st.write(f"**{libro.replace('_', ' ')}**")
        else:
            st.warning("No se encontraron libros con esa palabra clave.")
