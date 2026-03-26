import streamlit as st
import pandas as pd
import os

# 1. CONFIGURACIÓN DE IDENTIDAD VISUAL PREMIUM
st.set_page_config(page_title="Proyecto CJ - Ciclo 04", layout="centered")

st.markdown(f"""
    <style>
    .stApp {{
        background-color: #06101c;
        color: #d1d5db;
    }}
    h1, h2, h3 {{
        color: #6e4f02 !important;
    }}
    .stButton>button {{
        background-color: #008080;
        color: white;
        border-radius: 10px;
        border: none;
    }}
    .card {{
        background-color: #0e2f38;
        padding: 15px;
        border-radius: 10px;
        border-left: 5px solid #6e4f02;
        margin-bottom: 10px;
    }}
    </style>
    """, unsafe_allow_html=True)

# 2. TÍTULO RÁPIDO PARA EL CELULAR
st.title("🛡️ CJ: REPASO CICLO 04")
st.subheader("Fisioterapia y Rehabilitación")

# 3. CARGA DE DATOS (CONEXIÓN INTELIGENTE)
@st.cache_data
def cargar_datos():
    huesos = pd.read_csv("huesos_maestro.csv", sep=";")
    diccionario = pd.read_csv("diccionario_maestro.csv", sep=";")
    return huesos, diccionario

try:
    df_huesos, df_dic = cargar_datos()
    
    # 4. BUSCADOR DE EMERGENCIA PARA EL CAMINO
    busqueda = st.text_input("🔍 Busca un hueso o término (Ej: Fémur, C7...)", "")

    if busqueda:
        resultado = df_huesos[df_huesos['Nombre_Hueso'].str.contains(busqueda, case=False) | 
                              df_huesos['Region'].str.contains(busqueda, case=False)]
        
        for index, row in resultado.iterrows():
            with st.container():
                st.markdown(f"""
                <div class="card">
                    <h4>🦴 {row['Nombre_Hueso']} ({row['Region']})</h4>
                    <p><b>Accidentes:</b> {row['Accidentes_Oseos']}</p>
                    <p><b>Agente Físico Sugerido:</b> {row['Agente_Fisico']}</p>
                    <p><b>Prioridad:</b> {row['Prioridad_BRI']}</p>
                </div>
                """, unsafe_allow_html=True)
                
                # Botón para ver PDF de Carrión rápido
                path_pdf = f"02_SISTEMAS/{row['Link_PDF_Carrion']}"
                st.write(f"📖 Documento: {row['Link_PDF_Carrion']}")
    
    else:
        st.info("Escribe arriba para repasar los puntos clave de la clase.")

except Exception as e:
    st.error("Asegúrate de tener los archivos CSV en la misma carpeta de GitHub.")

# 5. ACCESO RÁPIDO A AGENTES FÍSICOS (Tu examen de ayer/hoy)
st.markdown("---")
st.markdown("### ⚡ Repaso Agentes Físicos")
opciones_agentes = ["TENS", "Magnetoterapia", "Ultrasonido", "Laser"]
agente_sel = st.selectbox("Selecciona Agente para ver parámetros:", opciones_agentes)

if agente_sel == "TENS":
    st.warning("Analgesia: 80-120 Hz / 50-100 μs (Fase Aguda)")
elif agente_sel == "Magnetoterapia":
    st.warning("Consolidación ósea: 1-50 Hz (Baja frecuencia)")
