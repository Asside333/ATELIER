/**
 * Test d'intégrité des octaves (invariant CLAUDE.md §2).
 *
 * Principe : tout nom de note affiché dans le texte des missions
 * (instr, tip, hints, brick.*) DOIT correspondre à noteName(pitch).
 *
 * Deux vérifications :
 *  1. Ancres absolues — toujours actif.
 *  2. Missions JSON  — actif dès que src/data/missions/*.json existent (étape 3+).
 *
 * Pattern cherché dans les textes : "La2 (57)" ou "Sol#3 (68 — ..."
 * Si le nom et le pitch MIDI sont tous les deux présents dans le texte,
 * noteName(pitch) doit retourner exactement ce nom.
 */
import { describe, it, expect } from 'vitest'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { noteName, parseName, NFR } from '../src/core/model.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const MISSIONS_DIR = join(ROOT, 'src/data/missions')

// ── HELPERS ───────────────────────────────────────────────────────────────────

/**
 * Extrait les paires {name, pitch} depuis un texte.
 * Correspond aux patterns "La2 (57)" ou "Sol#3 (68 — ..."
 */
function extractNoteRefs(text) {
  const sorted = [...NFR].sort((a, b) => b.length - a.length)
  const namesPat = sorted.map(n => n.replace('#', '\\#')).join('|')
  const re = new RegExp(`\\b(${namesPat})(\\d)\\s*\\((\\d{1,3})`, 'g')
  const refs = []
  let m
  while ((m = re.exec(text)) !== null) {
    refs.push({
      name:  m[1] + m[2],
      pitch: parseInt(m[3], 10),
      ctx:   text.slice(Math.max(0, m.index - 8), m.index + 35),
    })
  }
  return refs
}

/** Tous les champs texte d'une mission (à analyser). */
function missionTexts(mission) {
  const out = []
  if (mission.instr) out.push(mission.instr)
  if (mission.tip)   out.push(mission.tip)
  if (Array.isArray(mission.hints)) out.push(...mission.hints)
  if (mission.brick) {
    const b = mission.brick
    ;['def','why','abl','plus'].forEach(k => { if (b[k]) out.push(b[k]) })
  }
  return out
}

// ── 1. ANCRES ABSOLUES (toujours actif) ──────────────────────────────────────
describe('intégrité octaves — ancres absolues', () => {
  const cases = [
    { text: 'La2 (57), Do3 (60), Mi3 (64)', expected: [['La2',57],['Do3',60],['Mi3',64]] },
    { text: 'Sol#3 (68 — une noire), La3 (69)', expected: [['Sol#3',68],['La3',69]] },
    { text: 'La0 (33) tout en bas de la grille', expected: [['La0',33]] },
    { text: 'La1 (45), Fa#1 (42), Si2 (59)', expected: [['La1',45],['Fa#1',42],['Si2',59]] },
  ]

  cases.forEach(({ text, expected }) => {
    it(`extrait correctement depuis "${text.slice(0, 40)}…"`, () => {
      const refs = extractNoteRefs(text)
      expect(refs.length).toBe(expected.length)
      expected.forEach(([name, pitch], i) => {
        expect(refs[i].name).toBe(name)
        expect(refs[i].pitch).toBe(pitch)
        expect(noteName(pitch)).toBe(name)
      })
    })
  })

  it('noteName est cohérent avec parseName sur tous les NFR × octaves 0-5', () => {
    for (let octave = 0; octave <= 5; octave++) {
      for (let pc = 0; pc < 12; pc++) {
        const p = (octave + 2) * 12 + pc
        const name = noteName(p)
        expect(parseName(name)).toBe(p)
      }
    }
  })
})

// ── 2. MISSIONS JSON (actif dès l'étape 3) ───────────────────────────────────
const missionFiles = existsSync(MISSIONS_DIR)
  ? readdirSync(MISSIONS_DIR).filter(f => f.endsWith('.json'))
  : []

describe('intégrité octaves — missions JSON', () => {
  it.skipIf(missionFiles.length === 0)('des fichiers de missions existent', () => {
    expect(missionFiles.length).toBeGreaterThan(0)
  })

  missionFiles.forEach(file => {
    const data = JSON.parse(readFileSync(join(MISSIONS_DIR, file), 'utf8'))
    const missions = Array.isArray(data) ? data : [data]

    missions.forEach(mission => {
      it.skipIf(!mission.id)(`mission ${mission.id} — noms de notes cohérents`, () => {
        const texts = missionTexts(mission)
        const errors = []

        for (const text of texts) {
          for (const { name, pitch, ctx } of extractNoteRefs(text)) {
            const expected = noteName(pitch)
            if (expected !== name) {
              errors.push(`"${name}" ≠ noteName(${pitch})="${expected}" → contexte: …${ctx}…`)
            }
          }
        }

        expect(errors, errors.join('\n')).toHaveLength(0)
      })

      // Vérifie aussi les pitches bruts dans validate / target / demo
      it.skipIf(!mission.id)(`mission ${mission.id} — pitches MIDI dans la plage 0-127`, () => {
        const pitches = []
        if (mission.validate?.pitches) pitches.push(...mission.validate.pitches)
        if (Array.isArray(mission.target)) pitches.push(...mission.target.map(n => n.p))
        if (mission.demo?.tracks) {
          mission.demo.tracks.forEach(t => pitches.push(...(t.notes || []).map(n => n.p)))
        }
        pitches.forEach(p => {
          expect(p, `pitch ${p} hors plage MIDI`).toBeGreaterThanOrEqual(0)
          expect(p, `pitch ${p} hors plage MIDI`).toBeLessThanOrEqual(127)
        })
      })
    })
  })
})
