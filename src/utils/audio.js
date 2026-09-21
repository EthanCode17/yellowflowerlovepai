/**
 * Audio Engine:
 * 1. Checks if a custom song exists at `/music.mp3` (or you can name it `song.mp3`).
 * 2. If present, plays your custom song with loop and smooth volume fading.
 * 3. If not present yet, falls back to the soft procedural celestial soundscape.
 * 4. Also plays sweet celestial chimes on interactions.
 */
class CosmicAudio {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.audioElement = null;
    this.ambientGain = null;
    this.timerId = null;
    this.scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
    this.hasCustomAudio = false;

    // Check for custom audio in public folder
    this.setupCustomAudio();
  }

  setupCustomAudio() {
    try {
      this.audioElement = new Audio('/music.mp3');
      this.audioElement.loop = true;
      this.audioElement.volume = 0.65;

      // Detect if the file is loaded successfully
      this.audioElement.addEventListener('canplaythrough', () => {
        this.hasCustomAudio = true;
      });

      this.audioElement.addEventListener('error', () => {
        this.hasCustomAudio = false;
      });
    } catch (e) {
      this.hasCustomAudio = false;
    }
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.initContext();

    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  start() {
    if (this.isPlaying) return;
    this.initContext();
    this.isPlaying = true;

    // 1. Try to play custom song if available
    if (this.audioElement) {
      this.audioElement.play().then(() => {
        this.hasCustomAudio = true;
      }).catch(() => {
        // Fallback to procedural celestial ambient if no MP3 or blocked
        this.hasCustomAudio = false;
        this.startProceduralAmbient();
      });
    } else {
      this.startProceduralAmbient();
    }
  }

  startProceduralAmbient() {
    if (this.ambientGain) return;

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    this.ambientGain.gain.exponentialRampToValueAtTime(0.18, this.ctx.currentTime + 2.5);
    this.ambientGain.connect(this.ctx.destination);

    this.startWarmDrone();
    this.scheduleMelody();
  }

  startWarmDrone() {
    const freqs = [130.81, 196.00, 261.63, 329.63];
    freqs.forEach((f) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.035, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambientGain);

      osc.start();
    });
  }

  scheduleMelody() {
    if (!this.isPlaying || this.hasCustomAudio) return;

    const note = this.scale[Math.floor(Math.random() * this.scale.length)];
    this.playChime(note, 0.08, 2.5);

    const nextInterval = 2000 + Math.random() * 2500;
    this.timerId = setTimeout(() => {
      if (this.isPlaying && !this.hasCustomAudio) this.scheduleMelody();
    }, nextInterval);
  }

  playChime(freq = 523.25, volume = 0.12, duration = 2.0) {
    if (!this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio safety
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) clearTimeout(this.timerId);

    // Stop custom audio
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }

    // Stop procedural audio
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, this.ctx.currentTime);
      this.ambientGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
      setTimeout(() => {
        this.ambientGain = null;
      }, 900);
    }
  }
}

export const soundManager = new CosmicAudio();
