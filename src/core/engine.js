/**
 * engine.js — 8 patches audio Tone.js
 *
 * Chaque patch est un ensemble de synthés/effets Tone.js.
 * playNote(patch, p, time, dur, vel) joue la note au temps donné.
 * init() doit être appelé après un geste utilisateur (unlock Web Audio).
 */
import * as Tone from 'tone'
import { freq } from './model.js'

// ── CONSTANTES ────────────────────────────────────────────────────────────────

export const VELOCITY_LEVELS = [1, 0.65, 0.4] // fort / moyen / fantôme
const DEFAULT_VEL = 0.9

// ── ÉTAT INTERNE ──────────────────────────────────────────────────────────────

let _ready = false
const _synths = {}

// ── INITIALISATION ────────────────────────────────────────────────────────────

/**
 * Crée tous les synthés et les connecte à la destination.
 * Idempotent — safe à appeler plusieurs fois.
 */
export async function init() {
  if (_ready) return
  await Tone.start()

  const master = new Tone.Compressor({ threshold: -12, ratio: 4, attack: 0.01, release: 0.25 })
  master.toDestination()

  // ── SUB : sinusoïde pure sous 180 Hz ─────────────────────────────────────
  const subFilter = new Tone.Filter({ frequency: 180, type: 'lowpass', Q: 1 }).connect(master)
  _synths.sub = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.6, release: 0.4 },
  }).connect(subFilter)

  // ── BASS : sine + sawtooth, filtrée à 260 Hz ──────────────────────────────
  const bassFilter = new Tone.Filter({ frequency: 260, type: 'lowpass', Q: 1.2 }).connect(master)
  _synths.bass = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'fatsawtooth', count: 2, spread: 6 },
    envelope: { attack: 0.005, decay: 0.2, sustain: 0.5, release: 0.3 },
  }).connect(bassFilter)

  // ── WOBBLE : sawtooth + LFO pilotant le filtre ───────────────────────────
  const wobbleFilter = new Tone.Filter({ frequency: 600, type: 'lowpass', Q: 4 }).connect(master)
  _synths.wobbleLFO = new Tone.LFO({ frequency: 2, min: 120, max: 2000, type: 'sine' }).connect(wobbleFilter.frequency)
  _synths.wobbleLFO.start()
  _synths.wobble = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'fatsawtooth', count: 2, spread: 10 },
    envelope: { attack: 0.02, decay: 0, sustain: 1, release: 0.3 },
  }).connect(wobbleFilter)

  // ── KEYS : son clavier, filtre 1800 Hz ────────────────────────────────────
  const keysFilter = new Tone.Filter({ frequency: 1800, type: 'lowpass', Q: 0.8 }).connect(master)
  _synths.keys = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.02, decay: 0.4, sustain: 0.5, release: 0.6 },
  }).connect(keysFilter)

  // ── PAD : sawtooth désaccordé ±8 cents, attack mou ───────────────────────
  const padVerb = new Tone.Reverb({ decay: 3, wet: 0.4 }).connect(master)
  const padFilter = new Tone.Filter({ frequency: 1100, type: 'lowpass', Q: 0.7 }).connect(padVerb)
  _synths.pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'fatsawtooth', count: 3, spread: 8 },
    envelope: { attack: 0.14, decay: 0.5, sustain: 0.7, release: 1.2 },
  }).connect(padFilter)

  // ── PLUCK : triangle, filtre 3400 Hz, decay rapide ───────────────────────
  const pluckFilter = new Tone.Filter({ frequency: 3400, type: 'lowpass', Q: 0.5 }).connect(master)
  _synths.pluck = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 },
  }).connect(pluckFilter)

  // ── BELL : FM — carrier + modulator 3.01× ────────────────────────────────
  const bellVerb = new Tone.Reverb({ decay: 2, wet: 0.3 }).connect(master)
  _synths.bell = new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 3.01,
    modulationIndex: 8,
    envelope: { attack: 0.001, decay: 1.2, sustain: 0, release: 0.5 },
    modulation: { type: 'sine' },
    modulationEnvelope: { attack: 0.001, decay: 0.8, sustain: 0, release: 0.3 },
  }).connect(bellVerb)

  // ── STAB : 3 sawtoths, filtre Q=2 2600Hz, très court ─────────────────────
  const stabFilter = new Tone.Filter({ frequency: 2600, type: 'lowpass', Q: 2 }).connect(master)
  const stabChorus = new Tone.Chorus({ frequency: 2, delayTime: 3.5, depth: 0.4, wet: 0.3 }).connect(stabFilter)
  stabChorus.start()
  _synths.stab = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'fatsawtooth', count: 3, spread: 10 },
    envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.05 },
  }).connect(stabChorus)

  // ── TICK : métronome carré 2100 Hz ────────────────────────────────────────
  const tickFilter = new Tone.Filter({ frequency: 4000, type: 'highpass' }).connect(master)
  _synths.tick = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'square' },
    envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.01 },
    volume: -12,
  }).connect(tickFilter)

  _ready = true
}

// ── LFO WOBBLE : synchronise la fréquence au BPM ─────────────────────────────

/** Cadence du wobble = doubles-croches (2 par croche, en croches = BPM/60 Hz, en doubles = BPM/30). */
export function setWobbleBPM(bpm) {
  if (_synths.wobbleLFO) _synths.wobbleLFO.frequency.value = bpm / 30
}

// ── LECTURE D'UNE NOTE ────────────────────────────────────────────────────────

/**
 * Joue une note sur le patch donné au temps Tone.js `time`.
 * @param {string} patch  - sub|bass|wobble|keys|pad|pluck|bell|stab|tick
 * @param {number} p      - pitch MIDI
 * @param {number} time   - temps Tone.js absolu (secondes)
 * @param {number} dur    - durée en steps (converti en secondes par l'appelant)
 * @param {number} vel    - vélocité 0-1 (default 0.9)
 * @param {number} stepS  - durée d'un step en secondes (pour convertir dur)
 */
export function playNote(patch, p, time, dur = 1, vel = DEFAULT_VEL, stepS = 0.125) {
  if (!_ready) return
  const synth = _synths[patch]
  if (!synth || typeof synth.triggerAttackRelease !== 'function') return

  const hz = freq(p)
  const v = Math.max(0.01, Math.min(1, vel))

  // Durée effective en secondes selon le patch
  let durS
  if (patch === 'tick') {
    durS = 0.04
  } else if (patch === 'stab') {
    durS = Math.min(dur * stepS, 0.18)
  } else if (patch === 'pluck') {
    durS = Math.min(dur * stepS, 0.4)
  } else {
    durS = Math.max(dur * stepS * 0.92, 0.05)
  }

  // Amplitude selon le patch (compensation de volume perçu)
  const amp = patch === 'sub' ? v * 0.7
    : patch === 'bass' ? v * 0.55
    : patch === 'pad' ? v * 0.5
    : patch === 'bell' ? v * 0.6
    : v

  synth.triggerAttackRelease(hz, durS, time, amp)
}

/** Joue une note immédiatement, hors transport (feedback clavier, pose de note). */
export async function playImmediate(patch, p, vel = 0.9, dur = 0.4) {
  if (!_ready) await init()
  playNote(patch, p, Tone.now() + 0.01, dur, vel, 0.125)
}

/** Retourne vrai si le moteur est initialisé. */
export function isReady() { return _ready }
