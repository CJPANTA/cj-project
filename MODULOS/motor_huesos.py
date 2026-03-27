import st
import os

# ... (mantener funciones anteriores de carga de imágenes)

def listar_ciclos_carrion():
    """Busca las carpetas en 01_CARRION y las ordena correctamente"""
    ruta_carrion = os.path.join(os.path.dirname(os.path.dirname(__file__)), "BASE_DATOS", "01_CARRION")
    if os.path.exists(ruta_carrion):
        # Filtramos solo carpetas y ordenamos
        ciclos = sorted([d for d in os.listdir(ruta_carrion) if os.path.isdir(os.path.join(ruta_carrion, d))])
        return ciclos, ruta_carrion
    return [], None
