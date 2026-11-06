// Web Audio API procedural sound effects synthesizer
// No external mp3 files, zero 404 dependencies

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientGain: GainNode | null = null;
  private ambientNoiseSource: AudioBufferSourceNode | null = null;
  private ambientTimer: number | null = null;
  private isAmbienceRunning: boolean = false;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(muted ? 0 : 0.05, this.ctx?.currentTime || 0);
    }
  }

  public getMuted() {
    return this.isMuted;
  }

  public playClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  public playCashRegister() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // High bright metallic double ding
    [1320, 1760].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const startTime = now + idx * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.36);
    });
  }

  public playSuccess() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const startTime = now + i * 0.09;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }

  public playDiscount() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.2);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  public playError() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(120, now + 0.25);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  public playFootstep() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playCartWheel() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220 + Math.random() * 60, now);
    osc.frequency.linearRampToValueAtTime(180, now + 0.06);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  public startMarketAmbience() {
    if (this.isAmbienceRunning) return;
    this.init();
    if (!this.ctx) return;

    this.isAmbienceRunning = true;

    // 1. Generate gentle pink/brown noise for background crowd & store hum
    const bufferSize = this.ctx.sampleRate * 3; // 3 seconds loop
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02; // Brown/pink noise filter
      lastOut = output[i];
      output[i] *= 2.2; // Gain adjust
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    // Filter to warm supermarket acoustics (distant chatter & store reverb)
    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 350;
    bandpass.Q.value = 1.2;

    const gain = this.ctx.createGain();
    gain.gain.value = this.isMuted ? 0 : 0.04;

    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
    this.ambientNoiseSource = noise;
    this.ambientGain = gain;

    // 2. Periodic gentle supermarket sound events: barcode beep or chime every 4-7 seconds
    const scheduleNextEvent = () => {
      if (!this.isAmbienceRunning) return;
      const delay = 4000 + Math.random() * 3500;
      this.ambientTimer = window.setTimeout(() => {
        if (!this.isAmbienceRunning || !this.ctx || this.isMuted) {
          scheduleNextEvent();
          return;
        }

        const now = this.ctx.currentTime;
        const roll = Math.random();

        if (roll < 0.6) {
          // Subtle distant barcode scanner beep ("pip!")
          const beepOsc = this.ctx.createOscillator();
          const beepGain = this.ctx.createGain();
          beepOsc.type = 'sine';
          beepOsc.frequency.setValueAtTime(2400 + Math.random() * 200, now);
          beepGain.gain.setValueAtTime(0.025, now);
          beepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          beepOsc.connect(beepGain);
          beepGain.connect(this.ctx.destination);
          beepOsc.start(now);
          beepOsc.stop(now + 0.09);
        } else {
          // Subtle supermarket PA chime ("ding-dong")
          const chimeFreqs = [784, 523]; // G5, C5
          chimeFreqs.forEach((freq, idx) => {
            const chimeOsc = this.ctx!.createOscillator();
            const chimeGain = this.ctx!.createGain();
            const startT = now + idx * 0.18;
            chimeOsc.type = 'sine';
            chimeOsc.frequency.setValueAtTime(freq, startT);
            chimeGain.gain.setValueAtTime(0.02, startT);
            chimeGain.gain.exponentialRampToValueAtTime(0.001, startT + 0.4);
            chimeOsc.connect(chimeGain);
            chimeGain.connect(this.ctx!.destination);
            chimeOsc.start(startT);
            chimeOsc.stop(startT + 0.42);
          });
        }

        scheduleNextEvent();
      }, delay);
    };

    scheduleNextEvent();
  }

  public stopMarketAmbience() {
    this.isAmbienceRunning = false;
    if (this.ambientTimer) {
      clearTimeout(this.ambientTimer);
      this.ambientTimer = null;
    }
    if (this.ambientNoiseSource) {
      try {
        this.ambientNoiseSource.stop();
        this.ambientNoiseSource.disconnect();
      } catch {
        // ignore
      }
      this.ambientNoiseSource = null;
    }
  }
}

export const sounds = new SoundManager();
