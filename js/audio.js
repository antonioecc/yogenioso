// ============================================================
// Módulo de Audio — Web Audio API + SpeechSynthesis
// IMPORTANTE (iOS Safari): AudioContext debe crearse y resumirse
// de forma SÍNCRONA dentro del handler del gesto del usuario.
// Usar async/await rompe el contexto del gesto en iOS y el audio
// queda bloqueado. Todos los métodos son SÍNCRONOS.
// ============================================================

class AudioManager {
  constructor() {
    this.ctx = null;
    this.ttsEnabled = true;
    this.soundsEnabled = true;
    this._unlocked = false;
    this._voices = [];

    // Cargar voces TTS lo antes posible
    // iOS entrega las voces de forma diferida; necesitamos onvoiceschanged
    this._loadVoices();
    if (typeof window.speechSynthesis !== 'undefined' &&
        window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => this._loadVoices();
    }
  }

  _loadVoices() {
    const v = window.speechSynthesis.getVoices();
    if (v.length > 0) {
      this._voices = v;
    }
  }

  // ─────────────────────────────────────────────────────────
  // init() — DEBE llamarse SÍNCRONAMENTE desde un gesto del usuario.
  // Crea el AudioContext, lo resume y toca un buffer silencioso
  // para desbloquear el audio en iOS. NO usa await.
  // ─────────────────────────────────────────────────────────
  init() {
    try {
      // 1. Crear el contexto (síncrono — dentro del gesto)
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }

      // 2. Resume síncrono — iOS exige que resume() se llame en el gesto.
      //    NO hacemos await; solo disparamos la promesa.
      if (this.ctx.state === 'suspended') {
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
    } catch (e) {
      console.warn('AudioContext init error:', e);
    }
  }

  // ─────────────────────────────────────────────────────────
  // _ctx() — Devuelve el contexto si está activo, o null.
  // Si está suspendido, intenta resumirlo (fire-and-forget).
  // ─────────────────────────────────────────────────────────
  _ctx() {
    if (!this.ctx) return null;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume(); // fire-and-forget
    }
    // Permitir también 'running'; en caso de que la promesa tarde
    // unos ms, los nodos de audio ya se pueden crear (iOS lo permite
    // si el contexto fue creado en el gesto).
    return (this.ctx.state === 'running' || this.ctx.state === 'suspended')
      ? this.ctx
      : null;
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

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    // Recargar voces si el array está vacío (puede pasar en iOS)
    if (this._voices.length === 0) {
      this._voices = window.speechSynthesis.getVoices();
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

    // iOS Safari necesita un pequeño delay tras cancel() para no ignorar speak()
    setTimeout(() => window.speechSynthesis.speak(utterance), 80);
  }
}

const audio = new AudioManager();
export default audio;
