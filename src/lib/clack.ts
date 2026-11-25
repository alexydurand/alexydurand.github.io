let audio: AudioContext | undefined;

/**
 * The sound of a mechanical key, made on the spot (no file): a short burst of noise through a band-pass
 * filter, the click, over a low thump, the body. Only ever after a press, which browsers require anyway.
 */
export function clack() {
  audio ??= new AudioContext();
  const t = audio.currentTime;
  const length = Math.floor(audio.sampleRate * 0.035);
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3;
  const click = audio.createBufferSource();
  click.buffer = buffer;
  const band = audio.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = 2200 + Math.random() * 800;
  const clickGain = audio.createGain();
  clickGain.gain.value = 0.3;
  click.connect(band).connect(clickGain).connect(audio.destination);
  const thump = audio.createOscillator();
  thump.frequency.setValueAtTime(170, t);
  thump.frequency.exponentialRampToValueAtTime(90, t + 0.06);
  const thumpGain = audio.createGain();
  thumpGain.gain.setValueAtTime(0.25, t);
  thumpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
  thump.connect(thumpGain).connect(audio.destination);
  click.start(t);
  thump.start(t);
  thump.stop(t + 0.08);
}
