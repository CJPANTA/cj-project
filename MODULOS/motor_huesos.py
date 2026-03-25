import streamlit as st
import pandas as pd
import os

def mostrar_buscador_huesos():
    st.subheader("🔍 Buscador Anatómico")
    ruta = "BASE_DATOS/03_CONFIG/huesos_maestro.csv"
    
    if os.path.exists(ruta):
        try:
            # Forzamos separador y codificación
            df = pd.read_csv(ruta, sep=';', encoding='utf-8')
            df.columns = df.columns.str.strip()
            
            termino = st.text_input("Escribe el hueso a consultar (ej: Atlas, Frontal):")
            
            if termino:
                # Búsqueda que ignora mayúsculas/minúsculas
                resultado = df[df['Nombre_Hueso'].str.contains(termino, case=False, na=False)]
                
                if not resultado.empty:
                    for _, fila in resultado.iterrows():
                        with st.expander(f"🦴 {fila['Nombre_Hueso'].upper()}"):
                            st.write(f"**Región:** {fila['Region']}")
                            st.write(f"**Detalles:** {fila['Accidentes_Clave']}")
                            st.write(f"**Relación Muscular:** {fila['Musculos_Relacionados']}")
                            st.success(f"⚡ Agente Sugerido: {fila['Agente_Fisico']}")
                            st.info(f"📚 Referencia: {fila['Link_PDF_Carrion']}")
                else:
                    st.warning("No se hallaron coincidencias. Revisa la ortografía.")
        except Exception as e:
            st.error(f"Error al cargar el diccionario: {e}")
