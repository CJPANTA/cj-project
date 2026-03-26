import streamlit as st
import os
import base64

# Rutas base del proyecto CJ
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIR_PORTADAS = os.path.join(BASE_DIR, "BASE_DATOS", "04_PORTADAS")

def obtener_imagen_base64(nombre_archivo):
    """Carga imágenes locales para que Streamlit las renderice correctamente"""
    ruta = os.path.join(DIR_PORTADAS, nombre_archivo)
    if os.path.exists(ruta):
        with open(ruta, "rb") as f:
            data = f.read()
        return f"data:image/jpeg;base64,{base64.b64encode(data).decode()}"
    return None
