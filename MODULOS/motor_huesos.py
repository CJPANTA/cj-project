import streamlit as st
import pandas as pd
import os

# --- RUTAS DE CONTROL (MODULOS -> Raíz -> BASE_DATOS) ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(BASE_DIR, "BASE_DATOS", "03_CONFIG", "huesos_maestro.csv")
DIR_CARRION = os.path.join(BASE_DIR, "BASE_DATOS", "01_CARRION")
DIR_SISTEMAS = os.path.join(BASE_DIR, "BASE_DATOS", "02_SISTEMAS")
DIR_PORTADAS = os.path.join(BASE_DIR, "BASE_DATOS", "04_PORTADAS")

def cargar_csv_maestro():
    """Carga y limpia el CSV. Si falla, avisa exactamente qué pasó."""
    if not os.path.exists(CSV_PATH):
        return None, f"Archivo no encontrado en: {CSV_PATH}"
    try:
        df = pd.read_csv(CSV_PATH, sep=';', encoding='utf-8', engine='python')
        df.columns = [c.strip() for c in df.columns]
        return df.fillna(""), None
    except Exception as e:
        return None, str(e)

def listar_archivos_biblioteca(ruta_principal):
    """Escanea carpetas para mostrar los PDFs de Carrión o Sistemas."""
    if not os.path.exists(ruta_principal):
        return []
    # Retorna lista de archivos .pdf o carpetas de ciclos
    return sorted([f for f in os.listdir(ruta_principal)])
