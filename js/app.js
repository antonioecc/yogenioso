import audio from './audio.js';
import { getLevel, themes } from './levels.js';
import { generateWordSearch } from './generator.js';

class SopaSensorialApp {
  constructor() {
    this.currentView = 'menu-view';
    this.totalXP = parseInt(localStorage.getItem('sopa_sensorial_xp') || '0');
    this.completedLevels = JSON.parse(localStorage.getItem('sopa_sensorial_completed') || '[]');
    
    this.currentLevel = null;
    this.gridData = null; // Contiene { grid, placements }
    this.foundWords = [];
    
    // Paginación y control de mundos
    this.currentWorld = 1; // 20 niveles por mundo (50 mundos en total)
    this.levelsPerWorld = 20;
    this.totalWorlds = 50;

    // Estados de selección por arrastre
    this.isSelecting = false;
    this.startCell = null; // {r, c}
    this.currentPath = []; // [{r, c}, ...]
    this.solvedPlacements = []; // Guardará las líneas de palabras encontradas [{start: {r,c}, end: {r,c}, color}]

    // Elementos del DOM
    this.views = {
      menu: document.getElementById('menu-view'),
      levels: document.getElementById('levels-view'),
      game: document.getElementById('game-view'),
      celebration: document.getElementById('celebration-overlay')
    };

    this.bindEvents();
    this.updateXPDisplay();
    this.initSensoryCanvas();
  }

  // Actualizar indicadores de XP en la interfaz
  updateXPDisplay() {
    document.querySelectorAll('.xp-value').forEach(el => {
      el.textContent = this.totalXP;
    });
  }

  // Guardar estado en LocalStorage
  saveState() {
    localStorage.setItem('sopa_sensorial_xp', this.totalXP.toString());
    localStorage.setItem('sopa_sensorial_completed', JSON.stringify(this.completedLevels));
  }

  // Vincular eventos de UI globales
  bindEvents() {
    // Botones de navegación
    document.getElementById('btn-play-main').addEventListener('click', () => {
      audio.playClick();
      this.switchView('levels-view');
      this.renderLevelsMap();
    });

    document.getElementById('btn-back-levels').addEventListener('click', () => {
      audio.playClick();
      this.switchView('menu-view');
    });

    document.getElementById('btn-back-game').addEventListener('click', () => {
      audio.playClick();
      this.switchView('levels-view');
      this.renderLevelsMap();
    });

    document.getElementById('btn-next-level').addEventListener('click', () => {
      audio.playClick();
      this.views.celebration.classList.remove('active');
      
      const nextLevelId = this.currentLevel.id + 1;
      if (nextLevelId <= 1000) {
        // Ajustar el mundo activo automáticamente si pasa al siguiente mundo
        const targetWorld = Math.ceil(nextLevelId / this.levelsPerWorld);
        this.currentWorld = targetWorld;
        
        const nextLevel = getLevel(nextLevelId);
        this.loadLevel(nextLevel);
      } else {
        // Volver al mapa si completó el juego (nivel 1000)
        this.switchView('levels-view');
        this.renderLevelsMap();
      }
    });

    // Soporte para redimensionamiento
    window.addEventListener('resize', () => {
      if (this.currentView === 'game-view') {
        this.redrawSVGSelections();
      }
    });

    // Ajustes sensoriales
    const chkSounds = document.getElementById('chk-sounds');
    const chkTts = document.getElementById('chk-tts');
    
    if (chkSounds) {
      chkSounds.addEventListener('change', (e) => {
        audio.soundsEnabled = e.target.checked;
        audio.playClick();
      });
    }

    if (chkTts) {
      chkTts.addEventListener('change', (e) => {
        audio.ttsEnabled = e.target.checked;
        if (e.target.checked) {
          audio.speak("Voz encendida", 'es-ES');
        }
      });
    }
  }

  // Cambiar vista activa
  switchView(viewId) {
    this.currentView = viewId;
    Object.keys(this.views).forEach(key => {
      if (this.views[key].id === viewId) {
        this.views[key].classList.add('active');
      } else {
        this.views[key].classList.remove('active');
      }
    });
    audio.init();
  }

