import streamlit as st
import os
import base64

# Ruta raíz del proyecto
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def cargar_imagen_raiz(nombre_archivo):
    """Carga imágenes (logos) directamente desde la raíz del proyecto"""
    # Buscamos en la raíz (un nivel arriba de MODULOS)
    ruta = os.path.join(BASE_DIR, nombre_archivo)
    
    if os.path.exists(ruta):
        with open(ruta, "rb") as f:
            data = f.read()
        # Detectar extensión para el formato base64
        ext = nombre_archivo.split('.')[-1].lower()
        if ext == 'jpg': ext = 'jpeg'
        return f"data:image/{ext};base64,{base64.b64encode(data).decode()}"
    return None

def cargar_datos_maestros():
    """Esta función la usaremos en el Paso 2 para Anatomía"""
    import pandas as pd
    csv_path = os.path.join(BASE_DIR, "BASE_DATOS", "03_CONFIG", "huesos_maestro.csv")
    if os.path.exists(csv_path):
        df = pd.read_csv(csv_path, sep=';', encoding='utf-8')
        return df.fillna("")
    return None
