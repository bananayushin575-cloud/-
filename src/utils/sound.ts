export function playCompletionChime(): void {
  if (typeof window === 'undefined') return;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;

  try {
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.14);

      gain.gain.setValueAtTime(0.0001, now + index * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.12, now + index * 0.14 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.14 + 0.65);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.14);
      osc.stop(now + index * 0.14 + 0.7);
    });

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 1500);
  } catch {
    // Ignore audio context restrictions in automated or muted environments
  }
}
