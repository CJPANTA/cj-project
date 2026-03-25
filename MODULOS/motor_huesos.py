import streamlit as st
import pandas as pd
import os

def mostrar_buscador_huesos():
    st.subheader("🔍 Buscador Anatomico")
    ruta = "BASE_DATOS/03_CONFIG/huesos_maestro.csv"
    
    if os.path.exists(ruta):
        try:
            # Lectura flexible para evitar errores de codificacion
            df = pd.read_csv(ruta, sep=None, engine='python', encoding='latin-1')
            
            busqueda = st.text_input("Ingresa el hueso a buscar:")
            if busqueda:
                resultado = df[df.apply(lambda row: busqueda.lower() in row.astype(str).str.lower().values, axis=1)]
                if not resultado.empty:
                    for _, row in resultado.iterrows():
                        with st.expander(f"🦴 {row['Nombre_Hueso']}"):
                            st.write(f"**Region:** {row['Región']}")
                            st.write(f"**Musculos:** {row['Musculos_Relacionados']}")
                            st.success(f"⚡ Agente: {row['Agente_Fisico']}")
                else:
                    st.warning("No se encontro informacion.")
        except Exception as e:
            st.error(f"Error al leer los datos. Revisa el formato del CSV.")
    else:
        st.error(f"No se encuentra el archivo en: {ruta}")
