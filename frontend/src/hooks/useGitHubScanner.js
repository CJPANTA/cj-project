// src/hooks/useGitHubScanner.js
import { useState, useEffect, useCallback } from 'react';

const GITHUB_USER = "CJPANTA";
const GITHUB_REPO = "cj-project";

const EXTENSIONES_VALIDAS = ['.pdf', '.pptx', '.ppt', '.docx', '.doc', '.xlsx', '.xls'];
const EXTENSIONES_IMAGENES = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

const esArchivoValido = (path) => EXTENSIONES_VALIDAS.some(ext => path.toLowerCase().endsWith(ext));
const esImagenValida = (path) => EXTENSIONES_IMAGENES.some(ext => path.toLowerCase().endsWith(ext));

export function useGitHubScanner(institucion = null) {
  const [estructura, setEstructura] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (forzar = false) => {
    if (!institucion) {
      setEstructura(null);
      setCargando(false);
      setError(null);
      return;
    }

    setCargando(true);
    setError(null);

    const cacheKey = `github_scanner_${institucion}_${GITHUB_USER}_${GITHUB_REPO}`;
    const cacheTimeKey = `${cacheKey}_time`;
    const ahora = Date.now();
    const unaHora = 5 * 60 * 1000;

    if (!forzar) {
      const cache = localStorage.getItem(cacheKey);
      const cacheTime = localStorage.getItem(cacheTimeKey);
      if (cache && cacheTime && (ahora - parseInt(cacheTime)) < unaHora) {
        try {
          setEstructura(JSON.parse(cache));
          setCargando(false);
          return;
        } catch (e) {}
      }
    }

    try {
      const url = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/git/trees/main?recursive=1`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error al conectar con GitHub");
      const data = await res.json();

      let resultado;

      if (institucion === 'multimedia') {
        // ===== MULTIMEDIA: Buscar imágenes en 05_MULTIMEDIA =====
        const BASE_PATH = 'BASE_DATOS/05_MULTIMEDIA';
        
        const imagenes = data.tree
          .filter(item => item.type === 'blob' && item.path.startsWith(BASE_PATH) && esImagenValida(item.path))
          .map(item => {
            // Extraemos solo el nombre del archivo
            const partes = item.path.split('/');
            const nombre = partes[partes.length - 1];
            const nombreMostrar = nombre.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '').replace(/[_-]/g, ' ');
            
            return {
              nombre,
              nombreMostrar,
              url: `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/${item.path}`
            };
          });

        resultado = { tipo: 'multimedia', imagenes };

      } else if (institucion === 'esan' || institucion === 'ingles') {
        // ===== ESAN e INGLES =====
        const BASE_PATH = institucion === 'esan' ? 'BASE_DATOS/07_ESAN' : 'BASE_DATOS/08_INGLES';
        const cursos = {};
        const archivosRaiz = [];

        const archivos = data.tree.filter(item =>
          item.type === 'blob' && item.path.startsWith(BASE_PATH) && esArchivoValido(item.path)
        );

        archivos.forEach(archivo => {
          const partes = archivo.path.split('/');
          const nombreArchivo = partes[partes.length - 1];

          if (partes.length >= 4) {
            const curso = partes[2];
            if (!cursos[curso]) cursos[curso] = [];
            cursos[curso].push(nombreArchivo);
          } else if (partes.length === 3) {
            archivosRaiz.push(nombreArchivo);
          }
        });

        if (archivosRaiz.length > 0) cursos['00-MATERIAL_GENERAL'] = archivosRaiz.sort();

        const cursosOrdenados = {};
        Object.keys(cursos).sort().forEach(k => { cursosOrdenados[k] = cursos[k].sort(); });

        resultado = { tipo: institucion, cursos: cursosOrdenados };
      } else {
        // ===== CARRION =====
        const BASE_PATH = 'BASE_DATOS/01_CARRION';
        const mapa = { "01": {}, "02": {}, "03": {}, "04": {}, "05": {}, "06": {} };

        const archivos = data.tree.filter(item =>
          item.type === 'blob' && item.path.startsWith(BASE_PATH) && esArchivoValido(item.path)
        );

        archivos.forEach(archivo => {
          const partes = archivo.path.split('/');
          if (partes.length >= 5) {
            const cicloStr = partes[2];
            const materia = partes[3];
            const nombreArchivo = partes[4];
            const numCiclo = cicloStr.split('_')[1];
            if (mapa[numCiclo]) {
              if (!mapa[numCiclo][materia]) mapa[numCiclo][materia] = [];
              mapa[numCiclo][materia].push(nombreArchivo);
            }
          }
        });

        Object.keys(mapa).forEach(ciclo => {
          Object.keys(mapa[ciclo]).forEach(materia => { mapa[ciclo][materia].sort(); });
        });

        resultado = { tipo: 'carrion', ciclos: mapa };
      }

      localStorage.setItem(cacheKey, JSON.stringify(resultado));
      localStorage.setItem(cacheTimeKey, ahora.toString());
      setEstructura(resultado);
    } catch (err) {
      setError(err.message);
      console.error('Error en useGitHubScanner:', err);
    } finally {
      setCargando(false);
    }
  }, [institucion]);

  useEffect(() => { cargar(); }, [cargar]);

  const recargar = () => { cargar(true); };

  return { estructura, cargando, error, recargar };
}