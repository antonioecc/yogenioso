// Módulo de efectos de sonido usando Web Audio API y Síntesis de voz (SpeechSynthesis)
class AudioManager {
  constructor() {
    this.ctx = null;
    this.ttsEnabled = true;
    this.soundsEnabled = true;
    this._unlocked = false;
    this._voices = [];

    // Pre-cargar voces TTS en cuanto estén disponibles (iOS necesita esto)
    this._loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => this._loadVoices();
    }
  }

  _loadVoices() {
    const v = window.speechSynthesis.getVoices();
    if (v.length > 0) {
      this._voices = v;
    }
  }

  // init() es async para poder hacer await ctx.resume() correctamente en iOS
  async init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }

    // En iOS el contexto arranca suspendido y resume() es una promesa
    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (e) {
        console.warn('AudioContext resume falló:', e);
      }
    }

    if (!this._unlocked) {
      // Reproducir buffer silencioso para desbloquear el contexto en iOS Safari
      try {
        const buffer = this.ctx.createBuffer(1, 1, 22050);
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.ctx.destination);
        source.start(0);
        this._unlocked = true;
      } catch (e) {
        console.warn('No se pudo reproducir el buffer de desbloqueo silencioso:', e);
      }
    }
  }

  // Helper interno: garantiza que el contexto está activo antes de usar
  async _ensureCtx() {
    await this.init();
    return this.ctx;
  }

  // Sonido seco y corto al deslizar por las letras (retroalimentación táctil auditiva)
  async playTick() {
    if (!this.soundsEnabled) return;
    const ctx = await this._ensureCtx();
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

  // Sonido cuando se selecciona una palabra incorrecta o se aborta
  async playCancel() {
    if (!this.soundsEnabled) return;
    const ctx = await this._ensureCtx();
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

  // Sonido alegre al encontrar una palabra correcta
  async playSuccess() {
    if (!this.soundsEnabled) return;
    const ctx = await this._ensureCtx();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Acorde arpegiado ascendente: Do - Mi - Sol - Do
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);

      gain.gain.setValueAtTime(0, now + index * 0.08);
      gain.gain.linearRampToValueAtTime(0.15, now + index * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.3);
    });
  }

  // Fanfarria alegre al completar la sopa de letras completa
  async playVictory() {
    if (!this.soundsEnabled) return;
    const ctx = await this._ensureCtx();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Redoble rápido de notas de escala ascendente
    const scale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88]; // C4 a B4
    scale.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + index * 0.06);
      gain.gain.setValueAtTime(0.1, now + index * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.06 + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + index * 0.06);
      osc.stop(now + index * 0.06 + 0.1);
    });

    // Gran acorde triunfal
    const chord = [523.25, 659.25, 783.99, 987.77, 1046.50]; // C5, E5, G5, B5, C6
    const chordDelay = scale.length * 0.06 + 0.05;
    chord.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, now + chordDelay);
      filter.frequency.exponentialRampToValueAtTime(4000, now + chordDelay + 0.2);

      osc.frequency.setValueAtTime(freq, now + chordDelay + index * 0.03);

      gain.gain.setValueAtTime(0, now + chordDelay + index * 0.03);
      gain.gain.linearRampToValueAtTime(0.12, now + chordDelay + index * 0.03 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + chordDelay + 1.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + chordDelay + index * 0.03);
      osc.stop(now + chordDelay + 1.5);
    });
  }

  // Sonido de clic genérico para botones
  async playClick() {
    if (!this.soundsEnabled) return;
    const ctx = await this._ensureCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
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

  // Obtener voces disponibles — espera hasta que estén cargadas (fix iOS)
  _getVoices() {
    // Intentar cargar de nuevo si aún están vacías
    if (this._voices.length === 0) {
      this._voices = window.speechSynthesis.getVoices();
    }
    return this._voices;
  }

  // Leer palabra usando SpeechSynthesis (TTS) en voz alta
  speak(text, lang = 'es-ES') {
    if (!this.ttsEnabled) return;

    // Detener lecturas anteriores en progreso
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);

    const voices = this._getVoices();
    let voice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));

    // Fallback por idioma
    if (!voice) {
      voice = voices.find(v => v.lang.startsWith('es')) || voices[0] || null;
    }

    if (voice) {
      utterance.voice = voice;
    }

    utterance.lang = lang;
    utterance.rate = 0.95;
    utterance.pitch = 1.1;

    // iOS Safari a veces necesita un pequeño delay tras cancel()
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 50);
  }
}

const audio = new AudioManager();
export default audio;
