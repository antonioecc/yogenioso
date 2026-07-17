// Base de datos de palabras por temáticas y generador sembrado de 1000 niveles

// Temáticas disponibles con sus colores e iconos
export const themes = {
  COMIDAS: { name: "Comidas / Foods", icon: "🍔", color: "#ff6b6b" },
  RECETAS: { name: "Recetas / Recipes", icon: "🍳", color: "#f59f00" },
  MARBLE_RUN: { name: "Marble Run", icon: "🔮", color: "#4dabf7" },
  GIMNASIA: { name: "Gimnasia / Gym", icon: "🤸", color: "#ae3ec9" },
  NATACION: { name: "Natación / Swim", icon: "🏊", color: "#15aabf" },
  DINOSAURIOS: { name: "Dinosaurios", icon: "🦖", color: "#40c057" },
  YOUTUBE: { name: "YouTube", icon: "📺", color: "#fa5252" },
  SECUENCIAS: { name: "Secuencias / Patterns", icon: "🔢", color: "#7950f2" },
  PAISAJES: { name: "Paisajes / Landscapes", icon: "🏔️", color: "#228be6" },
  VENEZUELA: { name: "Venezuela", icon: "🇻🇪", color: "#fab005" },
  ANIMALES: { name: "Animales / Animals", icon: "🦁", color: "#12b886" },
  PAISES: { name: "Países / Countries", icon: "🌍", color: "#be4bdb" },
  ESPACIO: { name: "Espacio / Space", icon: "🚀", color: "#e64980" },
  TECNOLOGIA: { name: "Tecnología / Tech", icon: "🤖", color: "#0c8599" }
};

