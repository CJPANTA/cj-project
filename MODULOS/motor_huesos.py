import streamlit as st
import os
import base64

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def cargar_imagen_raiz(nombre_archivo):
    ruta = os.path.join(BASE_DIR, nombre_archivo)
    if os.path.exists(ruta):
        with open(ruta, "rb") as f:
            data = f.read()
        ext = nombre_archivo.split('.')[-1].lower()
        if ext == 'jpg': ext = 'jpeg'
        return f"data:image/{ext};base64,{base64.b64encode(data).decode()}"
    return None
