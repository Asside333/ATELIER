/**
 * Validation structurelle des 39 missions migrées + cohérence avec le registre.
 *
 *  - schéma mission/v1 complet
 *  - validate.kind enregistré ; predicate.name enregistré
 *  - hints non vides
 *  - brick à 4 champs
 *  - mod référence un module existant
 *  - AUTO-VALIDATION : la solution déclarée (pitches / target / steps) passe son
 *    propre validateur — garantit qu'aucune mission n'est insoluble.
 */
import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validate, hasKind, hasPredicate } from '../src/core/validators.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const MISSIONS_DIR = join(ROOT, 'src/data/missions')
const MODULES_FILE = join(ROOT, 'src/data/modules.json')

const modules = JSON.parse(readFileSync(MODULES_FILE, 'utf8'))
const moduleIds = new Set(modules.map(m => m.id))

const files = readdirSync(MISSIONS_DIR).filter(f => f.endsWith('.json')).sort()
const allMissions = files.flatMap(f => JSON.parse(readFileSync(join(MISSIONS_DIR, f), 'utf8')))

const TYPES = ['keys', 'grid', 'decode', 'ear']
const TAGS = ['CONSTRUIRE', 'DECODER', 'OREILLE', 'GESTE', 'DOJO']

// ── COMPTAGES GLOBAUX ─────────────────────────────────────────────────────────
describe('parité v2 — comptages', () => {
  it('9 modules', () => expect(modules.length).toBe(9))
  it('39 missions', () => expect(allMissions.length).toBe(39))
  it('IDs uniques', () => {
    const ids = allMissions.map(m => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('répartition par module conforme au legacy', () => {
    const counts = {}
    allMissions.forEach(m => { counts[m.mod] = (counts[m.mod] || 0) + 1 })
    expect(counts).toEqual({ 0: 4, 1: 4, 2: 4, 3: 5, 4: 5, 5: 4, 6: 4, 7: 4, 8: 5 })
  })
})

// ── MODULES ───────────────────────────────────────────────────────────────────
describe('modules.json', () => {
  modules.forEach(mod => {
    it(`module ${mod.key} — champs requis`, () => {
      expect(mod.id).toBeTypeOf('number')
      expect(mod.key).toBeTruthy()
      expect(mod.name).toBeTruthy()
      expect(mod.hue).toMatch(/^#[0-9a-f]{6}$/i)
      expect(mod.intro).toBeTruthy()
    })
  })
})

// ── SCHÉMA DE CHAQUE MISSION ──────────────────────────────────────────────────
describe('schéma mission/v1', () => {
  allMissions.forEach(m => {
    describe(`mission ${m.id} (${m.title})`, () => {
      it('schema = mission/v1', () => expect(m.schema).toBe('mission/v1'))
      it('id non vide', () => expect(m.id).toBeTruthy())
      it('mod référence un module existant', () => expect(moduleIds.has(m.mod)).toBe(true))
      it('type valide', () => expect(TYPES).toContain(m.type))
      it('title non vide', () => expect(m.title).toBeTruthy())
      it('tag valide', () => expect(TAGS).toContain(m.tag))
      it('instr non vide', () => expect(m.instr?.length).toBeGreaterThan(0))

      it('hints : tableau de chaînes non vides', () => {
        expect(Array.isArray(m.hints)).toBe(true)
        expect(m.hints.length).toBeGreaterThanOrEqual(2)
        m.hints.forEach(h => {
          expect(h).toBeTypeOf('string')
          expect(h.trim().length).toBeGreaterThan(0)
        })
      })

      it('brick à 4 champs non vides', () => {
        expect(m.brick).toBeTruthy()
        ;['name', 'def', 'why', 'abl'].forEach(k => {
          expect(m.brick[k], `brick.${k}`).toBeTypeOf('string')
          expect(m.brick[k].trim().length).toBeGreaterThan(0)
        })
      })

      it('validate.kind enregistré', () => {
        expect(m.validate).toBeTruthy()
        expect(hasKind(m.validate.kind), `kind ${m.validate.kind}`).toBe(true)
      })

      it.skipIf(m.validate?.kind !== 'predicate')('predicate.name enregistré', () => {
        expect(hasPredicate(m.validate.name), `predicate ${m.validate.name}`).toBe(true)
      })
    })
  })
})

// ── AUTO-VALIDATION : la solution déclarée passe son validateur ───────────────
describe('auto-validation (la solution déclarée est acceptée)', () => {
  allMissions.forEach(m => {
    const v = m.validate

    if (v.kind === 'set-exact') {
      it(`${m.id} — set-exact accepte ses pitches`, () => {
        expect(validate(v, v.pitches).ok).toBe(true)
      })
    }

    if (v.kind === 'cells-exact') {
      it(`${m.id} — cells-exact accepte sa target`, () => {
        expect(Array.isArray(m.target)).toBe(true)
        const notes = m.target.map(({ p, s }) => ({ p, s }))
        expect(validate(v, notes, { target: m.target }).ok).toBe(true)
      })
    }

    if (v.kind === 'cells-at-steps') {
      it(`${m.id} — cells-at-steps accepte ses accords`, () => {
        const notes = []
        for (const [s, pitches] of Object.entries(v.steps)) {
          pitches.forEach(p => notes.push({ p, s: +s }))
        }
        expect(validate(v, notes).ok).toBe(true)
      })
    }
  })
})

// ── DEMOS : pitches valides ───────────────────────────────────────────────────
describe('demos cohérentes', () => {
  allMissions.filter(m => m.demo).forEach(m => {
    it(`${m.id} — demo : steps et pitches valides`, () => {
      expect(m.demo.tracks).toBeTruthy()
      m.demo.tracks.forEach(t => {
        ;(t.notes || []).forEach(n => {
          expect(n.p).toBeGreaterThanOrEqual(0)
          expect(n.p).toBeLessThanOrEqual(127)
          expect(n.s).toBeGreaterThanOrEqual(0)
        })
      })
    })
  })
})