// Diccionarios extensos de palabras por idioma
const wordPools = {
  COMIDAS: {
    es: [
      "MANZANA", "PLATANO", "FRESA", "UVA", "NARANJA", "PERA", "PIÑA", "SANDIA", "MANGO", "LIMON",
      "MELON", "DURAZNO", "CEREZA", "PAPA", "TOMATE", "LECHUGA", "ZANAHORIA", "CEBOLLA", "AJO", "PEPINO",
      "PIZZA", "HAMBURGUESA", "PASTA", "ARROZ", "POLLO", "CARNE", "PESCADO", "QUESO", "HUEVO", "PAN",
      "CHOCOLATE", "HELADO", "TARTA", "GALLETA", "DONA", "DULCE", "YOGUR", "MANTEQUILLA", "SOPA", "CREMA"
    ],
    en: [
      "APPLE", "BANANA", "STRAWBERRY", "GRAPE", "ORANGE", "PEAR", "PINEAPPLE", "WATERMELON", "MANGO", "LEMON",
      "MELON", "PEACH", "CHERRY", "POTATO", "TOMATE", "LETTUCE", "CARROT", "ONION", "GARLIC", "CUCUMBER",
      "PIZZA", "BURGER", "PASTA", "RICE", "CHICKEN", "MEAT", "FISH", "CHEESE", "EGG", "BREAD",
      "CHOCOLATE", "ICE CREAM", "CAKE", "COOKIE", "DONUT", "CANDY", "YOGURT", "BUTTER", "SOUP", "CREAM"
    ]
  },
  RECETAS: {
    es: [
      "MEZCLAR", "HORNEAR", "CORTAR", "HERVIR", "FREIR", "BATIR", "LICUAR", "AMASAR", "PELAR", "RALLAR",
      "CUCHARA", "TENEDOR", "CUCHILLO", "SARTEN", "OLLA", "BOL", "HORNO", "LICUADORA", "RALLADOR", "MOLDE",
      "HARINA", "AZUCAR", "SAL", "ACEITE", "PIMIENTA", "VINAGRE", "LEVADURA", "VAINILLA", "CANELA", "MIEL",
      "INGREDIENTE", "MEDIDA", "TIEMPO", "CALOR", "FUEGO", "TAPA", "PLATO", "VASO", "DELANTAL", "COCINA"
    ],
    en: [
      "MIX", "BAKE", "CUT", "BOIL", "FRY", "WHISK", "BLEND", "KNEAD", "PEEL", "GRATE",
      "SPOON", "FORK", "KNIFE", "PAN", "POT", "BOWL", "OVEN", "BLENDER", "GRATER", "MOLD",
      "FLOUR", "SUGAR", "SET", "OIL", "PEPPER", "VINEGAR", "YEAST", "VANILLA", "CINNAMON", "HONEY",
      "INGREDIENT", "MEASURE", "TIME", "HEAT", "FIRE", "LID", "PLATE", "GLASS", "APRON", "KITCHEN"
    ]
  },
  MARBLE_RUN: {
    es: [
      "CANICA", "PISTA", "GRAVEDAD", "RAMPA", "EMBUDO", "LOOP", "TUBO", "CARRERA", "GIRO", "BOUNCE",
      "COLECTOR", "ASCENSOR", "ESPIRAL", "DIVISOR", "VELOCIDAD", "FISICA", "SONIDO", "REBOTAR", "CAMINO", "CAIDA",
      "PUNTOS", "CARRIL", "MADERA", "PLASTICO", "CRISTAL", "CANAL", "ALTURA", "TIEMPO", "INERCIA", "IMPACTO",
      "ENTRADA", "SALIDA", "INTERRUPTOR", "PUENTE", "BLOQUE", "SOPORTE", "COLUMNA", "BASE", "COMPETICION", "GANADOR"
    ],
    en: [
      "MARBLE", "TRACK", "GRAVITY", "RAMP", "FUNNEL", "LOOP", "TUBE", "RACE", "SPIN", "BOUNCE",
      "CATCHER", "ELEVATOR", "SPIRAL", "SPLITTER", "SPEED", "PHYSICS", "SOUND", "BOUNCE", "PATH", "DROP",
      "POINTS", "LANE", "WOOD", "PLASTIC", "GLASS", "CHANNEL", "HEIGHT", "TIME", "INERTIA", "IMPACT",
      "INPUT", "OUTPUT", "SWITCH", "BRIDGE", "BLOCK", "SUPPORT", "COLUMN", "BASE", "RACEWAY", "WINNER"
    ]
  },
  GIMNASIA: {
    es: [
      "SALTO", "VOLTERETA", "FLEXIBILIDAD", "APOYO", "EQUILIBRIO", "ANILLAS", "BARRA", "SUELO", "TAPICES", "ACROBACIA",
      "GIRO", "FUERZA", "POSTURA", "PISADA", "RITMICA", "ARTISTICA", "PODIO", "MEDALLA", "PUNTUACION", "JUEZ",
      "SOGA", "PELOTA", "ARO", "MAZAS", "CINTA", "ENTRENADOR", "EQUIPO", "PRUEBA", "ESTIRAMIENTO", "GIMNASTA"
    ],
    en: [
      "JUMP", "SOMERSAULT", "FLEXIBILITY", "SUPPORT", "BALANCE", "RINGS", "BAR", "FLOOR", "MATS", "ACROBATICS",
      "TWIST", "STRENGTH", "POSTURE", "STEP", "RHYTHMIC", "ARTISTIC", "PODIUM", "MEDAL", "SCORE", "JUDGE",
      "ROPE", "BALL", "HOOP", "CLUBS", "RIBBON", "COACH", "TEAM", "EVENT", "STRETCH", "GYMNAST"
    ]
  },
  NATACION: {
    es: [
      "PISCINA", "ESTILO", "MARIPOSA", "CROL", "DORSO", "BUCEO", "BRAZADA", "GAFAS", "AGUA", "VELOCIDAD",
      "SALTO", "TRAMPOLIN", "GORRO", "SALVAVIDAS", "RELEVOS", "CARRIL", "CRONOMETRO", "MEDALLA", "PODIO", "COMPETIR",
      "RESPIRACION", "FLOTAR", "PATEAR", "GIRAR", "FONDO", "DUCHA", "ENTRENAMIENTO", "PULSACIONES", "RECORD", "PRACTICA"
    ],
    en: [
      "POOL", "STYLE", "BUTTERFLY", "CRAWL", "BACKSTROKE", "DIVING", "STROKE", "GOGGLES", "WATER", "SPEED",
      "JUMP", "BOARD", "CAP", "LIFEGUARD", "RELAYS", "LANE", "STOPWATCH", "MEDAL", "PODIUM", "COMPETE",
      "BREATHING", "FLOAT", "KICK", "TURN", "BOTTOM", "SHOWER", "TRAINING", "HEART RATE", "RECORD", "PRACTICE"
    ]
  },
  DINOSAURIOS: {
    es: [
      "DINOSAURIO", "FOSIL", "HUESO", "VOLCAN", "ERA", "T REX", "TRICERATOPS", "VELOCIRAPTOR", "STEGOSAURIO", "BRONTOSAURIO",
      "GIGANTE", "HUEVO", "GARRAS", "DIENTES", "COLA", "PLUMAS", "HERBIVORO", "CARNIVORO", "DEPREDADOR", "PREHISTORICO",
      "JURASICO", "CRETACICO", "TRIASICO", "HUELLAS", "EXTINCION", "METEORITO", "SELVA", "MUSEO", "REPTIL", "ESQUELETO"
    ],
    en: [
      "DINOSAUR", "FOSSIL", "BONE", "VOLCANO", "ERA", "T REX", "TRICERATOPS", "VELOCIRAPTOR", "STEGOSAURUS", "BRONTOSAURUS",
      "GIANT", "EGG", "CLAWS", "TEETH", "TAIL", "FEATHERS", "HERBIVORE", "CARNIVORE", "PREDATOR", "PREHISTORIC",
      "JURASSIC", "CRETACEOUS", "TRIASSIC", "FOOTPRINTS", "EXTINCTION", "METEORITE", "JUNGLE", "MUSEO", "REPTILE", "SKELETON"
    ]
  },
  YOUTUBE: {
    es: [
      "VIDEO", "CANAL", "SUSCRIBIRSE", "LIKE", "CREADOR", "GAMING", "STREAM", "LISTA", "SHORTS", "VLOG",
      "COMENTARIO", "CAMPANA", "MINIATURA", "DIRECTO", "EDICION", "PANTALLA", "MICROFONO", "CAMARA", "AUDIO", "SOPORTE",
      "INTERNET", "VISITAS", "SEGUIDORES", "PLACA", "BOTON", "CONTENIDO", "MEMBRESIA", "PREMIO", "POPULAR", "COMPARTIR"
    ],
    en: [
      "VIDEO", "CHANNEL", "SUBSCRIBE", "LIKE", "CREATOR", "GAMING", "STREAM", "PLAYLIST", "SHORTS", "VLOG",
      "COMMENT", "BELL", "THUMBNAIL", "LIVE", "EDITING", "SCREEN", "MICROPHONE", "CAMERA", "AUDIO", "SUPPORT",
      "INTERNET", "VIEWS", "SUBSCRIBERS", "PLAY BUTTON", "BUTTON", "CONTENT", "MEMBERSHIP", "AWARD", "POPULAR", "SHARE"
    ]
  },
  SECUENCIAS: {
    es: [
      "NUMERO", "PATRON", "ORDEN", "SERIE", "SIGUIENTE", "REPETIR", "BLOQUE", "PASO", "LOGICA", "CICLO",
      "FORMA", "COLOR", "FIGURA", "SIMETRIA", "PUNTO", "LINEA", "REGLA", "SUMA", "RESTA", "MULTIPLICAR",
      "PROGRAMA", "BUCLE", "CÓDIGO", "ALGORITMO", "INSTRUCCION", "SECUENCIA", "MAPA", "CAMINO", "DISEÑO", "ELEMENTO"
    ],
    en: [
      "NUMBER", "PATTERN", "ORDER", "SERIES", "NEXT", "REPEAT", "BLOCK", "STEP", "LOGIC", "LOOP",
      "SHAPE", "COLOR", "FIGURE", "SYMMETRY", "POINT", "LINE", "RULE", "ADD", "SUBTRACT", "MULTIPLY",
      "PROGRAM", "LOOPING", "CODE", "ALGORITHM", "INSTRUCTION", "SEQUENCE", "MAP", "PATH", "DESIGN", "ELEMENT"
    ]
  },
  PAISAJES: {
    es: [
      "MONTAÑA", "VALLE", "RIO", "OCEANO", "DESIERTO", "FORESTA", "PLAYA", "NIEVE", "CASCADA", "ATARDECER",
      "VOLCAN", "LAGO", "BOSQUE", "PRADERA", "ISLA", "NUBE", "SOL", "LUNA", "ESTRELLA", "ARBOL",
      "FLOR", "PIEDRA", "TIERRA", "CAMPO", "SENDERO", "PAISAJE", "CORDILLERA", "CUMBRE", "COSTA", "CUEVA"
    ],
    en: [
      "MOUNTAIN", "VALLEY", "RIVER", "OCEAN", "DESERT", "FOREST", "BEACH", "SNOW", "WATERFALL", "SUNSET",
      "VOLCANO", "LAKE", "WOODS", "MEADOW", "ISLAND", "CLOUD", "SUN", "MOON", "STAR", "TREE",
      "FLOWER", "STONE", "EARTH", "FIELD", "TRAIL", "LANDSCAPE", "RANGE", "SUMMIT", "COAST", "CAVE"
    ]
  },
  VENEZUELA: {
    es: [
      "AREPA", "TEQUEÑO", "ORINOCO", "SALTO ANGEL", "CARACAS", "AVILA", "LLANO", "PLAYA", "ARPA", "CUATRO",
      "MARACA", "JOROPO", "EMPANADA", "PABELLON", "TAJADA", "CACHAPA", "QUESO LLANERO", "TURPIAL", "ARAGUANEY", "ORQUIDEA",
      "ROQUES", "MORROCOY", "MERIDA", "MOGOTE", "COLONIA TOVAR", "MARACAIBO", "PUENTE", "COCOROTE", "CHINCHORRO", "HAMACA"
    ],
    en: [
      "AREPA", "TEQUENO", "ORINOCO", "ANGEL FALLS", "CARACAS", "AVILA", "LLANOS", "BEACH", "HARP", "CUATRO",
      "MARACAS", "JOROPO", "EMPANADA", "PABELLON", "TAJADA", "CACHAPA", "LLANERO CHEESE", "TROUPIAL", "ARAGUANEY", "ORCHID",
      "ROQUES", "MORROCOY", "MERIDA", "CABLE CAR", "COLONIA TOVAR", "MARACAIBO", "BRIDGE", "COCOROTE", "CHINCHORRO", "HAMMOCK"
    ]
  },
  ANIMALES: {
    es: [
      "LEON", "TIGRE", "JIRAFA", "ELEFANTE", "MONO", "OSO", "AGUILA", "TIBURON", "DELFIN", "BALLENA",
      "PERRO", "GATO", "CABALLO", "VACA", "OVEJA", "GALLINA", "CONEJO", "RATON", "PANDA", "KOALA",
      "LANCE", "PUMA", "CEBRA", "HIPOPOTAMO", "COCODRILO", "TORTUGA", "SERPIENTE", "RANA", "PAJARO", "LORO"
    ],
    en: [
      "LION", "TIGER", "GIRAFFE", "ELEPHANT", "MONKEY", "BEAR", "EAGLE", "SHARK", "DOLPHIN", "WHALE",
      "DOG", "CAT", "HORSE", "COW", "SHEEP", "CHICKEN", "RABBIT", "MOUSE", "PANDA", "KOALA",
      "LEOPARD", "PUMA", "ZEBRA", "HIPPO", "CROCODILE", "TURTLE", "SNAKE", "FROG", "BIRD", "PARROT"
    ]
  },
  PAISES: {
    es: [
      "VENEZUELA", "ESPAÑA", "FRANCIA", "ITALIA", "ALEMANIA", "JAPON", "CHINA", "BRASIL", "ARGENTINA", "MEXICO",
      "CANADA", "PORTUGAL", "SUECIA", "SUIZA", "EGIPTO", "INDIA", "AUSTRALIA", "GRECIA", "COLOMBIA", "PERU",
      "CHILE", "INGLATERRA", "IRLANDA", "ESCOCIA", "BELGICA", "HOLANDA", "NORUEGA", "FINLANDIA", "TURQUIA", "RUSIA"
    ],
    en: [
      "VENEZUELA", "SPAIN", "FRANCE", "ITALY", "GERMANY", "JAPAN", "CHINA", "BRAZIL", "ARGENTINA", "MEXICO",
      "CANADA", "PORTUGAL", "SWEDEN", "SWITZERLAND", "EGYPT", "INDIA", "AUSTRALIA", "GREECE", "COLOMBIA", "PERU",
      "CHILE", "ENGLAND", "IRELAND", "SCOTLAND", "BELGIUM", "HOLLAND", "NORWAY", "FINLAND", "TURKEY", "RUSSIA"
    ]
  },
  ESPACIO: {
    es: [
      "PLANETA", "ESTRELLA", "GALAXIA", "COHETE", "ASTRONAUTA", "SATELITE", "COMETA", "TELESCOPIO", "UNIVERSO", "SOLAR",
      "TIERRA", "MARTE", "JUPITER", "SATURNO", "LUNA", "ORBITA", "GRAVEDAD", "CRATER", "NEBULOSA", "ASTEROIDE",
      "COMETA", "METEORITO", "COSMOS", "NAVE", "TRAJE", "ESTACION", "NASA", "SISTEMA", "CIELO", "POLVO"
    ],
    en: [
      "PLANET", "STAR", "GALAXY", "ROCKET", "ASTRONAUT", "SATELLITE", "COMET", "TELESCOPE", "UNIVERSE", "SOLAR",
      "EARTH", "MARS", "JUPITER", "SATURNO", "MOON", "ORBIT", "GRAVITY", "CRATER", "NEBULA", "ASTEROID",
      "METEOR", "COSMOS", "SPACESHIP", "SUIT", "STATION", "NASA", "SYSTEM", "SKY", "DUST", "GRAVITATION"
    ]
  },
  TECNOLOGIA: {
    es: [
      "ROBOT", "CHIP", "CODIGO", "INTERNET", "PANTALLA", "RATON", "TECLADO", "SOFTWARE", "DATOS", "MEMORIA",
      "CONEXION", "CABLE", "BATERIA", "RED", "PROGRAMACION", "APLICACION", "JUEGO", "COMPUTADORA", "CELULAR", "TABLET",
      "MENSAJE", "CORREO", "ARCHIVO", "CARPETA", "TECNOLOGIA", "IMPRESORA", "AURICULARES", "ALTAVOZ", "CARGADOR", "NUBE"
    ],
    en: [
      "ROBOT", "CHIP", "CODE", "INTERNET", "SCREEN", "MOUSE", "KEYBOARD", "SOFTWARE", "DATA", "MEMORY",
      "CONNECTION", "CABLE", "BATTERY", "NETWORK", "PROGRAMMING", "APPLICATION", "GAME", "COMPUTER", "PHONE", "TABLET",
      "MESSAGE", "EMAIL", "FILE", "FOLDER", "TECHNOLOGY", "PRINTER", "HEADPHONES", "SPEAKER", "CHARGER", "CLOUD"
    ]
  }
};

