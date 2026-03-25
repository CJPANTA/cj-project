# Encabezados Maestros Acordados:
# Patología / Tipo de Dolor / zona | Modo Sugerido | Parámetros (Hz / μs) | Ubicación Clave de Electrodos 📍 
# Objetivo Fisiológico | Terapia Complementaria Ideal 🤝 | Ejercicio de Terapia Activa / Movimiento 🏋️ 
# Lógica de Combinación | Notas sobre tiempo | Video o imagen sugerida

import pandas as pd

# Carga y limpieza del CSV para asegurar que coincida con los 10 encabezados
def procesar_biblioteca_huesos(file_path):
    df = pd.read_csv(file_path, sep=';')
    
    # Mapeo lógico para transformar los datos técnicos del CSV 
    # a la tabla de protocolos de fisioterapia que solicitaste:
    biblioteca_maestra = []
    
    for index, row in df.iterrows():
        protocolo = {
            "Patología / Tipo de Dolor / zona": f"{row['Nombre_Hueso']} - {row['Accidentes_Oseos']}",
            "Modo Sugerido": row['Agente_Fisico'],
            "Parámetros (Hz / μs)": "80-120Hz / 150μs (Analgesia)", # Estándar por defecto para optimizar
            "Ubicación Clave de Electrodos 📍": f"Zona {row['Cara']} sobre {row['Nombre_Hueso']}",
            "Objetivo Fisiológico": row['Funcion_Bio'],
            "Terapia Complementaria Ideal 🤝": "Crioterapia / Magneto según prioridad",
            "Ejercicio de Terapia Activa / Movimiento 🏋️": row['Accion_Sugerida'],
            "Lógica de Combinación": f"Articulación {row['Articulaciones_Clave']} + {row['Musculos_Relacionados']}",
            "Notas sobre tiempo": "15 - 20 minutos",
            "Video o imagen sugerida": f"Netter Lamina {row['Referencia_Netter']}"
        }
        biblioteca_maestra.append(protocolo)
    
    return pd.DataFrame(biblioteca_maestra)

# Ejecución para validar las 20 filas
df_final = procesar_biblioteca_huesos('huesos_maestro.csv')
print(df_final.head(20))
