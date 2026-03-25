import streamlit as st
import pandas as pd

def mostrar_buscador_huesos():
    st.subheader("Buscador Anatomico") 
    
    ruta = "BASE_DATOS/03_CONFIG/huesos_maestro.csv"
    
    try:
        # El separador sep=None hace que Python adivine si usaste coma o punto y coma
        df = pd.read_csv(ruta, sep=None, engine='python', encoding='latin-1')
        
        busqueda = st.text_input("Escribe el nombre del hueso o region (ej. Frontal):")
        
        if busqueda:
            # Busqueda flexible
            mask = df.apply(lambda row: row.astype(str).str.contains(busqueda, case=False).any(), axis=1)
            resultado = df[mask]
            
            if not resultado.empty:
                for index, row in resultado.iterrows():
                    with st.expander(f"Hueso: {row['Nombre_Hueso']}"):
                        st.write(f"**Region:** {row['Región']}")
                        st.write(f"**Accidentes:** {row['Accidentes_Clave']}")
                        st.write(f"**Musculos:** {row['Musculos_Relacionados']}")
                        st.write(f"**Funcion:** {row['Función_Biomecánica']}")
                        st.info(f"Agente Sugerido: {row['Agente_Fisico']}")
            else:
                st.warning("No se encontro el termino. Prueba con otra palabra.")
    except Exception as e:
        st.error(f"Error: Revisa que el archivo CSV no este abierto en tu PC.")
