/**
 * player.js — Transport Tone.js
 *
 * API :
 *   once(cfg, opts?)       → joue la séquence une fois
 *   loopStart(cfg, opts?)  → démarre une boucle (appelle onStep à chaque pas)
 *   stop()                 → arrête tout
 *
 * cfg = { bpm, steps, swing=0, tracks:[{patch, notes:[{p,s,d=1,v=0.9}]}] }
 * opts = { onStep(step), onEnd() }
 */
import * as Tone from 'tone'
import { stepDur } from './model.js'
import { init as engineInit, playNote, setWobbleBPM, VELOCITY_LEVELS } from './engine.js'

// ── ÉTAT ──────────────────────────────────────────────────────────────────────

let _partIds = []  // IDs des Tone.Part en cours
let _loopId = null
let _running = false

// ── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * Calcule le temps réel d'un step en tenant compte du swing.
 * Les steps impairs (index 1, 3, 5 …) sont retardés de swing * stepS.
 */
function stepTime(s, stepS, swing = 0) {
  const base = s * stepS
  const delay = (s % 2 === 1) ? swing * stepS : 0
  return base + delay
}

/**
 * Construit la liste de tous les événements à partir d'une config de séquence.
 * Retourne [{time, patch, p, d, v}] avec time en secondes depuis t=0.
 */
function buildEvents(cfg) {
  const { bpm, steps = 16, swing = 0, tracks = [] } = cfg
  const sS = stepDur(bpm, steps)
  const events = []

  for (const track of tracks) {
    const { patch, notes = [] } = track
    for (const note of notes) {
      const { p, s, d = 1, v = 0.9 } = note
      if (s < 0 || s >= steps) continue
      events.push({
        time: stepTime(s, sS, swing),
        patch,
        p,
        d,
        v,
        stepS: sS,
      })
    }
  }

  return events.sort((a, b) => a.time - b.time)
}

/**
 * Construit les événements de playhead (un par step de 0 à steps-1).
 */
function buildStepEvents(cfg) {
  const { bpm, steps = 16, swing = 0 } = cfg
  const sS = stepDur(bpm, steps)
  return Array.from({ length: steps }, (_, s) => ({
    time: stepTime(s, sS, swing),
    step: s,
  }))
}

// ── API PUBLIQUE ──────────────────────────────────────────────────────────────

/**
 * Joue la séquence une fois sans boucle.
 */
export async function once(cfg, { onStep, onEnd } = {}) {
  await engineInit()
  stop()

  const { bpm, steps = 16, swing = 0 } = cfg
  const sS = stepDur(bpm, steps)
  const totalDur = steps * sS

  setWobbleBPM(bpm)
  Tone.getTransport().bpm.value = bpm
  Tone.getTransport().stop()
  Tone.getTransport().cancel()

  const now = Tone.now() + 0.05

  // Notes
  const events = buildEvents(cfg)
  for (const ev of events) {
    Tone.getDraw().schedule(() => {}, now + ev.time) // noop pour forcer le tick
    const id = Tone.getTransport().schedule((time) => {
      playNote(ev.patch, ev.p, time, ev.d, ev.v, ev.stepS)
    }, now + ev.time)
    _partIds.push(id)
  }

  // Playhead
  if (onStep) {
    for (const ev of buildStepEvents(cfg)) {
      const id = Tone.getTransport().schedule((time) => {
        Tone.getDraw().schedule(() => onStep(ev.step), time)
      }, now + ev.time)
      _partIds.push(id)
    }
  }

  // Fin
  if (onEnd) {
    const id = Tone.getTransport().schedule(() => {
      onEnd()
      _running = false
    }, now + totalDur)
    _partIds.push(id)
  }

  Tone.getTransport().start()
  _running = true
}

/**
 * Lance la séquence en boucle.
 */
export async function loopStart(cfg, { onStep } = {}) {
  await engineInit()
  stop()

  const { bpm, steps = 16, swing = 0 } = cfg
  const sS = stepDur(bpm, steps)
  const loopDur = steps * sS

  setWobbleBPM(bpm)
  Tone.getTransport().bpm.value = bpm
  Tone.getTransport().loopStart = 0
  Tone.getTransport().loopEnd = loopDur
  Tone.getTransport().loop = true
  Tone.getTransport().stop()
  Tone.getTransport().cancel()
  Tone.getTransport().position = 0

  // Utilise Tone.Part pour les notes (compatible avec le loop transport)
  for (const track of (cfg.tracks || [])) {
    const { patch, notes = [] } = track
    const evts = notes
      .filter(n => n.s >= 0 && n.s < steps)
      .map(n => ({
        time: stepTime(n.s, sS, swing),
        p: n.p,
        d: n.d ?? 1,
        v: n.v ?? 0.9,
      }))

    if (evts.length === 0) continue

    const part = new Tone.Part((time, ev) => {
      playNote(patch, ev.p, time, ev.d, ev.v, sS)
    }, evts)
    part.loop = true
    part.loopEnd = loopDur
    part.start(0)
    _partIds.push(part)
  }

  // Playhead via Part
  if (onStep) {
    const stepEvts = buildStepEvents(cfg).map(ev => ({ time: ev.time, step: ev.step }))
    const stepPart = new Tone.Part((time, ev) => {
      Tone.getDraw().schedule(() => onStep(ev.step), time)
    }, stepEvts)
    stepPart.loop = true
    stepPart.loopEnd = loopDur
    stepPart.start(0)
    _partIds.push(stepPart)
  }

  Tone.getTransport().start()
  _running = true
}

/**
 * Arrête le transport et nettoie tous les événements planifiés.
 */
export function stop() {
  Tone.getTransport().stop()
  Tone.getTransport().cancel()
  Tone.getTransport().loop = false

  for (const p of _partIds) {
    if (p && typeof p.dispose === 'function') {
      p.stop()
      p.dispose()
    }
  }
  _partIds = []
  _running = false
}

/** Vrai si une séquence est en cours. */
export function isRunning() { return _running }

/** Réexporte pour la commodité des appelants. */
export { VELOCITY_LEVELS }
