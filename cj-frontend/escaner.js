import fs from 'fs';

async function escanearGitHub() {
  console.log('📡 Conectando con el satélite de GitHub...');
  
  // Esta URL mágica pide el "mapa" completo de tu repositorio
  const url = 'https://api.github.com/repos/CJPANTA/cj-project/git/trees/main?recursive=1';

  try {
    const respuesta = await fetch(url);
    const data = await respuesta.json();

    if (!data.tree) {
      throw new Error("GitHub no respondió con el árbol de archivos. Verifica el enlace.");
    }

    // Preparamos los cajones vacíos
    const mapa = { "01": {}, "02": {}, "03": {}, "04": {}, "05": {}, "06": {} };

    // Filtramos SOLO los PDFs que están dentro de 01_CARRION
    const archivosCarrion = data.tree.filter(item => 
      item.path.startsWith('BASE_DATOS/01_CARRION/') && item.path.toLowerCase().endsWith('.pdf')
    );

    archivosCarrion.forEach(archivo => {
      // archivo.path se ve así: BASE_DATOS/01_CARRION/CICLO_01/Anatomia/Clase_01.pdf
      const partes = archivo.path.split('/');
      const cicloStr = partes[2]; // Ej: CICLO_01
      const materia = partes[3];  // Ej: Anatomia
      const nombrePdf = partes[4]; // Ej: Clase_01.pdf

      if (cicloStr && materia && nombrePdf) {
        const numCiclo = cicloStr.split('_')[1]; // Extrae el "01"
        
        if (mapa[numCiclo]) {
          if (!mapa[numCiclo][materia]) {
            mapa[numCiclo][materia] = [];
          }
          mapa[numCiclo][materia].push(nombrePdf);
        }
      }
    });

    // Guardamos el mapa en tu proyecto React
    if (!fs.existsSync('./src/data')) {
      fs.mkdirSync('./src/data', { recursive: true });
    }
    fs.writeFileSync('./src/data/mapa_carrion.json', JSON.stringify(mapa, null, 2));

    console.log('✅ ¡ÉXITO TOTAL! El mapa fue extraído de GitHub y guardado localmente.');
    console.log('📂 Revisa la carpeta "src/data/mapa_carrion.json" en tu VS Code.');

  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

escanearGitHub();