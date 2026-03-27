import streamlit as st
import os
import base64

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def cargar_imagen_raiz(nombre_archivo):
    ruta = os.path.join(BASE_DIR, nombre_archivo)
    if os.path.exists(ruta):
        with open(ruta, "rb") as f:
            data = f.read()
        ext = nombre_archivo.split('.')[-1]
        return f"data:image/{ext};base64,{base64.b64encode(data).decode()}"
    return None

def listar_ciclos_reales():
    ruta_carrion = os.path.join(BASE_DIR, "BASE_DATOS", "01_CARRION")
    if os.path.exists(ruta_carrion):
        # Ordenamos para que salga 01, 02, 03...
        return sorted([d for d in os.listdir(ruta_carrion) if os.path.isdir(os.path.join(ruta_carrion, d))])
    return []
