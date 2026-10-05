// Web Audio API Synthesizer for Link's Awakening: Koholint's Lullaby

class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicInterval: number | null = null;
  private oceanNoiseNode: AudioNode | null = null;
  private oceanGainNode: GainNode | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private isMusicPlaying: boolean = false;
  private noteIndex: number = 0;

  // Ballad of the Wind Fish motif notes (Hz)
  // Recreating the poignant melody and warm arpeggio
  private readonly melodyNotes = [
    // Phrase 1 (D - F# - A - high F# - D - C#)
    { f: 587.33, dur: 0.55 }, // D5
    { f: 659.25, dur: 0.55 }, // E5
    { f: 739.99, dur: 0.55 }, // F#5
    { f: 880.00, dur: 0.8 },  // A5
    { f: 739.99, dur: 0.55 }, // F#5
    { f: 587.33, dur: 0.7 },  // D5
    // Phrase 2
    { f: 554.37, dur: 0.55 }, // C#5
    { f: 659.25, dur: 0.55 }, // E5
    { f: 739.99, dur: 0.55 }, // F#5
    { f: 554.37, dur: 0.7 },  // C#5
    { f: 493.88, dur: 0.55 }, // B4
    { f: 440.00, dur: 0.9 },  // A4
    // Phrase 3
    { f: 493.88, dur: 0.55 }, // B4
    { f: 587.33, dur: 0.55 }, // D5
    { f: 739.99, dur: 0.6 },  // F#5
    { f: 659.25, dur: 0.6 },  // E5
    { f: 493.88, dur: 0.55 }, // B4
    { f: 440.00, dur: 1.0 },  // A4
  ];

  // Bass root notes
  private readonly bassRoots = [
    293.66, 293.66, 293.66, 293.66, 293.66, 293.66, // D4
    220.00, 220.00, 220.00, 220.00, 246.94, 220.00, // A3 / B3 / A3
    246.94, 246.94, 293.66, 220.00, 196.00, 220.00  // B3 / D4 / A3 / G3 / A3
  ];

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.initOceanSurf();
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Gentle music box tone: sine with pleasant subtle second harmonic and exponential decay
  private playMusicBoxNote(freq: number, dur: number = 0.8, gainFactor: number = 0.09) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;

      // Primary tone (fundamental)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, t);

      // Bell chime attack & smooth decay
      gain1.gain.setValueAtTime(gainFactor, t);
      gain1.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc1.connect(gain1);
      gain1.connect(this.masterGain);

      osc1.start(t);
      osc1.stop(t + dur);

      // Soft 2nd harmonic for wooden music box warmth
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, t);
      gain2.gain.setValueAtTime(gainFactor * 0.25, t);
      gain2.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.4);

      osc2.connect(gain2);
      gain2.connect(this.masterGain);

      osc2.start(t);
      osc2.stop(t + dur * 0.4);
    } catch {
      // Audio context might be restricted or disposed
    }
  }

  // Soft low warm bass tone
  private playBassNote(freq: number, dur: number = 1.4) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq / 2, t);

      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + dur);
    } catch {
      // ignore
    }
  }

  // Ambient ocean surf (white noise buffer lowpassed with smooth LFO)
  private initOceanSurf() {
    if (!this.ctx || !this.masterGain) return;
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 350;

      this.oceanGainNode = this.ctx.createGain();
      this.oceanGainNode.gain.setValueAtTime(0.02, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(this.oceanGainNode);
      this.oceanGainNode.connect(this.masterGain);

      whiteNoise.start(0);
      this.oceanNoiseNode = whiteNoise;
    } catch {
      // ignore
    }
  }

  // Adjust ocean volume based on player proximity to south beach (y > 900)
  public updateAmbientPosition(playerY: number) {
    if (!this.oceanGainNode || !this.ctx || this.isMuted) return;
    const beachWeight = Math.max(0, Math.min(1, (playerY - 800) / 500));
    const targetGain = 0.01 + beachWeight * 0.055;
    try {
      this.oceanGainNode.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.3);
    } catch {
      // ignore
    }
  }

  // Start the background Ballad of the Wind Fish music box loop
  public startLullaby() {
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    this.init();

    this.musicInterval = window.setInterval(() => {
      if (!this.isMusicPlaying) return;

      const item = this.melodyNotes[this.noteIndex % this.melodyNotes.length];
      this.playMusicBoxNote(item.f, item.dur, 0.08);

      // Play bass arpeggio every few beats
      if (this.noteIndex % 3 === 0) {
        const bassF = this.bassRoots[this.noteIndex % this.bassRoots.length] || 220;
        this.playBassNote(bassF, 1.2);
      }

      this.noteIndex++;
    }, 540);
  }

  public stopLullaby() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  // Sound Effect: Sword Slash
  public playSlash() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(380, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.12);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.12);
    } catch {
      // ignore
    }
  }

  // Sound Effect: Bush Cut (crisp rustle)
  public playBushCut() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.08);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.08);
    } catch {
      // ignore
    }
  }

  // Sound Effect: Rupee Pickup (bright high gem ping)
  public playPickupRupee() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      const notes = [1318.5, 1760.0]; // E6, A6
      notes.forEach((freq, idx) => {
        const time = t + idx * 0.06;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.2);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(time);
        osc.stop(time + 0.2);
      });
    } catch {
      // ignore
    }
  }

  // Sound Effect: Heart Pickup (warm rising health tone)
  public playPickupHeart() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, idx) => {
        const time = t + idx * 0.08;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.14, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.25);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(time);
        osc.stop(time + 0.25);
      });
    } catch {
      // ignore
    }
  }

  // Sound Effect: Link Hurt / Damage
  public playDamage() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.linearRampToValueAtTime(90, t + 0.15);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.15);
    } catch {
      // ignore
    }
  }

  // Sound Effect: Enemy Defeated / Poofed
  public playEnemyDefeat() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, t);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.18);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.18);
    } catch {
      // ignore
    }
  }

  // Sound Effect: Zelda Item Discovery Fanfare (Siren Instrument Acquired!)
  public playFanfare() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      // Classic ascending triumphant item fanfare
      const notes = [
        { f: 523.25, d: 0.14 }, // C5
        { f: 587.33, d: 0.14 }, // D5
        { f: 659.25, d: 0.14 }, // E5
        { f: 783.99, d: 0.18 }, // G5
        { f: 880.00, d: 0.22 }, // A5
        { f: 1046.50, d: 0.8 }, // C6 (sustained)
      ];

      let elapsed = 0;
      notes.forEach((n) => {
        const time = t + elapsed;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, time);

        gain.gain.setValueAtTime(0.22, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + n.d);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(time);
        osc.stop(time + n.d);

        elapsed += n.d * 0.9;
      });
    } catch {
      // ignore
    }
  }

  // Dialogue typewriter chirp
  public playDialogueChirp() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(620 + Math.random() * 60, t);

      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.04);
    } catch {
      // ignore
    }
  }

  // Environmental Sound: Ambient bird chirping (short, high-frequency synthesized chirps)
  private lastBirdChirpTime: number = 0;
  private nextBirdChirpDelay: number = 4000;

  public ambientBirdChirp() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      // 1 to 3 short, high-frequency chirps
      const numChirps = Math.random() < 0.65 ? 2 : (Math.random() < 0.5 ? 3 : 1);
      const baseFreq = 2800 + Math.random() * 800; // 2800 - 3600 Hz

      for (let i = 0; i < numChirps; i++) {
        const startTime = t + i * (0.08 + Math.random() * 0.03);
        const dur = 0.055 + Math.random() * 0.025;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const startFreq = baseFreq + (i * 140);
        const peakFreq = startFreq + 950 + Math.random() * 350;
        const endFreq = startFreq + 280 + Math.random() * 150;

        osc.frequency.setValueAtTime(startFreq, startTime);
        osc.frequency.linearRampToValueAtTime(peakFreq, startTime + dur * 0.45);
        osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + dur);

        // Soft distant ambient volume
        const gainVal = 0.03 + Math.random() * 0.015;
        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(gainVal, startTime + dur * 0.2);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + dur);
      }
    } catch {
      // ignore
    }
  }

  public playBirdChirp() {
    this.ambientBirdChirp();
  }

  // Periodically trigger environmental bird chirps when player is in the forest
  public updateForestAmbience(inForest: boolean) {
    if (!inForest || !this.ctx || this.isMuted) return;
    const now = Date.now();
    if (now - this.lastBirdChirpTime > this.nextBirdChirpDelay) {
      this.lastBirdChirpTime = now;
      this.nextBirdChirpDelay = 5000 + Math.random() * 6500; // every 5-11.5s
      this.ambientBirdChirp();
    }
  }

  // Awakening of the Wind Fish: Resonant celestial chord + bell chimes
  public playEggAwaken() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      const chords = [293.66, 440.0, 587.33, 739.99, 880.0, 1174.66]; // D Major 9
      chords.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        const startTime = t + idx * 0.15;
        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.08, startTime + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 6.0);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(startTime);
        osc.stop(startTime + 6.5);
      });
    } catch {
      // ignore
    }
  }

  // Gentle Seagull Cry whistle for the epilogue
  public playSeagull() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, t);
      osc.frequency.exponentialRampToValueAtTime(2200, t + 0.25);
      osc.frequency.exponentialRampToValueAtTime(1200, t + 0.6);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.06, t + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.6);
    } catch {
      // ignore
    }
  }
}

export const sound = new SoundEngine();
