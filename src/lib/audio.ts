// Sound manager for Duong Len Dinh Olympia
class AudioManager {
  private isMuted: boolean = false;
  private currentAudio: HTMLAudioElement | null = null;

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.currentAudio) {
      this.currentAudio.pause();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public play(path: string, volume: number = 0.8): Promise<void> {
    if (this.isMuted || typeof window === 'undefined') return Promise.resolve();

    return new Promise((resolve) => {
      try {
        const audio = new Audio(path);
        audio.volume = Math.max(0, Math.min(1, volume));
        this.currentAudio = audio;

        audio.onended = () => resolve();
        audio.onerror = () => {
          // Fallback to Web Audio synth beep
          this.playSynthBeep(440, 0.2);
          resolve();
        };

        audio.play().catch(() => {
          resolve();
        });
      } catch {
        resolve();
      }
    });
  }

  public stopCurrent() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  // Pre-configured sound shortcuts
  public playStartRound() {
    return this.play('/audio/kd/StartRound.mp3');
  }

  public playCorrect() {
    return this.play('/audio/kd/CorrectAnswer.mp3', 0.9);
  }

  public playWrong() {
    return this.play('/audio/kd/WrongAnswer.mp3', 0.9);
  }

  public playBuzzer() {
    return this.play('/audio/kd/GetTurn.mp3', 1.0);
  }

  public play15Seconds() {
    return this.play('/audio/vcnv/15Seconds.mp3', 0.7);
  }

  public play20Seconds() {
    return this.play('/audio/vd/20Seconds.mp3', 0.7);
  }

  public play30Seconds() {
    return this.play('/audio/tt/30Seconds.mp3', 0.7);
  }

  public playPictureReveal() {
    return this.play('/audio/vcnv/PictureReveal.mp3');
  }

  public playCorrectObstacle() {
    return this.play('/audio/vcnv/CorrectObstacle.mp3', 1.0);
  }

  public playHopeStar() {
    return this.play('/audio/vd/NSHV.mp3', 0.9);
  }

  public playFinishMatch() {
    return this.play('/audio/vd/FinishRound.mp3', 1.0);
  }

  private playSynthBeep(freq: number, duration: number) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // ignore
    }
  }
}

export const soundManager = new AudioManager();
