// Algoritmo generador de sopas de letras
export function generateWordSearch(words, size, directions, lang = 'es') {
  // Limpiar palabras (quitar espacios, acentos si los hay, y convertir a mayúsculas)
  const cleanWords = words.map(word => {
    return word
      .toUpperCase()
      .replace(/\s+/g, '')
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // Quitar acentos
  });

  let grid = [];
  let placements = {}; // Guardará la ubicación de las palabras en el tablero: word -> [{r, c}, ...]

  let success = false;
  let attempts = 0;

  while (!success && attempts < 100) {
    attempts++;
    grid = Array(size).fill(null).map(() => Array(size).fill(''));
    placements = {};
    let allPlaced = true;

    for (const word of cleanWords) {
      const placed = placeWord(grid, word, size, directions);
      if (!placed) {
        allPlaced = false;
        break;
      } else {
        placements[word] = placed;
      }
    }

    if (allPlaced) {
      success = true;
    }
  }

  // Si falló colocar todas en 100 intentos, aumentamos el tamaño y reintentamos
  if (!success) {
    return generateWordSearch(words, size + 2, directions, lang);
  }

  // Rellenar espacios vacíos con letras aleatorias
  const alphabet = lang === 'es' 
    ? "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ" 
    : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
  }

  return { grid, placements };
}

function placeWord(grid, word, size, directions) {
  // Posibles vectores de dirección
  const dirVectors = [];
  
  if (directions.horizontal) {
    dirVectors.push({ r: 0, c: 1 }); // Derecha
    if (directions.reverse) dirVectors.push({ r: 0, c: -1 }); // Izquierda
  }
  if (directions.vertical) {
    dirVectors.push({ r: 1, c: 0 }); // Abajo
    if (directions.reverse) dirVectors.push({ r: -1, c: 0 }); // Arriba
  }
  if (directions.diagonal) {
    dirVectors.push({ r: 1, c: 1 }); // Abajo-Derecha
    dirVectors.push({ r: 1, c: -1 }); // Abajo-Izquierda
    if (directions.reverse) {
      dirVectors.push({ r: -1, c: 1 }); // Arriba-Derecha
      dirVectors.push({ r: -1, c: -1 }); // Arriba-Izquierda
    }
  }

  // Si no hay direcciones habilitadas por error, usar por defecto horizontal
  if (dirVectors.length === 0) {
    dirVectors.push({ r: 0, c: 1 });
  }

  // Barajar las celdas de inicio y las direcciones para buscar aleatoriamente
  const candidates = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      for (const dir of dirVectors) {
        candidates.push({ r, c, dir });
      }
    }
  }

  // Mezclar candidatos para aleatoriedad
  shuffle(candidates);

  // Intentar colocar la palabra en cada candidato
  for (const { r, c, dir } of candidates) {
    if (canPlaceAt(grid, word, r, c, dir, size)) {
      const placedCoords = [];
      for (let i = 0; i < word.length; i++) {
        const currR = r + dir.r * i;
        const currC = c + dir.c * i;
        grid[currR][currC] = word[i];
        placedCoords.push({ r: currR, c: currC });
      }
      return placedCoords;
    }
  }

  return null; // No se pudo colocar
}

function canPlaceAt(grid, word, startR, startC, dir, size) {
  for (let i = 0; i < word.length; i++) {
    const r = startR + dir.r * i;
    const c = startC + dir.c * i;

    // Verificar límites
    if (r < 0 || r >= size || c < 0 || c >= size) {
      return false;
    }

    // Verificar colisión (debe estar vacío o coincidir la letra)
    if (grid[r][c] !== '' && grid[r][c] !== word[i]) {
      return false;
    }
  }
  return true;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
