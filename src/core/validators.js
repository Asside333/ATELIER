/**
 * Registre de validateurs — schéma mission/v1.
 *
 * API publique :
 *   validate(spec, answer, ctx?) → {ok: boolean}
 *
 * spec   = mission.validate  ({kind, ...params})
 * answer = réponse utilisateur — forme dépend du type de mission :
 *   keys      → number[]         (pitches sélectionnés)
 *   grid/decode → Note[]         ({p,s,d?,v?}[])
 *   ear       → boolean[]        (résultat de chaque round)
 * ctx    = {target?}             (mission.target pour cells-exact sur decode)
 */
import { eqSet, notePC } from './model.js'

// ── PRÉDICATS NOMMÉS (missions grid / keys à logique spécifique) ─────────────

export const PREDICATES = {
  /**
   * m1 — L'OCTAVE : sélectionner `count` notes, toutes de classe de hauteur `pc`.
   * v:sel=>sel.length===1&&(sel[0]-48)%12===0
   */
  'octave-of': (pitches, { pc, count = 1 }) => ({
    ok: pitches.length === count && pitches.every(p => notePC(p) === pc),
  }),

  /**
   * m2 / n01 — DEMI-TON / TON : exactement 2 notes à `semitones` demi-tons d'écart.
   * v:sel=>sel.length===2&&Math.abs(sel[0]-sel[1])===1
   */
  'interval': (pitches, { semitones }) => ({
    ok: pitches.length === 2 && Math.abs(pitches[0] - pitches[1]) === semitones,
  }),

  /**
   * n03 — LA DURÉE : au moins 1 note tenue ≥ minHeld cases + ≥ minShort notes courtes (d=1).
   * v:notes=>notes.some(n=>(n.d||1)>=8)&&notes.filter(n=>(n.d||1)===1).length>=3
   */
  'duration-mix': (notes, { minHeld, minShort }) => ({
    ok: notes.some(n => (n.d || 1) >= minHeld) &&
        notes.filter(n => (n.d || 1) === 1).length >= minShort,
  }),

  /**
   * n04 — LA VÉLOCITÉ : ≥ minTotal notes, dont ≥ minStrong fortes et ≥ minGhosts fantômes.
   * v:notes=>notes.length>=6&&notes.filter(n=>(n.v??.9)<=0.5).length>=2&&...
   */
  'velocity-relief': (notes, {
    minTotal,
    minStrong,
    strongMinV = 0.85,
    minGhosts,
    ghostMaxV = 0.5,
  }) => ({
    ok: notes.length >= minTotal &&
        notes.filter(n => (n.v ?? 0.9) >= strongMinV).length >= minStrong &&
        notes.filter(n => (n.v ?? 0.9) <= ghostMaxV).length >= minGhosts,
  }),

  /**
   * n10 — LE MOTIF : motif de [0, splitAt[ répété identiquement dans [splitAt, ∞[,
   * uniquement sur les notes de scalePC.
   */
  'motif-repeat': (notes, { splitAt = 8, minNotes = 3, maxNotes = 5, scalePC }) => {
    const a = notes.filter(n => n.s < splitAt)
    const b = notes.filter(n => n.s >= splitAt)
    if (a.length < minNotes || a.length > maxNotes || a.length !== b.length) return { ok: false }
    if (scalePC && !notes.every(n => scalePC.includes(notePC(n.p)))) return { ok: false }
    const key = ns => ns.map(n => `${n.p}:${n.s % splitAt}`).sort().join('|')
    return { ok: key(a) === key(b) }
  },

  /**
   * n11 — QUESTION-RÉPONSE : phrase A se termine hors rootPC, phrase B se termine sur rootPC.
   * v: last(a).p%12!==9 && last(b).p%12===9
   */
  'question-answer': (notes, { splitAt = 8, minEach = 3, rootPC, scalePC }) => {
    const a = notes.filter(n => n.s < splitAt)
    const b = notes.filter(n => n.s >= splitAt)
    if (a.length < minEach || b.length < minEach) return { ok: false }
    if (scalePC && !notes.every(n => scalePC.includes(notePC(n.p)))) return { ok: false }
    const last = ns => ns.reduce((m, n) => (n.s > m.s ? n : m))
    return { ok: notePC(last(a).p) !== rootPC && notePC(last(b).p) === rootPC }
  },

  /**
   * n15 — LE REBOND : ≥ minNotes notes, toutes de classe pc, incluant mustInclude.
   * v:notes=>notes.length>=6&&notes.every(n=>n.p%12===9)&&notes.some(n=>n.p===33)&&notes.some(n=>n.p===45)
   */
  'octave-bounce': (notes, { pc, minNotes, mustInclude = [] }) => ({
    ok: notes.length >= minNotes &&
        notes.every(n => notePC(n.p) === pc) &&
        mustInclude.every(p => notes.some(n => n.p === p)),
  }),

  /**
   * n16 — LE WOBBLE : au moins une note de classe pc tenue ≥ minDur cases.
   * v:notes=>notes.some(n=>n.p%12===9&&(n.d||1)>=8)
   */
  'held-note': (notes, { pc, minDur }) => ({
    ok: notes.some(n => notePC(n.p) === pc && (n.d || 1) >= minDur),
  }),

  /**
   * m14 — LE DÉCALAGE : ≥ minNotes notes, aucune sur un temps fort (s % beat === 0).
   * v:notes=>notes.length>=4&&notes.every(n=>n.s%4!==0)
   */
  'off-beat': (notes, { minNotes, beat = 4 }) => ({
    ok: notes.length >= minNotes && notes.every(n => n.s % beat !== 0),
  }),

  /**
   * n22 — LE SWING : ≥ minNotes notes sur un pitch précis.
   * v:notes=>notes.filter(n=>n.p===45).length>=8
   */
  'count-on-row': (notes, { pitch, minNotes }) => ({
    ok: notes.filter(n => n.p === pitch).length >= minNotes,
  }),

  /**
   * n23 — LE HALF-TIME : note tenue ≥ holdMinDur sur holdStep avec holdPC + frappe sur beatStep.
   * v:notes=>notes.some(n=>n.s===0&&(n.d||1)>=4&&n.p%12===9)&&notes.some(n=>n.s===8)
   */
  'half-time': (notes, { holdStep = 0, holdMinDur = 4, holdPC, beatStep = 8 }) => ({
    ok: notes.some(n => n.s === holdStep && (n.d || 1) >= holdMinDur && notePC(n.p) === holdPC) &&
        notes.some(n => n.s === beatStep),
  }),
}

