import streamlit as st
import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(BASE_DIR, "BASE_DATOS", "03_CONFIG", "huesos_maestro.csv")
DIR_PORTADAS = os.path.join(BASE_DIR, "BASE_DATOS", "04_PORTADAS")

def cargar_csv_maestro():
    if not os.path.exists(CSV_PATH): return None, "Error: CSV no encontrado"
    try:
        df = pd.read_csv(CSV_PATH, sep=';', encoding='utf-8', engine='python')
        df.columns = [c.strip() for c in df.columns]
        return df.fillna(""), None
    except Exception as e: return None, str(e)

def buscar_portada(nombre_archivo):
    """Busca .jpg o .png que coincida con el nombre del PDF en 04_PORTADAS"""
    nombre_base = os.path.splitext(nombre_archivo)[0]
    for ext in ['.jpg', '.png', '.jpeg']:
        ruta_img = os.path.join(DIR_PORTADAS, nombre_base + ext)
        if os.path.exists(ruta_img):
            return ruta_img
    return None
