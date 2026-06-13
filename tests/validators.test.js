/**
 * Tests du registre de validateurs — solution canonique + contre-exemple pour
 * chaque kind et chaque prédicat. Aucune dépendance UI ni DOM.
 */
import { describe, it, expect } from 'vitest'
import { validate, PREDICATES } from '../src/core/validators.js'

// ── HELPERS ───────────────────────────────────────────────────────────────────
const ok  = result => expect(result.ok).toBe(true)
const nok = result => expect(result.ok).toBe(false)
const note = (p, s, d = 1, v = 0.9) => ({ p, s, d, v })

// ── SET-EXACT ─────────────────────────────────────────────────────────────────
describe('set-exact', () => {
  const spec = { kind: 'set-exact', pitches: [57, 59, 60, 62, 64, 65, 67, 69] }

  it('solution canonique (La mineur, toutes les touches blanches)', () =>
    ok(validate(spec, [57, 59, 60, 62, 64, 65, 67, 69])))

  it('ordre différent → ok', () =>
    ok(validate(spec, [69, 57, 65, 64, 62, 60, 59, 67])))

  it('une note manquante → nok', () =>
    nok(validate(spec, [57, 59, 60, 62, 64, 65, 67])))

  it('une note en trop → nok', () =>
    nok(validate(spec, [57, 59, 60, 62, 64, 65, 67, 69, 71])))

  it('une note fausse → nok', () =>
    nok(validate(spec, [57, 59, 60, 62, 64, 65, 67, 70])))

  it('ensemble vide → nok', () =>
    nok(validate(spec, [])))
})

// ── CELLS-EXACT ───────────────────────────────────────────────────────────────
describe('cells-exact — target dans spec', () => {
  const spec = {
    kind: 'cells-exact',
    target: [{ p: 60, s: 0 }, { p: 64, s: 4 }, { p: 67, s: 8 }, { p: 72, s: 12 }],
  }

  it('solution canonique (n02 — LA POSE)', () =>
    ok(validate(spec, [note(60,0), note(64,4), note(67,8), note(72,12)])))

  it('ignore d et v → ok', () =>
    ok(validate(spec, [note(60,0,4,0.5), note(64,4,1,1), note(67,8,2,0.4), note(72,12,3,0.65)])))

  it('une note au mauvais step → nok', () =>
    nok(validate(spec, [note(60,0), note(64,5), note(67,8), note(72,12)])))

  it('un pitch faux → nok', () =>
    nok(validate(spec, [note(60,0), note(65,4), note(67,8), note(72,12)])))

  it('note en double → nok', () =>
    nok(validate(spec, [note(60,0), note(60,0), note(67,8), note(72,12)])))

  it('note manquante → nok', () =>
    nok(validate(spec, [note(60,0), note(64,4), note(67,8)])))
})

describe('cells-exact — target dans ctx (missions decode)', () => {
  const spec = { kind: 'cells-exact' }
  const target = [{ p: 45, s: 0 }, { p: 45, s: 7 }, { p: 48, s: 8 }, { p: 43, s: 12 }]

  it('solution canonique', () =>
    ok(validate(spec, [note(45,0), note(45,7), note(48,8), note(43,12)], { target })))

  it('step faux → nok', () =>
    nok(validate(spec, [note(45,0), note(45,7), note(48,9), note(43,12)], { target })))
})