  // Renderizar mapa de niveles (Roadmap)
  renderLevelsMap() {
    const levelsView = document.getElementById('levels-view');
    
    // Crear o recuperar el selector de Mundo
    let worldSelectorContainer = document.getElementById('world-selector-container');
    if (!worldSelectorContainer) {
      worldSelectorContainer = document.createElement('div');
      worldSelectorContainer.id = 'world-selector-container';
      worldSelectorContainer.style.display = 'flex';
      worldSelectorContainer.style.justifyContent = 'center';
      worldSelectorContainer.style.alignItems = 'center';
      worldSelectorContainer.style.gap = '15px';
      worldSelectorContainer.style.margin = '15px 0';
      
      levelsView.insertBefore(worldSelectorContainer, levelsView.querySelector('.levels-grid'));
    }

    // Configurar botones de avanzar/retroceder mundos
    worldSelectorContainer.innerHTML = `
      <button id="btn-prev-world" class="btn btn-secondary btn-icon" ${this.currentWorld === 1 ? 'disabled style="opacity: 0.3;"' : ''}>◀</button>
      <span style="font-size: 1.3rem; font-weight: 800; min-width: 150px; text-align: center;">Mundo ${this.currentWorld} / ${this.totalWorlds}</span>
      <button id="btn-next-world" class="btn btn-secondary btn-icon" ${this.currentWorld === this.totalWorlds ? 'disabled style="opacity: 0.3;"' : ''}>▶</button>
    `;

    document.getElementById('btn-prev-world').addEventListener('click', () => {
      if (this.currentWorld > 1) {
        audio.playClick();
        this.currentWorld--;
        this.renderLevelsMap();
      }
    });

    document.getElementById('btn-next-world').addEventListener('click', () => {
      if (this.currentWorld < this.totalWorlds) {
        audio.playClick();
        this.currentWorld++;
        this.renderLevelsMap();
      }
    });

    const levelsGrid = document.querySelector('.levels-grid');
    levelsGrid.innerHTML = '';

    // Rango de niveles para el mundo actual
    const startId = (this.currentWorld - 1) * this.levelsPerWorld + 1;
    const endId = Math.min(this.currentWorld * this.levelsPerWorld, 1000);

    for (let id = startId; id <= endId; id++) {
      const level = getLevel(id);
      
      const isCompleted = this.completedLevels.includes(level.id);
      // Desbloqueado si es el nivel 1 o si el anterior está completado
      const isLocked = level.id > 1 && !this.completedLevels.includes(level.id - 1);
      
      const themeInfo = themes[level.theme] || { name: 'Especial', icon: '⭐', color: '#6366f1' };
      
      const card = document.createElement('div');
      card.className = `level-card ${isLocked ? 'locked' : ''}`;
      card.style.setProperty('--theme-color', themeInfo.color);
      
      card.innerHTML = `
        <div class="level-card-header">
          <span class="level-badge" style="background: ${themeInfo.color}33; color: ${themeInfo.color}">${level.lang === 'es' ? 'Español' : 'English'}</span>
          <span class="level-status-icon">${isLocked ? '🔒' : (isCompleted ? '⭐' : '🟢')}</span>
        </div>
        <div class="level-theme-icon" style="color: ${themeInfo.color}">${themeInfo.icon}</div>
        <div class="level-title">${level.name}</div>
        <div class="level-meta">
          <span>${level.gridSize}x${level.gridSize}</span>
          <span>+${level.xpReward} XP</span>
        </div>
      `;

      if (!isLocked) {
        card.addEventListener('click', () => {
          audio.playClick();
          this.loadLevel(level);
        });
      }
      
      levelsGrid.appendChild(card);
    }
  }

