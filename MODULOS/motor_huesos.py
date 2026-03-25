import streamlit as st
import pandas as pd
import os

def mostrar_buscador_huesos():
    st.subheader("🔍 Buscador Inteligente")
    ruta = "BASE_DATOS/03_CONFIG/huesos_maestro.csv"
    
    if os.path.exists(ruta):
        df = pd.read_csv(ruta, sep=';', encoding='latin-1')
        busqueda = st.text_input("¿Que hueso deseas consultar?")
        
        if busqueda:
            res = df[df.apply(lambda r: busqueda.lower() in r.astype(str).str.lower().values, axis=1)]
            for _, row in res.iterrows():
                with st.expander(f"🦴 {row['Nombre_Hueso']}"):
                    st.write(f"**Detalles:** {row['Accidentes_Clave']}")
                    st.write(f"**Musculos:** {row['Musculos_Relacionados']}")
                    st.success(f"⚡ Agente: {row['Agente_Fisico']}")
                    
                    # ENLACE AL REPOSITORIO
                    ref = row.get('Link_PDF_Carrion', '')
                    if pd.notna(ref) and ref != '-':
                        st.info(f"📖 Ver mas en: Repositorio Carrion > {ref}")
