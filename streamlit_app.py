# --- SECCIÓN: REPOSITORIO CARRION ---
elif menu == "📖 REPOSITORIO CARRION":
    from MODULOS.motor_huesos import listar_ciclos_carrion, cargar_imagen_raiz
    
    # Encabezado con Logo de Carrión (Solo aquí, como pediste)
    col_t, col_l = st.columns([4, 1])
    with col_t:
        st.markdown(f'<h1 style="color: #6e4f02;">Repositorio Institucional</h1>', unsafe_allow_html=True)
    with col_l:
        logo_c = cargar_imagen_raiz("logo_carrion.png")
        if logo_c: st.image(logo_c, width=120)

    ciclos, ruta_base = listar_ciclos_carrion()
    
    if ciclos:
        # Pestañas ordenadas 01, 02, 03, 04
        tabs = st.tabs([c.replace("_", " ") for c in ciclos])
        
        for i, ciclo_nombre in enumerate(ciclos):
            with tabs[i]:
                ruta_ciclo = os.path.join(ruta_base, ciclo_nombre)
                archivos = [f for f in os.listdir(ruta_ciclo) if f.endswith('.pdf')]
                
                if archivos:
                    # Cuadrícula de documentos (3 columnas para que se vea bien en móvil)
                    cols = st.columns([1, 1, 1])
                    for j, arc in enumerate(archivos):
                        with cols[j % 3]:
                            with st.container(border=True):
                                st.write(f"📄 **{arc[:25]}**")
                                url_f = f"{LINK_RAW}01_CARRION/{ciclo_nombre}/{arc}".replace(" ","%20")
                                
                                # Botones con tu Verde Esmeralda (#008080)
                                if st.button("👁️ Ver", key=f"v_{i}_{j}"):
                                    st.markdown(f'<iframe src="{url_f}" width="100%" height="600px" style="border: 1px solid #6e4f02; border-radius: 10px;"></iframe>', unsafe_allow_html=True)
                                
                                st.link_button("📥 Bajar", url_f, use_container_width=True)
                else:
                    st.warning(f"No hay PDFs en el {ciclo_nombre}")
    else:
        st.error("No se encontraron las carpetas de Ciclos en BASE_DATOS/01_CARRION")
