import streamlit as st
import pandas as pd

def mostrar_buscador_huesos():
    st.subheader("🦴 Buscador Anatómico Inteligente")
    
    # Cargar la base de datos
    try:
        df = pd.read_csv("BASE_DATOS/03_CONFIG/huesos_maestro.csv")
        
        # Barra de búsqueda
        busqueda = st.text_input("Escribe el nombre del hueso o región (Ej: Atlas o Cara):")
        
        if busqueda:
            # Filtrar datos (ignora mayúsculas/minúsculas)
            resultado = df[df.apply(lambda row: busqueda.lower() in row.astype(str).str.lower().values, axis=1)]
            
            if not resultado.empty:
                for index, row in resultado.iterrows():
                    with st.expander(f"📍 {row['Nombre_Hueso']} ({row['Región']})"):
                        col1, col2 = st.columns(2)
                        with col1:
                            st.write(f"**Accidentes:** {row['Accidentes_Clave']}")
                            st.write(f"**Músculos:** {row['Musculos_Relacionados']}")
                        with col2:
                            st.write(f"**Función:** {row['Función_Biomecánica']}")
                            st.info(f"⚡ **Agente Sugerido:** {row['Agente_Fisico']}")
                        
                        if pd.notna(row['Link_PDF_Carrion']):
                            st.caption(f"📂 Ref: {row['Link_PDF_Carrion']}")
            else:
                st.warning("No se encontró información. Revisa la ortografía.")
    except Exception as e:
        st.error(f"Error al cargar la base de datos: {e}")
