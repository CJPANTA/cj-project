import streamlit as st
import pandas as pd
import os

# --- DETECCIÓN DE ARCHIVO ---
def encontrar_archivo(nombre_archivo):
    if os.path.exists(nombre_archivo):
        return nombre_archivo
    # Si no está en la raíz, lo busca un nivel arriba o abajo
    for root, dirs, files in os.walk("."):
        if nombre_archivo in files:
            return os.path.join(root, nombre_archivo)
    return None

st.set_page_config(page_title="Proyecto CJ", layout="wide")

# --- TITULO Y CARGA ---
st.title("🦴 Anatomía Maestro - Sistema de Control")

archivo_ruta = encontrar_archivo("huesos_maestro.csv")

if archivo_ruta:
    try:
        # Lectura con separador oficial ;
        df = pd.read_csv(archivo_ruta, sep=';', encoding='utf-8')
        df.columns = [c.strip() for c in df.columns] # Limpia espacios
        df = df.fillna("")
        
        st.success(f"✅ Archivo detectado en: {archivo_ruta}")
        
        # --- BUSCADOR ---
        busqueda = st.text_input("🔍 Escribe para filtrar (Hueso, Región o Píldora):")
        if busqueda:
            mask = df.apply(lambda r: busqueda.lower() in r.astype(str).lower().values, axis=1)
            df = df[mask]

        # --- VISUALIZACIÓN ---
        for _, row in df.iterrows():
            with st.expander(f"{row['Nombre_Hueso']} - {row['Region']} | {row['Prioridad_BRI']}"):
                c1, c2 = st.columns([2, 1])
                with c1:
                    st.info(f"**💡 Píldora BRI:** {row['Accion_Sugerida']}")
                    st.write(f"**📍 Detalle:** {row['Cara']} - {row['Accidentes_Oseos']}")
                    st.write(f"**🔬 Articulación:** {row['Articulaciones_Clave']}")
                with c2:
                    prio = row['Prioridad_BRI']
                    if prio == "Rojo": st.error("🚨 CRÍTICO")
                    elif prio == "Verde": st.success("✅ ESTABLE")
                    else: st.warning("⚠️ REVISAR")
                    
    except Exception as e:
        st.error(f"❌ Error al procesar los datos: {e}")
else:
    st.error("🚨 ERROR CRÍTICO: No se encuentra 'huesos_maestro.csv'.")
    st.write("Archivos detectados en la raíz:", os.listdir("."))
    st.info("Asegúrate de que el CSV esté en la misma carpeta que motor_huesos.py en GitHub.")
