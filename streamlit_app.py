import streamlit as st
import pandas as pd

# Configuración de la página
st.set_page_config(page_title="CJ PROJECT", page_icon="🏥")

st.title("🏥 CJ PROJECT")
st.subheader("Buscador de Fisioterapia - Ciclo IV")

# Entrada de búsqueda
busqueda = st.text_input("🔍 Busca una patología o agente (Ej: TENS, Lumbalgia)", "")

# Link de tu base de datos de Carrión
url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSWgTtEsj5YMFGqw6t_t_QJxUgFNCkl1Er9TXTWJyM8njPUlTJYwkjA8ZWsKyJcgN4NnBCcQOVRqf-M/pub?output=csv"

try:
    df = pd.read_csv(url)
    if busqueda:
        # Filtra en todas las columnas
        resultado = df[df.astype(str).apply(lambda x: x.str.contains(busqueda, case=False)).any(axis=1)]
        st.write(f"Resultados para: {busqueda}")
        st.dataframe(resultado)
    else:
        st.info("Escribe algo arriba para buscar en tus apuntes.")
except:
    st.warning("Conectando con la base de datos...")

st.sidebar.write("🟢 Jorge Luis - En Línea")