// ── CELLS-AT-STEPS ────────────────────────────────────────────────────────────
describe('cells-at-steps', () => {
  // m11 — LA BOUCLE ÉPIQUE : i-VI-III-VII
  const spec = {
    kind: 'cells-at-steps',
    steps: { 0: [57,60,64], 4: [53,57,60], 8: [60,64,67], 12: [55,59,62] },
  }

  it('solution canonique (m11 — i-VI-III-VII)', () =>
    ok(validate(spec, [
      note(57,0), note(60,0), note(64,0),
      note(53,4), note(57,4), note(60,4),
      note(60,8), note(64,8), note(67,8),
      note(55,12),note(59,12),note(62,12),
    ])))

  it('ordre des pitches dans un step → indifférent', () =>
    ok(validate(spec, [
      note(64,0), note(60,0), note(57,0),
      note(60,4), note(57,4), note(53,4),
      note(67,8), note(64,8), note(60,8),
      note(62,12),note(55,12),note(59,12),
    ])))

  it('un accord faux → nok', () =>
    nok(validate(spec, [
      note(57,0), note(60,0), note(64,0),
      note(53,4), note(57,4), note(60,4),
      note(60,8), note(64,8), note(67,8),
      note(55,12),note(59,12),note(63,12), // 63 au lieu de 62
    ])))

  it('note sur step invalide → nok', () =>
    nok(validate(spec, [
      note(57,0), note(60,0), note(64,0),
      note(53,4), note(57,4), note(60,4),
      note(60,8), note(64,8), note(67,8),
      note(55,12),note(59,12),note(62,2), // step 2 invalide
    ])))

  it('trop peu de notes → nok', () =>
    nok(validate(spec, [note(57,0), note(60,0), note(64,0)])))
})

// ── EAR ──────────────────────────────────────────────────────────────────────
describe('ear', () => {
  const spec = { kind: 'ear', rounds: 5, pass: 4 }

  it('5/5 → ok',  () => ok(validate(spec,  [true,true,true,true,true])))
  it('4/5 → ok',  () => ok(validate(spec,  [true,true,false,true,true])))
  it('3/5 → nok', () => nok(validate(spec, [true,false,false,true,true])))
  it('0/5 → nok', () => nok(validate(spec, [false,false,false,false,false])))
  it('score vide → nok', () => nok(validate(spec, [])))
})

// ── PREDICATE : octave-of ────────────────────────────────────────────────────
describe('prédicat octave-of (m1 — L\'OCTAVE)', () => {
  const spec = { kind: 'predicate', name: 'octave-of', params: { pc: 9, count: 1 } }

  it('La2 (57) → ok',  () => ok(validate(spec, [57])))
  it('La3 (69) → ok',  () => ok(validate(spec, [69])))
  it('La1 (45) → ok',  () => ok(validate(spec, [45])))
  it('Do3 (60) → nok', () => nok(validate(spec, [60])))
  it('deux notes → nok', () => nok(validate(spec, [57, 69])))
  it('aucune note → nok', () => nok(validate(spec, [])))
})

// ── PREDICATE : interval ─────────────────────────────────────────────────────
describe('prédicat interval', () => {
  it('demi-ton (m2) : 60-61 → ok',  () => ok(validate( {kind:'predicate',name:'interval',params:{semitones:1}}, [60,61])))
  it('demi-ton (m2) : 61-60 → ok',  () => ok(validate( {kind:'predicate',name:'interval',params:{semitones:1}}, [61,60])))
  it('demi-ton (m2) : 60-62 → nok', () => nok(validate({kind:'predicate',name:'interval',params:{semitones:1}}, [60,62])))
  it('ton (n01) : 60-62 → ok',      () => ok(validate( {kind:'predicate',name:'interval',params:{semitones:2}}, [60,62])))
  it('ton (n01) : 60-61 → nok',     () => nok(validate({kind:'predicate',name:'interval',params:{semitones:2}}, [60,61])))
  it('trois notes → nok',            () => nok(validate({kind:'predicate',name:'interval',params:{semitones:1}}, [60,61,62])))
})

// ── PREDICATE : duration-mix ─────────────────────────────────────────────────
describe('prédicat duration-mix (n03 — LA DURÉE)', () => {
  const spec = { kind: 'predicate', name: 'duration-mix', params: { minHeld: 8, minShort: 3 } }

  it('1 tenue de 8 + 3 courtes → ok', () =>
    ok(validate(spec, [note(45,0,8), note(45,9,1), note(48,11,1), note(43,13,1)])))

  it('tenue trop courte → nok', () =>
    nok(validate(spec, [note(45,0,7), note(45,9,1), note(48,11,1), note(43,13,1)])))

  it('pas assez de courtes → nok', () =>
    nok(validate(spec, [note(45,0,8), note(45,9,1), note(48,11,1)])))
})

