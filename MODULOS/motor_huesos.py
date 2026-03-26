import streamlit as st
import pandas as pd
import os
import base64

# --- CONFIGURACIÓN DE RUTAS ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIR_PORTADAS = os.path.join(BASE_DIR, "BASE_DATOS", "04_PORTADAS")
CSV_PATH = os.path.join(BASE_DIR, "BASE_DATOS", "03_CONFIG", "huesos_maestro.csv")

def cargar_imagen_base64(nombre_archivo):
    """Carga imagen local para evitar errores de renderizado"""
    ruta = os.path.join(DIR_PORTADAS, nombre_archivo)
    if os.path.exists(ruta):
        with open(ruta, "rb") as f:
            return f"data:image/jpeg;base64,{base64.b64encode(f.read()).decode()}"
    return None

def cargar_datos_csv():
    if os.path.exists(CSV_PATH):
        try:
            df = pd.read_csv(CSV_PATH, sep=';', encoding='utf-8')
            df.columns = [c.strip() for c in df.columns]
            return df.fillna("")
        except: return None
    return None
