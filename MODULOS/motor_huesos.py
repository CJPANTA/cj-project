import streamlit as st
import pandas as pd
import os

def mostrar_buscador_huesos():
    st.subheader("🔍 Buscador Inteligente Osteopatico")
    ruta = "BASE_DATOS/03_CONFIG/huesos_maestro.csv"
    
    if os.path.exists(ruta):
        try:
            # Limpieza de datos al cargar
            df = pd.read_csv(ruta, sep=';', encoding='latin-1')
            df.columns = df.columns.str.strip()
            
            busqueda = st.text_input("Ingresa el hueso o termino a consultar:")
            
            if busqueda:
                # Busqueda en todas las columnas
                mask = df.apply(lambda r: busqueda.lower() in r.astype(str).str.lower().values, axis=1)
                res = df[mask]
                
                if not res.empty:
                    for _, row in res.iterrows():
                        with st.expander(f"🦴 {row['Nombre_Hueso'].upper()}"):
                            st.write(f"**Accidentes:** {row['Accidentes_Clave']}")
                            st.write(f"**Musculos:** {row['Musculos_Relacionados']}")
                            st.success(f"⚡ Agente Sugerido: {row['Agente_Fisico']}")
                            
                            # Enlace a Carrion
                            ref = row.get('Link_PDF_Carrion', '')
                            if pd.notna(ref) and ref != '-':
                                st.info(f"📚 Referencia: {ref}")
                else:
                    st.warning("No se encontraron coincidencias.")
        except Exception as e:
            st.error(f"Error al leer el diccionario: {e}")