// Generador pseudoaleatorio Mulberry32 usando semilla para consistencia
function createPRNG(seed) {
  return function() {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Mezclar array usando el PRNG
function seededShuffle(array, prng) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Obtener la configuración del nivel de forma dinámica y consistente
export function getLevel(id) {
  // Inicializar PRNG usando el ID de nivel como semilla
  const prng = createPRNG(id + 1000); // Añadimos offset para variedad
  
  // Listado ordenado de temas para consistencia
  const themeKeys = Object.keys(themes);
  // Determinar tema: rotar temas cíclicamente
  const theme = themeKeys[Math.floor(prng() * themeKeys.length)];
  
  // Determinar idioma: alternar idiomas en base a la semilla
  const lang = prng() > 0.5 ? 'es' : 'en';
  
  // Dificultad basada en el rango de nivel (del 1 al 1000)
  let gridSize = 10;
  let wordCount = 8;
  let directions = { horizontal: true, vertical: true, diagonal: false, reverse: false };
  let xpReward = 100;
  
  if (id <= 50) {
    // Muy Fácil (Nivel 1 - 50)
    gridSize = 10;
    wordCount = 6;
    directions = { horizontal: true, vertical: true, diagonal: true, reverse: true };
    xpReward = 100;
  } else if (id <= 200) {
    // Fácil (Nivel 51 - 200)
    gridSize = 11;
    wordCount = 7;
    directions = { horizontal: true, vertical: true, diagonal: true, reverse: true };
    xpReward = 120;
  } else if (id <= 500) {
    // Medio (Nivel 201 - 500)
    gridSize = 12;
    wordCount = 8;
    directions = { horizontal: true, vertical: true, diagonal: true, reverse: true };
    xpReward = 180;
  } else if (id <= 800) {
    // Difícil (Nivel 501 - 800)
    gridSize = 14;
    wordCount = 10;
    directions = { horizontal: true, vertical: true, diagonal: true, reverse: true };
    xpReward = 250;
  } else {
    // Extremo (Nivel 801 - 1000)
    gridSize = 15;
    wordCount = 12;
    directions = { horizontal: true, vertical: true, diagonal: true, reverse: true };
    xpReward = 350;
  }

  // Obtener pool de palabras correspondientes
  const pool = wordPools[theme][lang];
  
  // Mezclar pool con el PRNG y tomar el número de palabras configuradas
  const shuffledPool = seededShuffle(pool, prng);
  
  // Tomar palabras únicas
  const selectedWords = [];
  const cleanWordChecker = [];
  
  for (const rawWord of shuffledPool) {
    const cleanWord = rawWord.toUpperCase().replace(/\s+/g, '');
    // Verificar que no se repitan palabras visualmente idénticas y que quepan en la cuadrícula
    if (cleanWord.length <= gridSize && !cleanWordChecker.includes(cleanWord)) {
      selectedWords.push(rawWord);
      cleanWordChecker.push(cleanWord);
    }
    if (selectedWords.length === wordCount) break;
  }

  // Generar nombre bonito
  const themeName = themes[theme].name.split(' / ')[0];
  const levelName = `${themeName} - Desafío ${id}`;

  return {
    id,
    theme,
    name: levelName,
    lang,
    gridSize,
    words: selectedWords,
    xpReward,
    directions
  };
}

// Exportar la lista de niveles total para visualización rápida (1000 ids)
export const levels = Array.from({ length: 1000 }, (_, i) => i + 1);
