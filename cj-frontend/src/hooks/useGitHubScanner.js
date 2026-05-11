// src/hooks/useGitHubScanner.js
import { useState, useEffect, useCallback } from 'react';

const GITHUB_USER = "CJPANTA";
const GITHUB_REPO = "cj-project";
const BASE_PATH = "BASE_DATOS/01_CARRION";

export function useGitHubScanner() {
  const [estructura, setEstructura] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (forzar = false) => {
    setCargando(true);
    const cacheKey = `github_scanner_${GITHUB_USER}_${GITHUB_REPO}`;
    const cacheTimeKey = `${cacheKey}_time`;
    const ahora = Date.now();
    const unaHora = 60 * 60 * 1000;

    if (!forzar) {
      const cache = localStorage.getItem(cacheKey);
      const cacheTime = localStorage.getItem(cacheTimeKey);
      if (cache && cacheTime && (ahora - parseInt(cacheTime)) < unaHora) {
        setEstructura(JSON.parse(cache));
        setCargando(false);
        return;
      }
    }

    try {
      const url = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/git/trees/main?recursive=1`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error al conectar con GitHub");
      const data = await res.json();

      const mapa = { "01": {}, "02": {}, "03": {}, "04": {}, "05": {}, "06": {} };
      const archivos = data.tree.filter(item => item.path.startsWith(BASE_PATH) && item.path.endsWith('.pdf'));

      archivos.forEach(archivo => {
        const partes = archivo.path.split('/');
        if (partes.length >= 5) {
          const cicloStr = partes[2];
          const materia = partes[3];
          const pdf = partes[4];
          const numCiclo = cicloStr.split('_')[1];
          if (mapa[numCiclo]) {
            if (!mapa[numCiclo][materia]) mapa[numCiclo][materia] = [];
            mapa[numCiclo][materia].push(pdf);
          }
        }
      });

      localStorage.setItem(cacheKey, JSON.stringify(mapa));
      localStorage.setItem(cacheTimeKey, ahora.toString());
      setEstructura(mapa);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const recargar = () => {
    cargar(true);
  };

  return { estructura, cargando, error, recargar };
}