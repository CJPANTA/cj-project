import streamlit as st
import sys
import os

# Agregamos la carpeta Codigos al camino de búsqueda de Python
sys.path.append(os.path.join(os.path.dirname(__file__), "Codigos"))

# Ahora importamos la función correcta
try:
    from motor_huesos import main_app
    main_app()
except ImportError as e:
    st.error(f"Error de Importación: {e}")
    st.write("Asegúrate de que 'motor_huesos.py' esté dentro de la carpeta 'Codigos'")
except Exception as e:
    st.error(f"Ocurrió un error inesperado: {e}")
