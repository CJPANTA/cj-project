import streamlit as st
import pandas as pd

def mostrar_buscador_huesos():
    st.subheader("Buscador Anatomico") 
    
    ruta = "BASE_DATOS/03_CONFIG/huesos_maestro.csv"
    
    try:
        # Intento 1: UTF-8 (Estandar)
        try:
            df = pd.read_csv(ruta, encoding='utf-8')
        except:
            # Intento 2: Latin-1 (Excel comun)
            df = pd.read_csv(ruta, encoding='latin-1', sep=None, engine='python')
            
        busqueda = st.text_input("Escribe el nombre del hueso o region:")
        
        if busqueda:
            # Busqueda que ignora mayusculas y tildes si las hubiera
            resultado = df[df.apply(lambda row: busqueda.lower() in row.astype(str).str.lower().values, axis=1)]
            
            if not resultado.empty:
                for index, row in resultado.iterrows():
                    with st.expander(f"Hueso: {row['Nombre_Hueso']} ({row['Región']})"):
                        col1, col2 = st.columns(2)
                        with col1:
                            st.write(f"**Accidentes:** {row['Accidentes_Clave']}")
                            st.write(f"**Musculos:** {row['Musculos_Relacionados']}")
                        with col2:
                            st.write(f"**Funcion:** {row['Función_Biomecánica']}")
                            st.info(f"Agente: {row['Agente_Fisico']}")
            else:
                st.warning("No se encontro el termino.")
    except Exception as e:
        st.error("Error critico: Por favor revisa que el archivo CSV este en la carpeta 03_CONFIG.")
