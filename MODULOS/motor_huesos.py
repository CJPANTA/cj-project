import streamlit as st
import pandas as pd
import os

# --- RUTAS DE CONTROL (MODULOS -> Raíz -> BASE_DATOS) ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(BASE_DIR, "BASE_DATOS", "03_CONFIG", "huesos_maestro.csv")
DIR_CARRION = os.path.join(BASE_DIR, "BASE_DATOS", "01_CARRION")
DIR_SISTEMAS = os.path.join(BASE_DIR, "BASE_DATOS", "02_SISTEMAS")

def cargar_csv_maestro():
    if not os.path.exists(CSV_PATH):
        return None, f"No se encontró el archivo en: {CSV_PATH}"
    try:
        # Leemos con delimitador punto y coma y limpiamos nombres de columnas
        df = pd.read_csv(CSV_PATH, sep=';', encoding='utf-8', engine='python')
        df.columns = [c.strip() for c in df.columns]
        return df.fillna(""), None
    except Exception as e:
        return None, str(e)

def obtener_archivos(ruta):
    """Lista archivos o carpetas de forma segura"""
    if os.path.exists(ruta):
        return sorted([f for f in os.listdir(ruta) if not f.startswith('.')])
    return []
