import streamlit as st
import os
import base64

# Ruta base hacia la raíz del proyecto
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def cargar_imagen_raiz(nombre_archivo):
    ruta = os.path.join(BASE_DIR, nombre_archivo)
    if os.path.exists(ruta):
        with open(ruta, "rb") as f:
            data = f.read()
        ext = nombre_archivo.split('.')[-1]
        return f"data:image/{ext};base64,{base64.b64encode(data).decode()}"
    return None

def listar_carpetas_carrion():
    """Escanea automáticamente la carpeta de Carrión y ordena los ciclos"""
    ruta_carrion = os.path.join(BASE_DIR, "BASE_DATOS", "01_CARRION")
    if os.path.exists(ruta_carrion):
        # Filtra solo directorios y los ordena (01, 02, 03...)
        ciclos = sorted([d for d in os.listdir(ruta_carrion) if os.path.isdir(os.path.join(ruta_carrion, d))])
        return ciclos, ruta_carrion
    return [], None