  // Iniciar un nivel de sopa de letras
  loadLevel(level) {
    this.currentLevel = level;
    this.foundWords = [];
    this.solvedPlacements = [];
    this.isSelecting = false;
    this.startCell = null;
    this.currentPath = [];
    
    // Generar cuadrícula en base a palabras y dificultad
    this.gridData = generateWordSearch(level.words, level.gridSize, level.directions, level.lang);

    // Actualizar UI del juego
    const themeInfo = themes[level.theme] || { icon: '⭐' };
    document.getElementById('game-title').textContent = `${themeInfo.icon} ${level.name}`;
    this.renderGameBoard();
    this.renderWordsList();
    this.switchView('game-view');

    // Forzar redibujado de las líneas SVG
    setTimeout(() => this.redrawSVGSelections(), 50);
  }

  // Renderizar la cuadrícula del tablero
  renderGameBoard() {
    const gridContainer = document.getElementById('grid-container');
    gridContainer.innerHTML = '';

    const size = this.gridData.grid.length;
    const gridEl = document.createElement('div');
    gridEl.className = 'word-search-grid';
    gridEl.id = 'word-search-grid';
    gridEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    gridEl.style.setProperty('--grid-size', size);

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.textContent = this.gridData.grid[r][c];
        cell.dataset.r = r;
        cell.dataset.c = c;
        gridEl.appendChild(cell);
      }
    }

    // SVG overlay para dibujar las selecciones de arrastre y palabras encontradas
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'selection-svg');
    svg.setAttribute('id', 'selection-svg');
    
    gridContainer.appendChild(gridEl);
    gridContainer.appendChild(svg);

    this.setupGestureControls(gridEl);
  }

  // Renderizar lista de palabras para buscar
  renderWordsList() {
    const listContainer = document.getElementById('words-list');
    listContainer.innerHTML = '';

    this.currentLevel.words.forEach(word => {
      const item = document.createElement('div');
      item.className = 'word-item';
      item.textContent = word;
      item.id = `word-${word.toUpperCase().replace(/\s+/g, '')}`;
      listContainer.appendChild(item);
    });
  }

  // Configurar gestos de arrastre táctil y ratón
  setupGestureControls(gridEl) {
    const handleStart = (clientX, clientY) => {
      const cell = this.getCellFromCoords(clientX, clientY);
      if (cell) {
        this.isSelecting = true;
        this.startCell = cell;
        this.currentPath = [cell];
        this.updateCellsSelectionUI();
        audio.playTick();
        if (navigator.vibrate) navigator.vibrate(15);
      }
    };

    const handleMove = (clientX, clientY) => {
      if (!this.isSelecting || !this.startCell) return;
      const cell = this.getCellFromCoords(clientX, clientY);
      if (cell) {
        this.calculatePath(this.startCell, cell);
      }
    };

    const handleEnd = () => {
      if (!this.isSelecting) return;
      this.isSelecting = false;
      this.checkWordSelection();
      this.currentPath = [];
      this.updateCellsSelectionUI();
      this.redrawSVGSelections();
    };

    // Eventos de ratón
    gridEl.addEventListener('mousedown', (e) => {
      e.preventDefault();
      handleStart(e.clientX, e.clientY);
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isSelecting) {
        e.preventDefault();
        handleMove(e.clientX, e.clientY);
      }
    });

    window.addEventListener('mouseup', () => {
      handleEnd();
    });

    // Eventos táctiles
    gridEl.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    }, { passive: false });

    gridEl.addEventListener('touchmove', (e) => {
      if (this.isSelecting) {
        e.preventDefault();
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      }
    }, { passive: false });

    gridEl.addEventListener('touchend', () => {
      handleEnd();
    });
  }

  // Obtener celda en base a las coordenadas de pantalla
  getCellFromCoords(clientX, clientY) {
    const el = document.elementFromPoint(clientX, clientY);
    if (el && el.classList.contains('grid-cell')) {
      const r = parseInt(el.dataset.r);
      const c = parseInt(el.dataset.c);
      return { r, c, el };
    }
    return null;
  }

  // Calcular la línea recta/diagonal desde la celda inicial a la actual
  calculatePath(start, current) {
    const dr = current.r - start.r;
    const dc = current.c - start.c;
    
    // Si no se movió de la celda de inicio
    if (dr === 0 && dc === 0) {
      if (this.currentPath.length !== 1) {
        this.currentPath = [start];
        this.updateCellsSelectionUI();
      }
      return;
    }

    // Determinar la dirección dominante
    let stepR = 0;
    let stepC = 0;
    let steps = 0;

    const absDr = Math.abs(dr);
    const absDc = Math.abs(dc);

    if (dr === 0) {
      // Horizontal
      stepC = Math.sign(dc);
      steps = absDc;
    } else if (dc === 0) {
      // Vertical
      stepR = Math.sign(dr);
      steps = absDr;
    } else if (absDr === absDc) {
      // Diagonal perfecta
      stepR = Math.sign(dr);
      stepC = Math.sign(dc);
      steps = absDr;
    } else {
      return;
    }

    const newPath = [];
    for (let i = 0; i <= steps; i++) {
      const r = start.r + stepR * i;
      const c = start.c + stepC * i;
      
      const el = document.querySelector(`.grid-cell[data-r="${r}"][data-c="${c}"]`);
      if (el) {
        newPath.push({ r, c, el });
      }
    }

    if (newPath.length !== this.currentPath.length) {
      this.currentPath = newPath;
      this.updateCellsSelectionUI();
      audio.playTick();
      if (navigator.vibrate) navigator.vibrate(15);
    }
  }

  // Actualizar clases de selección en la cuadrícula y redibujar línea SVG de arrastre
  updateCellsSelectionUI() {
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
      cell.classList.remove('selected-current');
    });

    this.currentPath.forEach(node => {
      node.el.classList.add('selected-current');
    });

    this.redrawSVGSelections();
  }

  // Redibujar todas las líneas marcadoras fluorescentes en el SVG overlay
  redrawSVGSelections() {
    const svg = document.getElementById('selection-svg');
    if (!svg) return;
    svg.innerHTML = '';

    const grid = document.getElementById('word-search-grid');
    if (!grid) return;
    const gridRect = grid.getBoundingClientRect();

    // 1. Dibujar líneas de palabras encontradas
    this.solvedPlacements.forEach(line => {
      const startCellEl = document.querySelector(`.grid-cell[data-r="${line.start.r}"][data-c="${line.start.c}"]`);
      const endCellEl = document.querySelector(`.grid-cell[data-r="${line.end.r}"][data-c="${line.end.c}"]`);
      
      if (startCellEl && endCellEl) {
        const startRect = startCellEl.getBoundingClientRect();
        const endRect = endCellEl.getBoundingClientRect();
        
        const x1 = (startRect.left + startRect.width / 2) - gridRect.left;
        const y1 = (startRect.top + startRect.height / 2) - gridRect.top;
        const x2 = (endRect.left + endRect.width / 2) - gridRect.left;
        const y2 = (endRect.top + endRect.height / 2) - gridRect.top;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        path.setAttribute('x1', x1);
        path.setAttribute('y1', y1);
        path.setAttribute('x2', x2);
        path.setAttribute('y2', y2);
        path.setAttribute('class', 'found-line');
        path.setAttribute('style', `stroke: ${line.color};`);
        svg.appendChild(path);
      }
    });

    // 2. Dibujar línea de la selección actual
    if (this.currentPath.length > 1) {
      const startNode = this.currentPath[0];
      const endNode = this.currentPath[this.currentPath.length - 1];
      
      const startRect = startNode.el.getBoundingClientRect();
      const endRect = endNode.el.getBoundingClientRect();

      const x1 = (startRect.left + startRect.width / 2) - gridRect.left;
      const y1 = (startRect.top + startRect.height / 2) - gridRect.top;
      const x2 = (endRect.left + endRect.width / 2) - gridRect.left;
      const y2 = (endRect.top + endRect.height / 2) - gridRect.top;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      path.setAttribute('x1', x1);
      path.setAttribute('y1', y1);
      path.setAttribute('x2', x2);
      path.setAttribute('y2', y2);
      path.setAttribute('class', 'selection-line');
      svg.appendChild(path);
    }
  }

  // Verificar si la selección actual forma una palabra válida
  checkWordSelection() {
    if (this.currentPath.length < 2) return;

    // Obtener la palabra en sentido normal e inverso
    const selectedChars = this.currentPath.map(node => node.el.textContent).join('');
    const reversedChars = selectedChars.split('').reverse().join('');

    let matchedWord = null;
    let isReversed = false;

    for (const word of this.currentLevel.words) {
      const cleanTarget = word
        .toUpperCase()
        .replace(/\s+/g, '')
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      if (!this.foundWords.includes(word)) {
        if (selectedChars === cleanTarget) {
          matchedWord = word;
          break;
        } else if (reversedChars === cleanTarget) {
          matchedWord = word;
          isReversed = true;
          break;
        }
      }
    }

    if (matchedWord) {
      this.foundWords.push(matchedWord);
      
      const themeColor = themes[this.currentLevel.theme].color;
      
      const start = isReversed ? this.currentPath[this.currentPath.length - 1] : this.currentPath[0];
      const end = isReversed ? this.currentPath[0] : this.currentPath[this.currentPath.length - 1];
      this.solvedPlacements.push({
        start: { r: start.r, c: start.c },
        end: { r: end.r, c: end.c },
        color: themeColor
      });

      this.currentPath.forEach(node => {
        node.el.classList.add('found');
        node.el.classList.add('sparkle');
        node.el.style.setProperty('--found-color', themeColor);
        this.createParticles(node.el);
      });

      const wordItem = document.getElementById(`word-${matchedWord.toUpperCase().replace(/\s+/g, '')}`);
      if (wordItem) {
        wordItem.classList.add('found');
      }

      audio.playSuccess();
      setTimeout(() => {
        audio.speak(matchedWord, this.currentLevel.lang === 'en' ? 'en-US' : 'es-ES');
      }, 300);

      if (this.foundWords.length === this.currentLevel.words.length) {
        this.completeLevel();
      }
    } else {
      audio.playCancel();
    }
  }

  // Crear destellos/partículas visuales al encontrar palabra
  createParticles(element) {
    const rect = element.getBoundingClientRect();
    const grid = document.getElementById('word-search-grid');
    if (!grid) return;
    const gridRect = grid.getBoundingClientRect();
    
    const count = 12;
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('span');
      particle.className = 'particle';
      
      const size = Math.random() * 8 + 4;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      const x = (rect.left + rect.width / 2) - gridRect.left;
      const y = (rect.top + rect.height / 2) - gridRect.top;
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;

      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 80 + 40;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;
      
      particle.style.setProperty('--tx', `${tx}px`);
      particle.style.setProperty('--ty', `${ty}px`);
      
      const colors = ['#fff', themes[this.currentLevel.theme].color, '#ffd43b', '#74c0fc'];
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];

      grid.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 800);
    }
  }

  // Completar el nivel actual
  completeLevel() {
    if (!this.completedLevels.includes(this.currentLevel.id)) {
      this.completedLevels.push(this.currentLevel.id);
      this.totalXP += this.currentLevel.xpReward;
      this.saveState();
      this.updateXPDisplay();
    }

    setTimeout(() => {
      audio.playVictory();
      document.getElementById('celebration-xp').textContent = `+${this.currentLevel.xpReward}`;
      this.views.celebration.classList.add('active');
    }, 1000);
  }

  // Inicializar canvas de canicas interactivas en el menú principal
  initSensoryCanvas() {
    const canvas = document.getElementById('menu-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    this.canvas = canvas;
    this.canvasCtx = ctx;

    this.marbles = [];
    this.pointer = { x: null, y: null, active: false };

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Crear canicas con colores vibrantes del juego
    const colors = ['#ff6b6b', '#f59f00', '#4dabf7', '#ae3ec9', '#15aabf', '#40c057', '#fa5252', '#7950f2'];
    for (let i = 0; i < 12; i++) {
      const radius = Math.random() * 12 + 16; // Radio entre 16 y 28px
      this.marbles.push({
        x: Math.random() * (canvas.width - radius * 2) + radius,
        y: Math.random() * (canvas.height - radius * 2) + radius,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        radius: radius,
        color: colors[i % colors.length]
      });
    }

    const updatePointer = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      this.pointer.x = clientX - rect.left;
      this.pointer.y = clientY - rect.top;
    };

    canvas.addEventListener('mousemove', (e) => {
      this.pointer.active = true;
      updatePointer(e.clientX, e.clientY);
    });

    canvas.addEventListener('mouseleave', () => {
      this.pointer.active = false;
    });

    canvas.addEventListener('mousedown', (e) => {
      this.pointer.active = true;
      updatePointer(e.clientX, e.clientY);
      this.handleCanvasClick();
    });

    canvas.addEventListener('touchstart', (e) => {
      this.pointer.active = true;
      const touch = e.touches[0];
      updatePointer(touch.clientX, touch.clientY);
      this.handleCanvasClick();
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      updatePointer(touch.clientX, touch.clientY);
    }, { passive: true });

    canvas.addEventListener('touchend', () => {
      this.pointer.active = false;
    });

    this.animateSensoryCanvas();
  }

  handleCanvasClick() {
    this.marbles.forEach(marble => {
      const dx = marble.x - this.pointer.x;
      const dy = marble.y - this.pointer.y;
      const dist = Math.hypot(dx, dy);
      if (dist < marble.radius + 30) {
        const angle = Math.atan2(dy, dx);
        marble.vx += Math.cos(angle) * 7;
        marble.vy += Math.sin(angle) * 7;
        audio.playTick();
        if (navigator.vibrate) navigator.vibrate(10);
      }
    });
  }

  animateSensoryCanvas() {
    if (this.currentView !== 'menu-view') {
      requestAnimationFrame(() => this.animateSensoryCanvas());
      return;
    }

    const ctx = this.canvasCtx;
    const canvas = this.canvas;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.marbles.forEach(marble => {
      marble.x += marble.vx;
      marble.y += marble.vy;

      marble.vx *= 0.995;
      marble.vy *= 0.995;

      if (marble.x - marble.radius < 0) {
        marble.x = marble.radius;
        marble.vx = -marble.vx * 0.9;
      }
      if (marble.x + marble.radius > canvas.width) {
        marble.x = canvas.width - marble.radius;
        marble.vx = -marble.vx * 0.9;
      }
      if (marble.y - marble.radius < 0) {
        marble.y = marble.radius;
        marble.vy = -marble.vy * 0.9;
      }
      if (marble.y + marble.radius > canvas.height) {
        marble.y = canvas.height - marble.radius;
        marble.vy = -marble.vy * 0.9;
      }

      if (this.pointer.active && this.pointer.x !== null) {
        const dx = marble.x - this.pointer.x;
        const dy = marble.y - this.pointer.y;
        const dist = Math.hypot(dx, dy);
        const maxDist = 100;
        
        if (dist < maxDist) {
          const force = (maxDist - dist) / maxDist;
          const angle = Math.atan2(dy, dx);
          marble.vx += Math.cos(angle) * force * 0.4;
          marble.vy += Math.sin(angle) * force * 0.4;
        }
      }

      // Dibujar la canica con gradiente 3D
      ctx.beginPath();
      const grad = ctx.createRadialGradient(
        marble.x - marble.radius/3, marble.y - marble.radius/3, marble.radius/10,
        marble.x, marble.y, marble.radius
      );
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, marble.color);
      grad.addColorStop(1, '#000000');

      ctx.fillStyle = grad;
      ctx.shadowColor = marble.color;
      ctx.shadowBlur = 8;
      ctx.arc(marble.x, marble.y, marble.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    });

    ctx.shadowBlur = 0;
    requestAnimationFrame(() => this.animateSensoryCanvas());
  }
}

// Iniciar aplicación al cargar
window.addEventListener('DOMContentLoaded', () => {
  const app = new SopaSensorialApp();
});
