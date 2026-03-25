# ... (Todo el código anterior de Inicio y Buscador se mantiene igual)

elif opcion == "Repositorio Carrion":
    # Creamos dos columnas: una pequeña para el logo y otra para el titulo
    col_logo, col_titulo = st.columns([1, 5])
    
    with col_logo:
        # Aquí puedes subir el logo de Carrion a tu GitHub y cambiar el nombre abajo
        # Si no lo tienes, he puesto uno genérico de medicina por ahora
        st.image("https://cdn-icons-png.flaticon.com/512/3063/3063176.png", width=80) 
        
    with col_titulo:
        st.title("Repositorio Academico Carrion")
        st.write("Gestion de material oficial y PDFs de consulta rapida.")

    st.markdown("---")
    
    # Estructura de pestañas por Ciclos
    tab1, tab2, tab3, tab4 = st.tabs(["Ciclo 01", "Ciclo 02", "Ciclo 03", "Ciclo 04"])
    
    with tab1:
        st.subheader("📁 Material de Primer Ciclo")
        # Aquí es donde el código buscará tus archivos automáticamente
        st.info("Buscando archivos en: BASE_DATOS/01_CARRION/CICLO_01...")
        # Ejemplo de cómo se verán cuando los conectemos:
        # st.download_button("📖 Clase 01: Anatomia Osea", data="...", file_name="clase1.pdf")

    with tab2:
        st.subheader("📁 Material de Segundo Ciclo")
        st.write("Carpeta: BASE_DATOS/01_CARRION/CICLO_02")

    # (Repetir lógica para Tab 3 y 4)
