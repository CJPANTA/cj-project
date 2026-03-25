import streamlit as st
import pandas as pd
import os

def mostrar_buscador_huesos():
    st.subheader("🔍 Buscador Anatomico")
    ruta = "BASE_DATOS/03_CONFIG/huesos_maestro.csv"
    
    if os.path.exists(ruta):
        try:
            df = pd.read_csv(ruta, sep=';', encoding='latin-1', on_bad_lines='skip')
            df.columns = df.columns.str.strip()
            
            busqueda = st.text_input("Escribe el hueso o accidente que buscas:")
            
            if busqueda:
                mask = df.apply(lambda row: row.astype(str).str.contains(busqueda, case=False).any(), axis=1)
                resultado = df[mask]
                
                if not resultado.empty:
                    for _, row in resultado.iterrows():
                        with st.expander(f"🦴 {row['Nombre_Hueso']}"):
                            c1, c2 = st.columns(2)
                            with c1:
                                st.write(f"**Region:** {row['Region']}")
                                st.write(f"**Accidentes:** {row['Accidentes_Clave']}")
                                st.write(f"**Musculos:** {row['Musculos_Relacionados']}")
                            with c2:
                                st.write(f"**Funcion:** {row['Funcion_Biomecanica']}")
                                st.info(f"⚡ Agente: {row['Agente_Fisico']}")
                            
                            # Botones de accion si hay links
                            link = row.get('Link_PDF_Carrion', '')
                            if pd.notna(link) and link != '-':
                                st.link_button("📂 Ver Documento / Video", f"https://github.com/tu_usuario/tu_repo/blob/main/{link}")
                else:
                    st.warning("No se hallaron coincidencias.")
        except Exception as e:
            st.error(f"Error de lectura: {e}")
