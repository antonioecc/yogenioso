// ============================================================
// Módulo de Audio — Web Audio API + SpeechSynthesis
// IMPORTANTE (iOS Safari): AudioContext debe crearse y resumirse
// de forma SÍNCRONA dentro del handler del gesto del usuario.
// Usar async/await rompe el contexto del gesto en iOS y el audio
// queda bloqueado. Todos los métodos son SÍNCRONOS.
//
// iOS como PWA instalada (standalone) además:
//  - Pone el AudioContext en estado 'interrupted' (no estándar) al
//    bloquear la pantalla o ir a segundo plano; hay que reanudarlo.
//  - speechSynthesis debe "primarse" dentro de un gesto del usuario
//    o ignora en silencio los speak() hechos fuera de un gesto.
//  - El motor TTS queda pausado/atascado al volver del background.
//  - La utterance debe mantenerse referenciada o el recolector de
//    basura la destruye y corta la lectura a mitad de palabra.
// ============================================================

class AudioManager {
  constructor() {
    this.ctx = null;
    this.ttsEnabled = true;
    this.soundsEnabled = true;
    this._unlocked = false;
    this._ttsPrimed = false;
    this._voices = [];
    this._utterance = null;
    this._speakTimer = null;
    this._aliveTimer = null;

    // Cargar voces TTS lo antes posible
    // iOS entrega las voces de forma diferida; necesitamos onvoiceschanged
    if ('speechSynthesis' in window) {
      this._loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this._loadVoices();
      }
    }

    // iOS 16.4+: reproducir audio aunque el interruptor físico del
    // dispositivo esté en modo silencio (causa nº1 de "no suena nada")
    try {
      if ('audioSession' in navigator) {
        navigator.audioSession.type = 'playback';
      }
    } catch (e) { /* no soportado en este navegador */ }