// ── PREDICATE : velocity-relief ──────────────────────────────────────────────
describe('prédicat velocity-relief (n04 — LA VÉLOCITÉ)', () => {
  const spec = {
    kind: 'predicate', name: 'velocity-relief',
    params: { minTotal: 6, minStrong: 2, minGhosts: 2 },
  }
  const strong = v => note(45, 0, 1, v)
  const ghost  = v => note(45, 0, 1, v)

  it('6 notes, 2 fortes (0.9), 2 fantômes (0.4) → ok', () =>
    ok(validate(spec, [
      strong(1.0), strong(0.9), note(45,2,1,0.65), note(45,4,1,0.65),
      ghost(0.4), ghost(0.5),
    ])))

  it('trop peu de notes → nok', () =>
    nok(validate(spec, [strong(1.0), strong(0.9), ghost(0.4), ghost(0.5), note(45,4)])))

  it('pas de fantômes → nok', () =>
    nok(validate(spec, [strong(1.0),strong(0.9),note(45,2),note(45,4),note(45,6),note(45,8)])))

  it('pas de notes fortes → nok', () =>
    nok(validate(spec, [ghost(0.4),ghost(0.4),ghost(0.4),ghost(0.4),ghost(0.4),ghost(0.4)])))
})

// ── PREDICATE : motif-repeat ─────────────────────────────────────────────────
describe('prédicat motif-repeat (n10 — LE MOTIF)', () => {
  const AM = [9,11,0,2,4,5,7]
  const spec = {
    kind: 'predicate', name: 'motif-repeat',
    params: { splitAt: 8, minNotes: 3, maxNotes: 5, scalePC: AM },
  }

  it('motif répété identiquement → ok', () =>
    ok(validate(spec, [
      note(57,0), note(60,2), note(64,4),   // motif A
      note(57,8), note(60,10), note(64,12),  // motif B (+8)
    ])))

  it('motif légèrement différent → nok', () =>
    nok(validate(spec, [
      note(57,0), note(60,2), note(64,4),
      note(57,8), note(60,10), note(65,12),  // 65 au lieu de 64
    ])))

  it('note hors gamme → nok', () =>
    nok(validate(spec, [
      note(57,0), note(61,2), note(64,4),  // 61 = Do# hors Am
      note(57,8), note(61,10), note(64,12),
    ])))

  it('moins de 3 notes dans A → nok', () =>
    nok(validate(spec, [
      note(57,0), note(60,2),
      note(57,8), note(60,10),
    ])))

  it('A et B pas la même longueur → nok', () =>
    nok(validate(spec, [
      note(57,0), note(60,2), note(64,4),
      note(57,8), note(60,10),
    ])))
})

// ── PREDICATE : question-answer ───────────────────────────────────────────────
describe('prédicat question-answer (n11 — QUESTION, RÉPONSE)', () => {
  const AM = [9,11,0,2,4,5,7]
  const spec = {
    kind: 'predicate', name: 'question-answer',
    params: { splitAt: 8, minEach: 3, rootPC: 9, scalePC: AM },
  }

  it('question sur Mi3, réponse sur La → ok', () =>
    ok(validate(spec, [
      note(64,0), note(62,2), note(60,6),   // A : finit sur Do3 (PC=0 ≠ 9)
      note(64,8), note(62,10), note(57,14), // B : finit sur La2 (PC=9)
    ])))

  it('question finit sur La → nok', () =>
    nok(validate(spec, [
      note(64,0), note(62,2), note(57,6),   // A : finit sur La2 (rootPC !)
      note(64,8), note(62,10), note(57,14),
    ])))

  it('réponse ne finit pas sur La → nok', () =>
    nok(validate(spec, [
      note(64,0), note(62,2), note(60,6),
      note(64,8), note(62,10), note(60,14), // B : finit sur Do3 (PC=0 ≠ 9)
    ])))

  it('moins de 3 notes dans B → nok', () =>
    nok(validate(spec, [
      note(64,0), note(62,2), note(60,6),
      note(57,8), note(57,10),
    ])))
})

