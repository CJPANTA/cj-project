import streamlit as st
import pandas as pd
import os

def mostrar_buscador_huesos():
    st.subheader("🔍 Buscador Anatomico")
    ruta = "BASE_DATOS/03_CONFIG/huesos_maestro.csv"
    
    if os.path.exists(ruta):
        try:
            # AJUSTE DE AUDITORIA: Leemos con separador ';' y codificacion latin-1
            df = pd.read_csv(ruta, sep=';', encoding='latin-1', on_bad_lines='skip')
            
            # Limpiamos nombres de columnas por si tienen espacios invisibles
            df.columns = df.columns.str.strip()
            
            busqueda = st.text_input("Ingresa el hueso a buscar (ej. Frontal):")
            
            if busqueda:
                # Busqueda en todo el documento
                mask = df.apply(lambda row: row.astype(str).str.contains(busqueda, case=False).any(), axis=1)
                resultado = df[mask]
                
                if not resultado.empty:
                    for _, row in resultado.iterrows():
                        # Usamos los nombres exactos de tus columnas del CSV
                        nombre = row['Nombre_Hueso'] if 'Nombre_Hueso' in row else "Sin nombre"
                        region = row['Region'] if 'Region' in row else "N/A"
                        
                        with st.expander(f"🦴 {nombre} ({region})"):
                            st.write(f"**Accidentes:** {row.get('Accidentes_Clave', 'N/A')}")
                            st.write(f"**Musculos:** {row.get('Musculos_Relacionados', 'N/A')}")
                            st.write(f"**Funcion:** {row.get('Funcion_Biomecanica', 'N/A')}")
                            st.success(f"⚡ Agente Sugerido: {row.get('Agente_Fisico', 'N/A')}")
                            if 'Link_PDF_Carrion' in row:
                                st.caption(f"📖 Ref: {row['Link_PDF_Carrion']}")
                else:
                    st.warning("No se encontro coincidencia. Intenta con otra palabra.")
        except Exception as e:
            st.error(f"Error de lectura: {e}")
    else:
        st.error(f"El archivo no existe en la ruta: {ruta}")
