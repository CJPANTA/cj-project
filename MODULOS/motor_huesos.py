import streamlit as st

def interfaz_estudio_oseo():
    st.subheader("🦴 Consultor de Anatomía Clínica")
    st.markdown("---")
    region = st.selectbox("Seleccionar Región:", ["Columna Vertebral", "Miembro Superior", "Miembro Inferior"])
    
    if region == "Columna Vertebral":
        col1, col2 = st.columns(2)
        with col1:
            st.write("**Segmentos:**")
            st.write("- Cervical (C1-C7)")
            st.write("- Torácico (T1-T12)")
        with col2:
            st.write("**Puntos Clave:**")
            st.write("- Atlas/Axis (Rotación)")
            st.write("- Lordosis Lumbar")
    
    st.info("💡 Consejo de eficiencia: Relaciona cada hueso con el agente físico que aplicarás sobre él.")
