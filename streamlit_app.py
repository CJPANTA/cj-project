import streamlit as st
import sys
import os

# 1. Obtenemos la ruta raíz donde está este archivo
RUTA_RAIZ = os.path.dirname(os.path.abspath(__file__))

# 2. Agregamos la carpeta MODULOS al sistema para que Python la vea
sys.path.append(os.path.join(RUTA_RAIZ, "MODULOS"))

# 3. Importamos y ejecutamos la función del motor
try:
    from motor_huesos import ejecutar_proyecto_cj
    ejecutar_proyecto_cj()
except ImportError as e:
    st.error(f"Error: No se encontró el módulo en la carpeta MODULOS. {e}")
except Exception as e:
    st.error(f"Error inesperado: {e}")
