import streamlit as st
import pandas as pd

# 1. IDENTIDAD VISUAL ORIGINAL (Tus códigos confirmados)
AZUL_FONDO = "#06101c"
DORADO_TITULO = "#6e4f02"
GRIS_TEXTO = "#d1d5db"

st.set_page_config(page_title="Proyecto CJ - Academia", layout="wide")

st.markdown(f"""
    <style>
    .stApp {{
        background-color: {AZUL_FONDO};
        color: {GRIS_TEXTO};
    }}
    h1, h2, h3 {{
        color: {DORADO_TITULO} !important;
    }}
    </style>
    """, unsafe_allow_html=True)

st.title("🦴 PROYECTO CJ: MUNDO ACADEMIA")

# 2. CARGA DE BASE DE DATOS (Interconexión Nivel 2)
@st.cache_data
def cargar_inventario():
    # Volvemos a la carga simple que funcionaba
    df = pd.read_csv("huesos_maestro.csv", sep=";")
    return df

try:
    df_huesos = cargar_inventario()
    
    # 3. INTERFAZ DE BÚSQUEDA
    busqueda = st.text_input("🔍 Buscar Hueso o Región:", "")

    if busqueda:
        # Filtrado por nombre o región
        mask = df_huesos['Nombre_Hueso'].str.contains(busqueda, case=False) | \
               df_huesos['Region'].str.contains(busqueda, case=False)
        res = df_huesos[mask]
        
        if not res.empty:
            st.dataframe(res)
        else:
            st.warning("No se encontraron coincidencias. Revisa el diccionario.")

except Exception as e:
    st.error("Error al conectar con GitHub. Verifica que los CSV estén en la raíz.")

# 4. REPASO RÁPIDO AGENTES (Basado en tus estudios actuales)
st.sidebar.header("⚡ Repaso Agentes Físicos")
st.sidebar.info("""
**Analgesia Aguda:**
- 80-120 Hz
- 50-100 μs
""")
