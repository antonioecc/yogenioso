// Módulo de efectos de sonido usando Web Audio API y Síntesis de voz (SpeechSynthesis)
class AudioManager {
  constructor() {
    this.ctx = null;
    this.ttsEnabled = true;
    this.soundsEnabled = true;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    // Tocar una nota silenciosa para forzar el desbloqueo de audio en iOS Safari
    try {
      const buffer = this.ctx.createBuffer(1, 1, 22050);
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.ctx.destination);
      source.start(0);
    } catch (e) {
      console.warn("No se pudo reproducir el buffer de desbloqueo silencioso:", e);
    }
  }

  // Sonido seco y corto al deslizar por las letras (retroalimentación táctil auditiva)
  playTick() {
    if (!this.soundsEnabled) return;
    this.init();
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime); // Frecuencia aguda
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.05); // Caída rápida
    
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // Sonido cuando se selecciona una palabra incorrecta o se aborta
  playCancel() {
    if (!this.soundsEnabled) return;
    this.init();
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  // Sonido alegre al encontrar una palabra correcta
  playSuccess() {
    if (!this.soundsEnabled) return;
    this.init();
    
    const now = this.ctx.currentTime;
    
    // Tocar un acorde arpegiado ascendente rápido (ej: Do - Mi - Sol - Do)
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);
      
      gain.gain.setValueAtTime(0, now + index * 0.08);
      gain.gain.linearRampToValueAtTime(0.15, now + index * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.08 + 0.25);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.3);
    });
  }

  // Fanfarria alegre al completar la sopa de letras completa
  playVictory() {
    if (!this.soundsEnabled) return;
    this.init();
    
    const now = this.ctx.currentTime;
    
    // Acorde alegre de celebración
    const chord = [523.25, 659.25, 783.99, 987.77, 1046.50]; // C5, E5, G5, B5, C6
    
    // Primero, un redoble rápido de notas de escala ascendente
    const scale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88]; // C4 to B4
    scale.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + index * 0.06);
      gain.gain.setValueAtTime(0.1, now + index * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.06 + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + index * 0.06);
      osc.stop(now + index * 0.06 + 0.1);
    });
    
    // Y luego el gran acorde triunfal
    const chordDelay = scale.length * 0.06 + 0.05;
    chord.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      
      // Filtro para suavizar el sonido de diente de sierra (hacerlo tipo trompeta)
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, now + chordDelay);
      filter.frequency.exponentialRampToValueAtTime(4000, now + chordDelay + 0.2);
      
      osc.frequency.setValueAtTime(freq, now + chordDelay + index * 0.03);
      
      gain.gain.setValueAtTime(0, now + chordDelay + index * 0.03);
      gain.gain.linearRampToValueAtTime(0.12, now + chordDelay + index * 0.03 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + chordDelay + 1.2);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now + chordDelay + index * 0.03);
      osc.stop(now + chordDelay + 1.5);
    });
  }

  // Sonido de clic genérico para botones
  playClick() {
    if (!this.soundsEnabled) return;
    this.init();
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  // Leer palabra usando SpeechSynthesis (TTS) en voz alta
  speak(text, lang = 'es-ES') {
    if (!this.ttsEnabled) return;
    
    // Detener lecturas anteriores en progreso
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Intentar buscar una voz adecuada para el idioma
    const voices = window.speechSynthesis.getVoices();
    let voice = voices.find(v => v.lang.startsWith(lang));
    
    // Fallback: si no encuentra una voz exacta para el idioma, buscar una que coincida parcialmente
    if (!voice && lang.startsWith('en')) {
      voice = voices.find(v => v.lang.startsWith('en'));
    } else if (!voice && lang.startsWith('es')) {
      voice = voices.find(v => v.lang.startsWith('es'));
    }
    
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.lang = lang;
    utterance.rate = 0.95; // Un poco más lento para mejor claridad
    utterance.pitch = 1.1; // Tono un poco más agudo e infantil/amigable
    
    window.speechSynthesis.speak(utterance);
  }
}

const audio = new AudioManager();
export default audio;
