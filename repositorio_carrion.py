import streamlit as st
import json
import os

def cargar_datos():
    try:
        with open('biblioteca.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        st.error("Archivo biblioteca.json no encontrado.")
        return None

def buscador_inteligente(datos, termino):
    encontrados = []
    base = datos.get("BASE_DATOS", {}).get("01_CARRION", {})
    for ciclo, cursos in base.items():
        for curso, pdfs in cursos.items():
            for pdf in pdfs:
                if termino.lower() in pdf.lower():
                    encontrados.append({
                        "pdf": pdf,
                        "ruta": f"BASE_DATOS/01_CARRION/{ciclo}/{curso}/{pdf}",
                        "info": f"{ciclo} > {curso.replace('_', ' ')}"
                    })
    return encontrados

def mostrar_pdfs_ciclo(datos, num_ciclo):
    ciclo_key = f"CICLO_{num_ciclo:02d}"
    cursos = datos.get("BASE_DATOS", {}).get("01_CARRION", {}).get(ciclo_key, {})
    
    if not cursos:
        st.info(f"No hay contenido registrado para el {ciclo_key}")
        return

    for curso, pdfs in cursos.items():
        with st.expander(f"📚 {curso.replace('_', ' ')}", expanded=False):
            for pdf in pdfs:
                ruta = f"BASE_DATOS/01_CARRION/{ciclo_key}/{curso}/{pdf}"
                if os.path.exists(ruta):
                    with open(ruta, "rb") as f:
                        st.download_button(label=f"📄 {pdf}", data=f, file_name=pdf, key=ruta)
                else:
                    st.caption(f"⚠️ {pdf} (No detectado en servidor)")
