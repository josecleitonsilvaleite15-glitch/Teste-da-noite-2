// Gentle, sensory-friendly Web Audio API synthesizer for Mundo Calmo
// Includes soft game SFX, warm Lo-Fi study beats loop, and gentle breathing cues.

class CalmAudioEngine {
  private ctx: AudioContext | null = null;
  private volume = 0.6;
  private muted = false;

  // Lo-Fi Rain beats state
  private lofiPlaying = false;
  private lofiGain: GainNode | null = null;
  private lofiStepTimer: number | null = null;
  private rainSource: AudioBufferSourceNode | null = null;
  private rainLfo: OscillatorNode | null = null;
  private lofiStep = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    this.syncLofiGain();
  }

  public getVolume(): number {
    return this.volume;
  }

  public setMuted(isMuted: boolean) {
    this.muted = isMuted;
    this.syncLofiGain();
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public isLofiPlaying(): boolean {
    return this.lofiPlaying;
  }

  private getEffectiveGain(): number {
    if (this.muted || this.volume <= 0.001) return 0;
    return this.volume * 0.22;
  }

  private getLofiTargetGain(): number {
    if (this.muted || this.volume <= 0.001) return 0.0001;
    return this.volume * 0.34;
  }

  private syncLofiGain() {
    if (!this.ctx || !this.lofiGain || !this.lofiPlaying) return;
    this.lofiGain.gain.setTargetAtTime(this.getLofiTargetGain(), this.ctx.currentTime, 0.08);
  }

  // Synthesize warm Lo-Fi Rhodes chord
  private playLofiChord(freqs: number[], durationSec: number) {
    if (!this.ctx || !this.lofiGain) return;
    const now = this.ctx.currentTime;

    const chordFilter = this.ctx.createBiquadFilter();
    chordFilter.type = 'lowpass';
    chordFilter.frequency.setValueAtTime(920, now);

    const chordGain = this.ctx.createGain();
    chordGain.gain.setValueAtTime(0.0001, now);
    chordGain.gain.linearRampToValueAtTime(0.22, now + 0.08);
    chordGain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

    chordFilter.connect(chordGain);
    chordGain.connect(this.lofiGain);

    freqs.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
      // Subtle warm lo-fi detune
      osc.frequency.setValueAtTime(f + (idx % 2 === 0 ? -0.4 : 0.4), now);
      osc.connect(chordFilter);
      osc.start(now);
      osc.stop(now + durationSec + 0.05);
    });
  }

  // Soft muted lo-fi kick drum
  private playLofiKick() {
    if (!this.ctx || !this.lofiGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(98, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.14);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.42, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc.connect(gain);
    gain.connect(this.lofiGain);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  // Soft brushed lo-fi snare / rim
  private playLofiSnare() {
    if (!this.ctx || !this.lofiGain) return;
    const now = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.11);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1150, now);
    filter.Q.setValueAtTime(1.1, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.lofiGain);
    noise.start(now);
  }

  // Subtle soft closed hi-hat tick
  private playLofiHat() {
    if (!this.ctx || !this.lofiGain) return;
    const now = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.04);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3400, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.055, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.lofiGain);
    noise.start(now);
  }

  // Gentle lo-fi bell melody note
  private playLofiLeadNote(freq: number) {
    if (!this.ctx || !this.lofiGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.11, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc.connect(gain);
    gain.connect(this.lofiGain);
    osc.start(now);
    osc.stop(now + 0.7);
  }

  public startLofi() {
    if (this.lofiPlaying) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const masterLofi = ctx.createGain();
    const now = ctx.currentTime;
    masterLofi.gain.setValueAtTime(0.0001, now);
    masterLofi.gain.linearRampToValueAtTime(this.getLofiTargetGain(), now + 0.4);
    masterLofi.connect(ctx.destination);

    // Warm seamless 4-second soft rain ambiance layered under the Lo-Fi beat
    const rainDurationSec = 4;
    const sampleRate = ctx.sampleRate;
    const rainLen = sampleRate * rainDurationSec;
    const rainBuf = ctx.createBuffer(1, rainLen, sampleRate);
    const rData = rainBuf.getChannelData(0);

    let lastOut = 0;
    for (let i = 0; i < rainLen; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.048 * white) / 1.048;
      rData[i] = lastOut * 3.1;
    }

    // Crossfade start and end for seamless rain loop
    const fadeSamples = Math.floor(sampleRate * 0.15);
    for (let i = 0; i < fadeSamples; i++) {
      const t = i / fadeSamples;
      const endIdx = rainLen - fadeSamples + i;
      const blended = rData[i] * t + rData[endIdx] * (1 - t);
      rData[i] = blended;
      rData[endIdx] = blended;
    }

    const rainSrc = ctx.createBufferSource();
    rainSrc.buffer = rainBuf;
    rainSrc.loop = true;

    const rainHighpass = ctx.createBiquadFilter();
    rainHighpass.type = 'highpass';
    rainHighpass.frequency.value = 210;

    const rainLowpass = ctx.createBiquadFilter();
    rainLowpass.type = 'lowpass';
    rainLowpass.frequency.value = 1350;

    const rainLfo = ctx.createOscillator();
    rainLfo.type = 'sine';
    rainLfo.frequency.value = 0.14;
    const rainLfoGain = ctx.createGain();
    rainLfoGain.gain.value = 240;
    rainLfo.connect(rainLfoGain);
    rainLfoGain.connect(rainLowpass.frequency);

    const rainMixGain = ctx.createGain();
    rainMixGain.gain.value = 0.42;

    rainSrc.connect(rainHighpass);
    rainHighpass.connect(rainLowpass);
    rainLowpass.connect(rainMixGain);
    rainMixGain.connect(masterLofi);

    rainSrc.start(now);
    rainLfo.start(now);

    this.lofiGain = masterLofi;
    this.rainSource = rainSrc;
    this.rainLfo = rainLfo;
    this.lofiPlaying = true;
    this.lofiStep = 0;

    // 72 BPM -> 8th note = ~416ms. 32-step (4-bar) warm chord loop:
    // Bar 1: Fmaj7, Bar 2: Em7, Bar 3: Dm7, Bar 4: Cmaj7
    const chords = [
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
      [164.81, 196.0, 246.94, 293.66], // Em7
      [146.83, 174.61, 220.0, 261.63], // Dm7
      [130.81, 164.81, 196.0, 246.94], // Cmaj7
    ];
    const leadPattern: Record<number, number> = {
      0: 523.25,
      3: 659.25,
      8: 587.33,
      11: 493.88,
      16: 523.25,
      19: 440.0,
      24: 493.88,
      28: 392.0,
    };

    const runStep = () => {
      if (!this.lofiPlaying) return;
      const step = this.lofiStep % 32;
      const barStep = step % 8;

      // Chord at the start of every 8-step bar
      if (barStep === 0) {
        const chordIdx = Math.floor(step / 8);
        this.playLofiChord(chords[chordIdx], 3.1);
      }

      // Chill lo-fi boom-bap beat (kick on 0 & 3, snare on 4, soft hat on even steps)
      if (barStep === 0 || barStep === 3 || (step === 14)) {
        this.playLofiKick();
      }
      if (barStep === 4) {
        this.playLofiSnare();
      }
      if (barStep % 2 === 0) {
        this.playLofiHat();
      }

      if (leadPattern[step]) {
        this.playLofiLeadNote(leadPattern[step]);
      } else if (Math.random() < 0.22 && this.lofiGain) {
        // Soft distant raindrop sparkle between beat notes
        const dropFreq = 580 + Math.random() * 340;
        this.playTone(dropFreq, 0.08, 'sine', 0.09);
      }

      this.lofiStep += 1;
    };

    // Start immediately so user hears the beat right on tap
    runStep();
    this.lofiStepTimer = window.setInterval(runStep, 415);
  }

  public stopLofi() {
    if (!this.lofiPlaying) return;
    this.lofiPlaying = false;

    if (this.lofiStepTimer !== null) {
      window.clearInterval(this.lofiStepTimer);
      this.lofiStepTimer = null;
    }

    const ctx = this.ctx;
    const gain = this.lofiGain;
    const rain = this.rainSource;
    const lfo = this.rainLfo;

    this.lofiGain = null;
    this.rainSource = null;
    this.rainLfo = null;

    if (ctx && gain) {
      gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.1);
      window.setTimeout(() => {
        try {
          rain?.stop();
          lfo?.stop();
          rain?.disconnect();
          gain.disconnect();
        } catch {
          // Ignore already stopped nodes
        }
      }, 420);
    }
  }

  public playTone(
    freq: number,
    duration = 0.25,
    type: OscillatorType = 'sine',
    gainMultiplier = 1,
    delay = 0
  ) {
    const masterGain = this.getEffectiveGain();
    if (masterGain <= 0) return;

    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    const peak = masterGain * gainMultiplier;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.03);
  }

  public playTap() {
    this.playTone(440, 0.09, 'sine', 0.45);
    this.playTone(660, 0.07, 'sine', 0.2, 0.015);
  }

  public playFlip() {
    this.playTone(360, 0.11, 'sine', 0.4);
  }

  public playSuccess() {
    this.playTone(523.25, 0.22, 'sine', 0.75, 0);
    this.playTone(659.25, 0.26, 'sine', 0.75, 0.09);
    this.playTone(783.99, 0.35, 'sine', 0.65, 0.18);
  }

  public playTryAgain() {
    this.playTone(349.23, 0.22, 'sine', 0.45, 0);
    this.playTone(329.63, 0.28, 'sine', 0.4, 0.12);
  }

  public playCelebrate() {
    const notes = [523.25, 587.33, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.32, 'sine', 0.7, idx * 0.1);
    });
  }

  public playSimonNote(freq: number, duration = 0.38) {
    this.playTone(freq, duration, 'triangle', 0.65);
    this.playTone(freq * 2, duration * 0.6, 'sine', 0.18);
  }

  public playDandelionChime() {
    const pentatonic = [587.33, 659.25, 783.99, 880, 1046.5];
    const start = Math.floor(Math.random() * 2);
    this.playTone(pentatonic[start], 0.35, 'sine', 0.45, 0);
    this.playTone(pentatonic[start + 2], 0.4, 'sine', 0.35, 0.08);
  }

  public playBreathCue(phase: 'inhale' | 'hold' | 'exhale') {
    if (phase === 'inhale') {
      this.playTone(392.0, 0.45, 'sine', 0.45, 0);
      this.playTone(493.88, 0.55, 'sine', 0.4, 0.14);
    } else if (phase === 'hold') {
      this.playTone(523.25, 0.35, 'sine', 0.3, 0);
    } else {
      this.playTone(440.0, 0.45, 'sine', 0.4, 0);
      this.playTone(329.63, 0.65, 'sine', 0.35, 0.16);
    }
  }
}

export const calmAudio = new CalmAudioEngine();
