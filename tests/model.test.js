import { describe, it, expect } from 'vitest'
import { noteName, isBlack, notePC, freq, parseName, eqSet, stepDur } from '../src/core/model.js'

// ── ANCRES ABSOLUES (invariant CLAUDE.md §2) ─────────────────────────────────
describe('noteName — ancres Ableton obligatoires', () => {
  it('Do3/C3 = 60',   () => expect(noteName(60)).toBe('Do3'))
  it('La2/A2 = 57',   () => expect(noteName(57)).toBe('La2'))
  it('La1/A1 = 45',   () => expect(noteName(45)).toBe('La1'))
  it('La0/A0 = 33',   () => expect(noteName(33)).toBe('La0'))
})

describe('noteName — autres pitches de référence', () => {
  it('Si2 = 59',      () => expect(noteName(59)).toBe('Si2'))
  it('Mi3 = 64',      () => expect(noteName(64)).toBe('Mi3'))
  it('Sol3 = 67',     () => expect(noteName(67)).toBe('Sol3'))
  it('Sol#3 = 68',    () => expect(noteName(68)).toBe('Sol#3'))
  it('Fa#3 = 66',     () => expect(noteName(66)).toBe('Fa#3'))
  it('Ré3 = 62',      () => expect(noteName(62)).toBe('Ré3'))
  it('Fa2 = 53',      () => expect(noteName(53)).toBe('Fa2'))
  it('Do4 = 72',      () => expect(noteName(72)).toBe('Do4'))
  // Basses extrêmes
  it('La-1 = 21',     () => expect(noteName(21)).toBe('La-1'))
  it('Do0 = 24',      () => expect(noteName(24)).toBe('Do0'))
})

describe('noteName — mode EN', () => {
  it('C3 = 60 (EN)',  () => expect(noteName(60, 'en')).toBe('C3'))
  it('A2 = 57 (EN)',  () => expect(noteName(57, 'en')).toBe('A2'))
  it('G#3 = 68 (EN)', () => expect(noteName(68, 'en')).toBe('G#3'))
})

// ── ISBLACK ───────────────────────────────────────────────────────────────────
describe('isBlack', () => {
  it('Do3 (60) blanc',  () => expect(isBlack(60)).toBe(false))
  it('Do#3 (61) noir',  () => expect(isBlack(61)).toBe(true))
  it('Ré3 (62) blanc',  () => expect(isBlack(62)).toBe(false))
  it('La2 (57) blanc',  () => expect(isBlack(57)).toBe(false))
  it('La#2 (58) noir',  () => expect(isBlack(58)).toBe(true))
  it('Sol#3 (68) noir', () => expect(isBlack(68)).toBe(true))
  it('Mi3 (64) blanc',  () => expect(isBlack(64)).toBe(false))
  it('Fa#3 (66) noir',  () => expect(isBlack(66)).toBe(true))
})

// ── PARSEAME ──────────────────────────────────────────────────────────────────
describe('parseName — roundtrip avec noteName', () => {
  const anchors = [60, 57, 45, 33, 59, 64, 67, 68, 66, 62, 53, 72]
  anchors.forEach(p => {
    it(`parseName(noteName(${p})) === ${p}`, () => {
      expect(parseName(noteName(p))).toBe(p)
    })
  })
})

describe('parseName — cas limites', () => {
  it('format invalide → null',      () => expect(parseName('H2')).toBeNull())
  it('sans octave → null',          () => expect(parseName('La')).toBeNull())
  it('A2 (EN) → 57',               () => expect(parseName('A2', 'en')).toBe(57))
  it('G#3 (EN) → 68',              () => expect(parseName('G#3', 'en')).toBe(68))
})

// ── EQSET ─────────────────────────────────────────────────────────────────────
describe('eqSet', () => {
  it('ordre différent → vrai',    () => expect(eqSet([57,60,64],[64,57,60])).toBe(true))
  it('longueurs différentes → faux', () => expect(eqSet([57,60],[57,60,64])).toBe(false))
  it('un élément différent → faux',  () => expect(eqSet([57,60,64],[57,60,65])).toBe(false))
  it('ensembles vides → vrai',    () => expect(eqSet([],[])).toBe(true))
  it('singleton égal → vrai',     () => expect(eqSet([60],[60])).toBe(true))
})

// ── STEPDUR ───────────────────────────────────────────────────────────────────
describe('stepDur', () => {
  it('132 BPM, 16 steps → ~0.1136s', () =>
    expect(stepDur(132, 16)).toBeCloseTo(60 / 132 / 4, 6))
  it('120 BPM, 16 steps → 0.125s',   () =>
    expect(stepDur(120, 16)).toBeCloseTo(0.125, 6))
})

// ── NOTEPC ────────────────────────────────────────────────────────────────────
describe('notePC', () => {
  it('Do (60) → 0',  () => expect(notePC(60)).toBe(0))
  it('La (57) → 9',  () => expect(notePC(57)).toBe(9))
  it('négatif → ok', () => expect(notePC(-3)).toBe(9))
})