    // Al volver del background, iOS deja el AudioContext en 'interrupted'
    // y el motor TTS pausado con la cola atascada: reanudar y limpiar.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.resume();
        this._checkAlive();
        if ('speechSynthesis' in window) {
          try {
            window.speechSynthesis.resume();
            window.speechSynthesis.cancel();
          } catch (e) { /* ignorar */ }
        }
      }
    });
  }

  _loadVoices() {
    const v = window.speechSynthesis.getVoices();
    if (v.length > 0) {
      this._voices = v;
    }
  }

  // ─────────────────────────────────────────────────────────
  // init() — DEBE llamarse SÍNCRONAMENTE desde un gesto del usuario.
  // Es idempotente y barato: puede (y debe) llamarse en cada toque,
  // porque tras una interrupción de iOS hace falta un gesto nuevo
  // para reanudar el contexto. NO usa await.
  // ─────────────────────────────────────────────────────────
  init() {
    try {
      // 1. Crear el contexto (síncrono — dentro del gesto).
      //    iOS puede cerrarlo tras una interrupción larga: recrearlo.
      if (!this.ctx || this.ctx.state === 'closed') {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this._unlocked = false;
      }

      // 2. Resume síncrono — cubre 'suspended' y también el estado
      //    'interrupted' que iOS usa al bloquear pantalla / cambiar de app.
      //    NO hacemos await; solo disparamos la promesa.
      if (this.ctx.state !== 'running') {
        this.ctx.resume(); // fire-and-forget intencional
      }

      // 3. Buffer silencioso para forzar desbloqueo completo en iOS
      if (!this._unlocked) {
        const buffer = this.ctx.createBuffer(1, 1, 22050);
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.ctx.destination);
        source.start(0);
        this._unlocked = true;
      }

      // 4. Primar el TTS dentro del gesto: sin esto, iOS (sobre todo
      //    como PWA instalada) ignora los speak() posteriores que
      //    llegan fuera de un gesto del usuario. Debe ser una utterance
      //    REAL (texto no vacío): iOS descarta las vacías sin desbloquear
      //    el motor, por eso hasta ahora había que apagar y encender el
      //    interruptor de voz para que funcionara.
      if (!this._ttsPrimed && 'speechSynthesis' in window) {
        try { window.speechSynthesis.resume(); } catch (e) { /* ignorar */ }
        const warmup = new SpeechSynthesisUtterance(' ');
        warmup.volume = 0;
        warmup.lang = 'es-ES';
        window.speechSynthesis.speak(warmup);
        this._ttsPrimed = true;
      }

      // 5. Vigilar que el contexto realmente suena (ver _checkAlive)
      this._checkAlive();
    } catch (e) {
      console.warn('AudioContext init error:', e);
    }
  }

  // ─────────────────────────────────────────────────────────
  // _checkAlive() — Detecta el contexto "zombi" de iOS: tras un
  // bloqueo de pantalla o background largo, el contexto puede volver
  // reportando 'running' pero con la sesión de audio muerta (no suena
  // nada y su reloj no avanza). Un contexto sano en 'running' SIEMPRE
  // avanza currentTime; si en 300ms no se movió, se cierra y se anula
  // para que init() (que corre en cada gesto) lo recree desbloqueado.
  // ─────────────────────────────────────────────────────────
  _checkAlive() {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    if (this._aliveTimer) return; // ya hay una comprobación en curso

    const t0 = ctx.currentTime;
    this._aliveTimer = setTimeout(() => {
      this._aliveTimer = null;
      if (this.ctx !== ctx) return; // ya fue recreado por otra vía
      if (ctx.state === 'running' && ctx.currentTime === t0) {
        try { ctx.close(); } catch (e) { /* ignorar */ }
        this.ctx = null;
        this._unlocked = false;
      }
    }, 300);
  }

  // ─────────────────────────────────────────────────────────
  // resume() — Reanuda el contexto si iOS lo suspendió o
  // interrumpió. Barato; seguro de llamar en cualquier momento.
  // ─────────────────────────────────────────────────────────
  resume() {
    if (this.ctx && this.ctx.state !== 'running' && this.ctx.state !== 'closed') {
      this.ctx.resume(); // fire-and-forget
    }
  }

  // ─────────────────────────────────────────────────────────
  // _ctx() — Devuelve el contexto listo para programar nodos, o null.
  // Reanuda (fire-and-forget) si está 'suspended' o 'interrupted';
  // los nodos programados sonarán en cuanto vuelva a 'running'.
  // ─────────────────────────────────────────────────────────
  _ctx() {
    if (!this.ctx) return null;

    // iOS puede cerrar el contexto tras una interrupción larga: recrearlo
    if (this.ctx.state === 'closed') {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this._unlocked = false;
      } catch (e) {
        return null;
      }
    }

    if (this.ctx.state !== 'running') {
      this.ctx.resume(); // fire-and-forget: cubre 'suspended' e 'interrupted'
      // Durante una interrupción de iOS (llamada, Siri) currentTime está
      // congelado: descartar el efecto para no acumular nodos que sonarían
      // todos a la vez en ráfaga al reanudar. 'suspended' sí se permite:
      // es el resume en curso dentro del propio gesto del usuario.
      if (this.ctx.state === 'interrupted') return null;
    }

    return this.ctx;
  }

  // ─────────────────────────────────────────────────────────
  // Sonido corto al deslizar letras
  // ─────────────────────────────────────────────────────────
  playTick() {
    if (!this.soundsEnabled) return;
    const ctx = this._ctx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  // ─────────────────────────────────────────────────────────
  // Sonido al cancelar / selección incorrecta
  // ─────────────────────────────────────────────────────────
  playCancel() {
    if (!this.soundsEnabled) return;
    const ctx = this._ctx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }

  // ─────────────────────────────────────────────────────────
  // Sonido alegre al encontrar una palabra correcta
  // ─────────────────────────────────────────────────────────
  playSuccess() {
    if (!this.soundsEnabled) return;
    const ctx = this._ctx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.15, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.3);
    });
  }

  // ─────────────────────────────────────────────────────────
  // Fanfarria al completar el nivel
  // ─────────────────────────────────────────────────────────
  playVictory() {
    if (!this.soundsEnabled) return;
    const ctx = this._ctx();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Escala ascendente
    const scale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88];
    scale.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);
      gain.gain.setValueAtTime(0.1, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.06 + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.1);
    });

    // Gran acorde triunfal
    const chord = [523.25, 659.25, 783.99, 987.77, 1046.50];
    const chordDelay = scale.length * 0.06 + 0.05;

    chord.forEach((freq, i) => {
      const osc    = ctx.createOscillator();
      const gain   = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, now + chordDelay);
      filter.frequency.exponentialRampToValueAtTime(4000, now + chordDelay + 0.2);

      osc.frequency.setValueAtTime(freq, now + chordDelay + i * 0.03);
      gain.gain.setValueAtTime(0, now + chordDelay + i * 0.03);
      gain.gain.linearRampToValueAtTime(0.12, now + chordDelay + i * 0.03 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + chordDelay + 1.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + chordDelay + i * 0.03);
      osc.stop(now + chordDelay + 1.5);
    });
  }

  // ─────────────────────────────────────────────────────────
  // Clic genérico de botón
  // ─────────────────────────────────────────────────────────
  playClick() {
    if (!this.soundsEnabled) return;
    const ctx = this._ctx();
    if (!ctx) return;

    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }

  // ─────────────────────────────────────────────────────────
  // TTS — Leer una palabra en voz alta
  // ─────────────────────────────────────────────────────────
  speak(text, lang = 'es-ES') {
    if (!this.ttsEnabled) return;
    if (!('speechSynthesis' in window)) return;

    const synth = window.speechSynthesis;

    // Descartar cualquier lectura nuestra aún pendiente de programar
    if (this._speakTimer) {
      clearTimeout(this._speakTimer);
      this._speakTimer = null;
    }

    // iOS deja el motor pausado tras volver del background y entonces
    // speak() no suena: resume() lo desatasca antes de hablar.
    try { synth.resume(); } catch (e) { /* ignorar */ }

    // Recargar voces si el array está vacío (puede pasar en iOS)
    if (this._voices.length === 0) {
      this._voices = synth.getVoices();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const langPrefix = lang.split('-')[0];
    let voice = this._voices.find(v => v.lang.startsWith(langPrefix))
             || this._voices.find(v => v.lang.startsWith('es'))
             || this._voices[0]
             || null;

    if (voice) utterance.voice = voice;
    utterance.lang  = lang;
    utterance.rate  = 0.95;
    utterance.pitch = 1.1;

    // Mantener una referencia viva: sin ella, iOS recolecta la
    // utterance y corta la lectura a mitad de palabra.
    this._utterance = utterance;
    utterance.onend = () => {
      if (this._utterance === utterance) this._utterance = null;
    };

    if (synth.speaking || synth.pending) {
      // iOS ignora un speak() inmediato tras cancel(): pequeño delay.
      synth.cancel();
      this._speakTimer = setTimeout(() => {
        this._speakTimer = null;
        synth.speak(utterance);
      }, 100);
    } else {
      // Camino directo y SÍNCRONO: conserva el contexto del gesto del
      // usuario, requisito de iOS para que la lectura suene.
      synth.speak(utterance);
    }
  }
}

const audio = new AudioManager();
export default audio;
