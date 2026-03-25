import streamlit as st
import pandas as pd
import os

def mostrar_buscador_huesos():
    st.subheader("📖 Diccionario Anatomico Digital")
    ruta_csv = "BASE_DATOS/03_CONFIG/huesos_maestro.csv"
    
    if os.path.exists(ruta_csv):
        try:
            # Lectura con punto y coma y codificacion para tildes
            df = pd.read_csv(ruta_csv, sep=';', encoding='latin-1', on_bad_lines='skip')
            df.columns = df.columns.str.strip()
            
            busqueda = st.text_input("🔍 Escribe el nombre de un hueso o accidente:")
            
            if busqueda:
                # Busqueda flexible en todo el DataFrame
                mask = df.apply(lambda row: row.astype(str).str.contains(busqueda, case=False).any(), axis=1)
                res = df[mask]
                
                if not res.empty:
                    for _, row in res.iterrows():
                        with st.expander(f"🦴 {row['Nombre_Hueso'].upper()} ({row['Region']})"):
                            col1, col2 = st.columns(2)
                            with col1:
                                st.write(f"**Accidentes:** {row['Accidentes_Clave']}")
                                st.write(f"**Musculos:** {row['Musculos_Relacionados']}")
                            with col2:
                                st.write(f"**Funcion:** {row['Funcion_Biomecanica']}")
                                st.success(f"⚡ Agente: {row['Agente_Fisico']}")
                            
                            # Referencia a Carrion
                            pdf_ref = row.get('Link_PDF_Carrion', '')
                            if pd.notna(pdf_ref) and pdf_ref != '-':
                                st.caption(f"📚 Fuente: Repositorio Carrion > {pdf_ref}")
                else:
                    st.warning("No hay registros para este termino.")
        except Exception as e:
            st.error(f"Error al procesar el Diccionario: {e}")
    else:
        st.error("Error: No se encontro el archivo huesos_maestro.csv en 03_CONFIG.")
