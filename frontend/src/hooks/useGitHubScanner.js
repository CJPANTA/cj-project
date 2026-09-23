// src/hooks/useGitHubScanner.js
import { useState, useEffect, useCallback } from 'react';

const GITHUB_USER = "CJPANTA";
const GITHUB_REPO = "cj-project";

const EXTENSIONES_VALIDAS = ['.pdf', '.pptx', '.ppt', '.docx', '.doc', '.xlsx', '.xls'];
const esArchivoValido = (path) =>
  EXTENSIONES_VALIDAS.some(ext => path.toLowerCase().endsWith(ext));

export function useGitHubScanner(institucion = null) {
  const [estructura, setEstructura] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (forzar = false) => {
    // Si no hay institución seleccionada, no cargar nada
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
    const unaHora = 5 * 60 * 1000; // 5 min de caché

    // Verificar caché
    if (!forzar) {
      const cache = localStorage.getItem(cacheKey);
      const cacheTime = localStorage.getItem(cacheTimeKey);
      if (cache && cacheTime && (ahora - parseInt(cacheTime)) < unaHora) {
        try {
          setEstructura(JSON.parse(cache));
          setCargando(false);
          return;
        } catch (e) {
          // Caché corrupto, continuar con fetch
        }
      }
    }

    try {
      const url = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/git/trees/main?recursive=1`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error al conectar con GitHub");
      const data = await res.json();

      let resultado;

      if (institucion === 'esan') {
        // ===== ESAN: cursos + material general en raíz =====
        const BASE_PATH = 'BASE_DATOS/07_ESAN';
        const cursos = {};
        const archivosRaiz = [];

        const archivos = data.tree.filter(item =>
          item.type === 'blob' &&
          item.path.startsWith(BASE_PATH) &&
          esArchivoValido(item.path)
        );

        archivos.forEach(archivo => {
          const partes = archivo.path.split('/');
          const nombreArchivo = partes[partes.length - 1];

          // Caso 1: archivo DENTRO de una subcarpeta de curso
          // partes: ['BASE_DATOS', '07_ESAN', 'NOMBRE_CURSO', 'archivo.pdf']
          if (partes.length >= 4) {
            const curso = partes[2];
            if (!cursos[curso]) cursos[curso] = [];
            cursos[curso].push(nombreArchivo);
          }
          // Caso 2: archivo en la RAÍZ de 07_ESAN
          // partes: ['BASE_DATOS', '07_ESAN', 'archivo.pdf']
          else if (partes.length === 3) {
            archivosRaiz.push(nombreArchivo);
          }
        });

        // Si hay archivos en raíz, agruparlos como "Material General"
        if (archivosRaiz.length > 0) {
          cursos['00-MATERIAL_GENERAL'] = archivosRaiz.sort();
        }

        // Ordenar cursos alfabéticamente (00, 01, 02, etc.)
        const cursosOrdenados = {};
        Object.keys(cursos).sort().forEach(k => {
          cursosOrdenados[k] = cursos[k].sort();
        });

        resultado = { tipo: 'esan', cursos: cursosOrdenados };
      } else {
        // ===== CARRION: ciclos =====
        const BASE_PATH = 'BASE_DATOS/01_CARRION';
        const mapa = { "01": {}, "02": {}, "03": {}, "04": {}, "05": {}, "06": {} };

        const archivos = data.tree.filter(item =>
          item.type === 'blob' &&
          item.path.startsWith(BASE_PATH) &&
          esArchivoValido(item.path)
        );

        archivos.forEach(archivo => {
          const partes = archivo.path.split('/');
          // partes: ['BASE_DATOS', '01_CARRION', 'CICLO_01', 'MATERIA', 'archivo.pdf']
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

        // Ordenar archivos
        Object.keys(mapa).forEach(ciclo => {
          Object.keys(mapa[ciclo]).forEach(materia => {
            mapa[ciclo][materia].sort();
          });
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

  useEffect(() => {
    cargar();
  }, [cargar]);

  const recargar = () => {
    cargar(true);
  };

  return { estructura, cargando, error, recargar };
}