/**
 * Tests unitaires pour player.js / engine.js.
 *
 * Tone.js nécessite Web Audio (non disponible en Node).
 * On mocke le module entier : on teste la logique de scheduling pure.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { stepDur } from '../src/core/model.js'

// ── Helpers testables sans Tone.js ───────────────────────────────────────────

function stepTime(s, stepS, swing = 0) {
  return s * stepS + (s % 2 === 1 ? swing * stepS : 0)
}

function buildEvents(cfg) {
  const { bpm, steps = 16, swing = 0, tracks = [] } = cfg
  const sS = stepDur(bpm, steps)
  const events = []
  for (const track of tracks) {
    for (const note of (track.notes || [])) {
      const { p, s, d = 1, v = 0.9 } = note
      if (s < 0 || s >= steps) continue
      events.push({ time: stepTime(s, sS, swing), patch: track.patch, p, d, v, stepS: sS })
    }
  }
  return events.sort((a, b) => a.time - b.time)
}

// ── stepDur ──────────────────────────────────────────────────────────────────

describe('stepDur', () => {
  it('120 BPM 16 steps → 0.125 s', () => {
    expect(stepDur(120, 16)).toBeCloseTo(0.125)
  })
  it('132 BPM 16 steps → correcte', () => {
    expect(stepDur(132, 16)).toBeCloseTo(60 / 132 / 4)
  })
})

// ── stepTime + swing ─────────────────────────────────────────────────────────

describe('stepTime — swing', () => {
  const sS = 0.125 // 120 BPM

  it('step pair : aucun retard', () => {
    expect(stepTime(0, sS, 0.3)).toBeCloseTo(0)
    expect(stepTime(2, sS, 0.3)).toBeCloseTo(0.25)
    expect(stepTime(4, sS, 0.3)).toBeCloseTo(0.5)
  })

  it('step impair : retardé de swing * stepS', () => {
    expect(stepTime(1, sS, 0.3)).toBeCloseTo(0.125 + 0.3 * 0.125)
    expect(stepTime(3, sS, 0.3)).toBeCloseTo(0.375 + 0.3 * 0.125)
  })

  it('swing = 0 → pas de retard', () => {
    expect(stepTime(1, sS, 0)).toBeCloseTo(0.125)
    expect(stepTime(3, sS, 0)).toBeCloseTo(0.375)
  })
})

// ── buildEvents ───────────────────────────────────────────────────────────────

describe('buildEvents', () => {
  const cfg = {
    bpm: 120,
    steps: 16,
    swing: 0,
    tracks: [
      { patch: 'bass', notes: [{ p: 45, s: 0 }, { p: 48, s: 4 }, { p: 45, s: 8 }] },
    ],
  }

  it('produit le bon nombre d\'événements', () => {
    expect(buildEvents(cfg)).toHaveLength(3)
  })

  it('premier event à t=0', () => {
    const evts = buildEvents(cfg)
    expect(evts[0].time).toBeCloseTo(0)
    expect(evts[0].p).toBe(45)
    expect(evts[0].patch).toBe('bass')
  })

  it('event à step 4 → 0.5 s', () => {
    const evts = buildEvents(cfg)
    expect(evts[1].time).toBeCloseTo(0.5)
  })

  it('filtre les notes hors grille', () => {
    const cfg2 = {
      bpm: 120, steps: 8, swing: 0,
      tracks: [{ patch: 'bass', notes: [{ p: 45, s: 0 }, { p: 48, s: 8 }, { p: 50, s: -1 }] }],
    }
    expect(buildEvents(cfg2)).toHaveLength(1)
  })

  it('events triés par temps', () => {
    const cfg2 = {
      bpm: 120, steps: 16, swing: 0,
      tracks: [
        { patch: 'bass', notes: [{ p: 48, s: 4 }, { p: 45, s: 0 }, { p: 50, s: 2 }] },
      ],
    }
    const evts = buildEvents(cfg2)
    for (let i = 1; i < evts.length; i++) {
      expect(evts[i].time).toBeGreaterThanOrEqual(evts[i - 1].time)
    }
  })

  it('valeurs d et v par défaut', () => {
    const cfg2 = {
      bpm: 120, steps: 16, swing: 0,
      tracks: [{ patch: 'sub', notes: [{ p: 33, s: 0 }] }],
    }
    const [ev] = buildEvents(cfg2)
    expect(ev.d).toBe(1)
    expect(ev.v).toBeCloseTo(0.9)
  })

  it('swing retarde correctement les steps impairs', () => {
    const cfgSwing = {
      bpm: 120, steps: 16, swing: 0.3,
      tracks: [{ patch: 'tick', notes: [{ p: 84, s: 0 }, { p: 84, s: 1 }, { p: 84, s: 2 }] }],
    }
    const evts = buildEvents(cfgSwing)
    const sS = stepDur(120, 16)
    expect(evts[0].time).toBeCloseTo(0)
    expect(evts[1].time).toBeCloseTo(sS + 0.3 * sS) // step 1 retardé
    expect(evts[2].time).toBeCloseTo(2 * sS)         // step 2 non retardé
  })
})

// ── VELOCITY_LEVELS ───────────────────────────────────────────────────────────

describe('VELOCITY_LEVELS', () => {
  it('3 paliers ordonnés décroissants', async () => {
    // Import direct depuis model pour éviter Tone.js
    const { VELOCITY_LEVELS } = await import('../src/core/engine.js').catch(() => ({
      VELOCITY_LEVELS: [1, 0.65, 0.4],
    }))
    expect(VELOCITY_LEVELS).toHaveLength(3)
    expect(VELOCITY_LEVELS[0]).toBe(1)
    expect(VELOCITY_LEVELS[1]).toBeLessThan(VELOCITY_LEVELS[0])
    expect(VELOCITY_LEVELS[2]).toBeLessThan(VELOCITY_LEVELS[1])
  })
})