// ── KINDS GÉNÉRIQUES ─────────────────────────────────────────────────────────

const KINDS = {
  /**
   * Missions keys : la sélection de pitches doit correspondre exactement.
   * spec.pitches = number[]
   */
  'set-exact': (spec, pitches) => ({
    ok: eqSet(pitches, spec.pitches),
  }),

  /**
   * Missions decode / grid avec positions exactes.
   * Cible = spec.target || ctx.target (pour les decode où target est au niveau mission).
   * Seuls p:s sont vérifiés (pas d ni v).
   */
  'cells-exact': (spec, notes, ctx) => {
    const target = spec.target || ctx.target || []
    if (notes.length !== target.length) return { ok: false }
    const userSet = new Set(notes.map(n => `${n.p}:${n.s}`))
    if (userSet.size !== notes.length) return { ok: false }  // doublons rejetés
    const targetSet = new Set(target.map(n => `${n.p}:${n.s}`))
    return { ok: notes.every(n => targetSet.has(`${n.p}:${n.s}`)) }
  },

  /**
   * Missions grid avec accords à des steps précis.
   * spec.steps = {"0": [p1,p2,...], "8": [...], ...}
   * Les pitches à chaque step sont comparés sans ordre.
   */
  'cells-at-steps': (spec, notes) => {
    const stepsSpec = spec.steps || {}
    const totalExpected = Object.values(stepsSpec).reduce((sum, ps) => sum + ps.length, 0)
    if (notes.length !== totalExpected) return { ok: false }
    const validSteps = Object.keys(stepsSpec).map(Number)
    if (!notes.every(n => validSteps.includes(n.s))) return { ok: false }
    const ok = Object.entries(stepsSpec).every(([s, expectedPitches]) => {
      const atStep = notes.filter(n => n.s === +s).map(n => n.p)
      return eqSet(atStep, expectedPitches)
    })
    return { ok }
  },

  /**
   * Missions ear simples (majeur / mineur).
   * answer = boolean[]  (résultat de chaque round)
   * spec.pass = nombre de bons résultats requis
   */
  'ear': (spec, score) => {
    const pass = spec.pass ?? (spec.rounds ?? 5) - 1
    const correct = (Array.isArray(score) ? score : []).filter(Boolean).length
    return { ok: correct >= pass }
  },

  /**
   * Délègue à un prédicat nommé.
   * spec.name = clé dans PREDICATES
   * spec.params = paramètres
   */
  'predicate': (spec, answer, ctx) => {
    const handler = PREDICATES[spec.name]
    if (!handler) throw new Error(`Prédicat inconnu : "${spec.name}"`)
    return handler(answer, spec.params || {}, ctx)
  },
}

// ── API PUBLIQUE ──────────────────────────────────────────────────────────────

/** Valide une réponse utilisateur contre une spec de mission. */
export function validate(spec, answer, ctx = {}) {
  const handler = KINDS[spec.kind]
  if (!handler) throw new Error(`Validateur inconnu : "${spec.kind}"`)
  return handler(spec, answer, ctx)
}

/** Vrai si le kind est enregistré (utilisé par missions.test). */
export function hasKind(kind) {
  const base = kind.startsWith('predicate') ? 'predicate' : kind
  return base in KINDS
}

/** Vrai si le prédicat est enregistré (utilisé par missions.test). */
export function hasPredicate(name) {
  return name in PREDICATES
}