// ── PREDICATE : octave-bounce ─────────────────────────────────────────────────
describe('prédicat octave-bounce (n15 — LE REBOND)', () => {
  const spec = {
    kind: 'predicate', name: 'octave-bounce',
    params: { pc: 9, minNotes: 6, mustInclude: [33, 45] },
  }

  it('La0 et La1 en alternance → ok', () =>
    ok(validate(spec, [
      note(33,0), note(45,2), note(33,4), note(45,6), note(33,8), note(45,10),
    ])))

  it('La0 absent (mustInclude) → nok', () =>
    nok(validate(spec, [
      note(45,0), note(45,2), note(45,4), note(45,6), note(45,8), note(45,10),
    ])))

  it('note d\'une autre PC → nok', () =>
    nok(validate(spec, [
      note(33,0), note(45,2), note(33,4), note(45,6), note(33,8), note(48,10), // 48 = Do3
    ])))

  it('moins de 6 notes → nok', () =>
    nok(validate(spec, [note(33,0), note(45,2), note(33,4), note(45,6), note(33,8)])))
})

// ── PREDICATE : held-note ─────────────────────────────────────────────────────
describe('prédicat held-note (n16 — LE WOBBLE)', () => {
  const spec = { kind: 'predicate', name: 'held-note', params: { pc: 9, minDur: 8 } }

  it('La1 (45) tenu 8 → ok',         () => ok(validate(spec, [note(45,0,8)])))
  it('La0 (33) tenu 16 → ok',        () => ok(validate(spec, [note(33,0,16)])))
  it('tenu trop court (7) → nok',    () => nok(validate(spec, [note(45,0,7)])))
  it('bonne durée, mauvaise PC → nok', () => nok(validate(spec, [note(60,0,8)]))) // Do
})

// ── PREDICATE : off-beat ─────────────────────────────────────────────────────
describe('prédicat off-beat (m14 — LE DÉCALAGE)', () => {
  const spec = { kind: 'predicate', name: 'off-beat', params: { minNotes: 4, beat: 4 } }

  it('notes sur 2,6,10,14 → ok',     () => ok(validate(spec, [note(45,2),note(45,6),note(45,10),note(45,14)])))
  it('note sur step 0 (temps fort) → nok', () => nok(validate(spec, [note(45,0),note(45,6),note(45,10),note(45,14)])))
  it('note sur step 8 (temps fort) → nok', () => nok(validate(spec, [note(45,2),note(45,6),note(45,8),note(45,14)])))
  it('moins de 4 notes → nok',        () => nok(validate(spec, [note(45,2),note(45,6),note(45,10)])))
})

// ── PREDICATE : count-on-row ──────────────────────────────────────────────────
describe('prédicat count-on-row (n22 — LE SWING)', () => {
  const spec = { kind: 'predicate', name: 'count-on-row', params: { pitch: 45, minNotes: 8 } }

  it('8 notes sur La1 (45) → ok', () =>
    ok(validate(spec, Array.from({length:8}, (_,s) => note(45,s)))))

  it('7 notes sur La1 → nok', () =>
    nok(validate(spec, Array.from({length:7}, (_,s) => note(45,s)))))

  it('8 notes sur autre pitch → nok', () =>
    nok(validate(spec, Array.from({length:8}, (_,s) => note(48,s)))))
})

// ── PREDICATE : half-time ─────────────────────────────────────────────────────
describe('prédicat half-time (n23 — LE HALF-TIME)', () => {
  const spec = {
    kind: 'predicate', name: 'half-time',
    params: { holdStep: 0, holdMinDur: 4, holdPC: 9, beatStep: 8 },
  }

  it('La tenu 4 sur step 0 + frappe step 8 → ok', () =>
    ok(validate(spec, [note(45,0,4), note(45,8,1)])))

  it('tenu trop court → nok', () =>
    nok(validate(spec, [note(45,0,3), note(45,8,1)])))

  it('pas de frappe sur step 8 → nok', () =>
    nok(validate(spec, [note(45,0,4), note(45,9,1)])))

  it('tenu sur mauvaise PC → nok', () =>
    nok(validate(spec, [note(60,0,4), note(60,8,1)]))) // Do, pas La
})

// ── ERREURS ───────────────────────────────────────────────────────────────────
describe('erreurs', () => {
  it('kind inconnu → throw', () =>
    expect(() => validate({ kind: 'inexistant' }, [])).toThrow('Validateur inconnu'))

  it('prédicat inconnu → throw', () =>
    expect(() => validate({ kind: 'predicate', name: 'inexistant' }, [])).toThrow('Prédicat inconnu'))
})
