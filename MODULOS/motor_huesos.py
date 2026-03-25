import streamlit as st
import pandas as pd
import os

def mostrar_buscador_huesos():
    st.subheader("🔍 Buscador Anatómico Profesional")
    ruta = "BASE_DATOS/03_CONFIG/huesos_maestro.csv"
    
    if os.path.exists(ruta):
        try:
            # Forzamos lectura limpia
            df = pd.read_csv(ruta, sep=';', encoding='utf-8')
            df.columns = df.columns.str.strip()
            
            termino = st.text_input("Ingresa el nombre del hueso o región:")
            
            if termino:
                # Buscamos en 'Nombre_Hueso' y 'Region'
                res = df[df['Nombre_Hueso'].str.contains(termino, case=False, na=False) | 
                         df['Region'].str.contains(termino, case=False, na=False)]
                
                if not res.empty:
                    for _, fila in res.iterrows():
                        with st.expander(f"🦴 {fila['Nombre_Hueso'].upper()}"):
                            c1, c2 = st.columns(2)
                            with c1:
                                st.write(f"**Región:** {fila['Region']}")
                                st.write(f"**Accidentes:** {fila['Accidentes_Clave']}")
                            with c2:
                                st.write(f"**Músculos:** {fila['Musculos_Relacionados']}")
                                st.success(f"⚡ Agente: {fila['Agente_Fisico']}")
                            st.caption(f"Referencia: {fila['Link_PDF_Carrion']}")
                else:
                    st.warning("No se encontró ese término. Intenta con otro.")
        except Exception as e:
            st.error(f"Error de base de datos: {e}")
    else:
        st.error("Archivo 'huesos_maestro.csv' no encontrado.")
