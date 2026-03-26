import streamlit as st
import pandas as pd
import os
import base64

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIR_PORTADAS = os.path.join(BASE_DIR, "BASE_DATOS", "04_PORTADAS")
CSV_PATH = os.path.join(BASE_DIR, "BASE_DATOS", "03_CONFIG", "huesos_maestro.csv")

def cargar_imagen_local(nombre_archivo):
    # Intentamos buscar el logo nuevo o el que ya tenías
    ruta = os.path.join(DIR_PORTADAS, nombre_archivo)
    if os.path.exists(ruta):
        with open(ruta, "rb") as f:
            data = f.read()
        return f"data:image/jpeg;base64,{base64.b64encode(data).decode()}"
    return None

def cargar_csv():
    if os.path.exists(CSV_PATH):
        try:
            df = pd.read_csv(CSV_PATH, sep=';', encoding='utf-8').fillna("")
            df.columns = [c.strip() for c in df.columns]
            return df
        except: return None
    return None
