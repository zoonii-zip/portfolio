/* Background music, made in the browser: a short chiptune loop synthesised with Web Audio, no audio file.
   Off until the visitor turns it on with the button left of Menu; the choice is remembered. */
(() => {
  'use strict';
  const menu = document.getElementById('zz-overview-button');
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!menu || !Audio || location.pathname.startsWith('/weeks/')) return;

  // Settings
  const TEMPO = 126;      // beats per minute
  const VOLUME = 0.6;     // overall loudness, 0–1 (kept modest: it plays under a portfolio, not over it)
  const GAP = 8;          // px between this button and Menu
  const KEY = 'zz-music';

  // The tune: eight bars, I–vi–IV–V, two bars each. Notes are MIDI numbers per eighth note; 0 is a rest.
  const LEAD = [
    [76, 0, 79, 0, 84, 0, 79, 76], [74, 76, 0, 79, 0, 76, 0, 0],
    [72, 0, 76, 0, 81, 0, 76, 72], [71, 72, 0, 76, 0, 72, 0, 0],
    [69, 0, 72, 0, 77, 0, 72, 69], [67, 69, 0, 72, 0, 77, 0, 81],
    [71, 0, 74, 0, 79, 0, 74, 71], [79, 0, 77, 0, 74, 0, 71, 67]
  ];
  const ROOT = [36, 36, 33, 33, 41, 41, 43, 43];
  const CHORD = [[60, 64, 67], [60, 64, 67], [57, 60, 64], [57, 60, 64], [60, 65, 69], [60, 65, 69], [59, 62, 67], [59, 62, 67]];
  const BASS = [0, 12, 0, 12, 0, 12, 7, 12];   // bounce between the root, its octave and the fifth

  const button = document.createElement('button');
  button.type = 'button';
  button.id = 'zz-music-toggle';
  button.className = 'zz-paper-control zz-paper-icon';
  button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path class="note" d="M9 18V6l10-2v11"/><circle class="note" cx="6.5" cy="18" r="2.5"/><circle class="note" cx="16.5" cy="15.5" r="2.5"/><path class="mute" d="m4 4 16 16"/></svg>';
  menu.after(button);

  // Sit immediately left of Menu, wherever the site's own rules put Menu at this width.
  function place() {
    const box = menu.getBoundingClientRect(), shown = box.width > 0 && getComputedStyle(menu).visibility !== 'hidden';
    button.hidden = !shown;
    if (!shown) return;
    button.style.top = `${box.top + (box.height - 48) / 2}px`;
    button.style.right = `${innerWidth - box.left + GAP}px`;
    button.style.zIndex = getComputedStyle(menu).zIndex;
  }
  new ResizeObserver(place).observe(menu);
  new MutationObserver(place).observe(document.documentElement, {attributes: true, attributeFilter: ['class']});
  addEventListener('resize', place);
  place();

  let context, output, tone, noise, timer = 0, step = 0, nextTime = 0;
  let state = 'off';   // 'off' | 'armed' (remembered on, waiting for a first touch) | 'on'
  const hertz = midi => 440 * 2 ** ((midi - 69) / 12);
  const remember = value => { try { localStorage.setItem(KEY, value); } catch {} };

  function build() {
    context = new Audio();
    output = context.createGain();
    output.gain.value = 0;
    const squash = context.createDynamicsCompressor();
    output.connect(squash).connect(context.destination);
    // Square waves are harsh raw; everything pitched goes through one soft low-pass.
    tone = context.createBiquadFilter();
    tone.type = 'lowpass'; tone.frequency.value = 2600; tone.Q.value = .4;
    tone.connect(output);
    noise = context.createBuffer(1, context.sampleRate, context.sampleRate);
    const samples = noise.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  }
  function voice(type, midi, at, length, level) {
    const oscillator = context.createOscillator(), gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = hertz(midi);
    gain.gain.setValueAtTime(level, at);
    gain.gain.exponentialRampToValueAtTime(.0008, at + length);
    oscillator.connect(gain).connect(tone);
    oscillator.start(at); oscillator.stop(at + length + .02);
  }
  function hiss(at, length, level, kind, frequency) {
    const source = context.createBufferSource(), filter = context.createBiquadFilter(), gain = context.createGain();
    source.buffer = noise;
    filter.type = kind; filter.frequency.value = frequency;
    gain.gain.setValueAtTime(level, at);
    gain.gain.exponentialRampToValueAtTime(.0008, at + length);
    source.connect(filter).connect(gain).connect(output);
    source.start(at, Math.random() * .5, length + .02);
  }
  function kick(at) {
    const oscillator = context.createOscillator(), gain = context.createGain();
    oscillator.frequency.setValueAtTime(150, at);
    oscillator.frequency.exponentialRampToValueAtTime(46, at + .11);
    gain.gain.setValueAtTime(.34, at);
    gain.gain.exponentialRampToValueAtTime(.0008, at + .16);
    oscillator.connect(gain).connect(output);
    oscillator.start(at); oscillator.stop(at + .18);
  }
  // One sixteenth note of the loop.
  function play(index, at, sixteenth) {
    const bar = index >> 4, beat = index & 15, eighth = sixteenth * 2;
    if (beat % 2 === 0) {
      const note = LEAD[bar][beat / 2];
      if (note) voice('square', note, at, eighth * .92, .11);
      voice('triangle', ROOT[bar] + BASS[beat / 2], at, eighth * .85, .26);
      hiss(at, .03, beat % 4 === 2 ? .05 : .028, 'highpass', 7000);
    }
    if (beat % 4 === 2) for (const note of CHORD[bar]) voice('square', note, at, sixteenth * .9, .032);   // off-beat stabs
    if (beat === 0 || beat === 8 || (beat === 10 && bar % 2)) kick(at);
    if (beat === 4 || beat === 12) { hiss(at, .11, .1, 'bandpass', 1800); voice('triangle', 55, at, .07, .09); }
  }
  // Notes are booked slightly ahead on the audio clock so timer jitter is never heard.
  function schedule() {
    const sixteenth = 60 / TEMPO / 4;
    while (nextTime < context.currentTime + .14) {
      play(step, nextTime, sixteenth);
      nextTime += sixteenth;
      step = (step + 1) % 128;
    }
  }
  function run() {
    if (timer || document.hidden) return;
    context.resume();
    nextTime = context.currentTime + .08;
    output.gain.cancelScheduledValues(context.currentTime);
    output.gain.setTargetAtTime(VOLUME, context.currentTime, .09);
    timer = setInterval(schedule, 25);
    schedule();
  }
  function rest() {
    if (!timer) return;
    clearInterval(timer); timer = 0;
    output.gain.cancelScheduledValues(context.currentTime);
    output.gain.setTargetAtTime(0, context.currentTime, .05);
    setTimeout(() => { if (!timer) context.suspend(); }, 320);
  }
  function show() {
    const on = state !== 'off';
    button.setAttribute('aria-pressed', String(on));
    button.setAttribute('aria-label', on ? '음악 끄기' : '음악 켜기');
    button.title = on ? '음악 끄기' : '음악 켜기';
    button.classList.toggle('is-playing', state === 'on');
  }
  function turn(on) {
    if (on) {
      if (!context) build();
      state = 'on'; step = 0; run();
    } else {
      state = 'off'; rest();
    }
    remember(on ? '1' : '0');
    show();
  }

  button.addEventListener('click', () => turn(state !== 'on'));
  // Browsers only let sound start from a touch, so a remembered "on" waits for the first one.
  let wanted = false;
  try { wanted = localStorage.getItem(KEY) === '1'; } catch {}
  if (wanted) {
    state = 'armed';
    const begin = event => {
      removeEventListener('pointerdown', begin, true); removeEventListener('keydown', begin, true);
      if (state === 'armed' && !button.contains(event.target)) turn(true);
    };
    addEventListener('pointerdown', begin, true); addEventListener('keydown', begin, true);
  }
  document.addEventListener('visibilitychange', () => { if (state === 'on') document.hidden ? rest() : run(); });
  show();
})();
