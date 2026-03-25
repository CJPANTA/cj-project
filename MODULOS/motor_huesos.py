import streamlit as st
import pandas as pd
import os

# --- CONFIGURACIÓN DE RUTAS Y RECURSOS ---
LINK_VIEW = "https://github.com/TuUsuario/TuRepo/blob/main/" # Ajusta con tu URL real
LINK_RAW = "https://github.com/TuUsuario/TuRepo/raw/main/"

def aplicar_estilo_prioridad(val):
    """Lógica de colores para Prioridad_BRI: Verde (Bajo), Rojo (Urgente), Blanco (Estándar)"""
    color = 'white'
    if val == 'Verde': color = '#d4edda'
    elif val == 'Rojo': color = '#f8d7da'
    return f'background-color: {color}'

# --- TRONCO DE LA APP: ANATOMÍA MAESTRO ---
def seccion_anatomia_maestro():
    st.title("🦴 Anatomía Maestro - Base de Datos Técnica")
    
    file_path = 'huesos_maestro.csv'
    if os.path.exists(file_path):
        df = pd.read_csv(file_path, sep=';')
        
        # 1. Filtro Abierto (Para detectar cualquier rama nueva)
        busqueda = st.text_input("🔍 Buscar en Anatomía (Hueso, Región o Accidentes):")
        
        if busqueda:
            df = df[df.apply(lambda row: busqueda.lower() in row.astype(str).lower().values, axis=1)]

        # 2. Sincronización de PDFs y Formateo a 10 Encabezados Maestros
        biblioteca_maestra = []
        for _, row in df.iterrows():
            # Construcción de la ruta al PDF en 01_SESIONES
            url_pdf = f"{LINK_VIEW}BASE_DATOS/01_SESIONES/{row['Link_PDF_Carrion']}"
            
            protocolo = {
                "Patología / Zona": f"{row['Nombre_Hueso']} - {row['Accidentes_Oseos']}",
                "Modo Sugerido": row['Agente_Fisico'],
                "Ubicación Electrodos 📍": f"{row['Cara']} en {row['Nombre_Hueso']}",
                "Objetivo Fisiológico": row['Funcion_Bio'],
                "Terapia Ideal 🤝": "Crioterapia / Magneto",
                "Ejercicio Activo 🏋️": row['Accion_Sugerida'],
                "Lógica Combinación": f"Art. {row['Articulaciones_Clave']}",
                "Prioridad": row['Prioridad_BRI'],
                "Documento": f"[📄 Ver Clase]({url_pdf})",
                "Netter": row['Referencia_Netter']
            }
            biblioteca_maestra.append(protocolo)
        
        df_display = pd.DataFrame(biblioteca_maestra)
        
        # 3. Visualización de Prioridades con Estilo
        st.write("### Protocolos Activos")
        st.dataframe(df_display.style.applymap(aplicar_estilo_prioridad, subset=['Prioridad']))
    else:
        st.error("No se encontró el archivo huesos_maestro.csv en la raíz.")

# --- LÓGICA DE NAVEGACIÓN (ABIERTA A CICLOS 05 Y 06) ---
opciones = ["Ciclo 04", "Ciclo 05", "Ciclo 06", "Anatomía Maestro", "Biblioteca Técnica"]
opcion = st.sidebar.selectbox("Seleccione Ciclo o Sección:", opciones)

if opcion == "Anatomía Maestro":
    seccion_anatomia_maestro()
elif opcion in ["Ciclo 05", "Ciclo 06"]:
    st.title(f"🚀 {opcion}")
    st.info(f"Sección preparada. Cargando archivos de la rama {opcion} en GitHub...")
    # Aquí la app ya está lista para listar PDFs en cuanto los subas a sus carpetas
