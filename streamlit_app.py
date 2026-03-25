import streamlit as st
import sys
import os

# 1. Referencia absoluta a la raíz
ROOT_PATH = os.path.dirname(os.path.abspath(__file__))

# 2. Agregamos la carpeta de Codigos al sistema
sys.path.append(os.path.join(ROOT_PATH, "Codigos"))

# 3. Lanzamos la aplicación
try:
    from motor_huesos import main_app
    main_app()
except Exception as e:
    st.error(f"Error de sistema: {e}")
    st.info("Revisando carpetas...")
    st.write("Archivos en raíz:", os.listdir(ROOT_PATH))
