/**
 * grid.js — composant grille de séquenceur
 *
 * renderGrid(host, opts)  — (re)construit la grille dans `host`
 * playhead(host, s)       — déplace le marqueur de lecture
 * mkTools(host, ...)      — boutons POSER / ÉTIRER / VÉLO
 */
import { noteName, isBlack } from '../core/model.js'

const VLEVELS = [1, 0.65, 0.4]

// ── HELPERS DOM ──────────────────────────────────────────────────────────────

function el(tag, cls, text) {
  const e = document.createElement(tag)
  if (cls) e.className = cls
  if (text != null) e.textContent = text
  return e
}

// ── CHERCHER UNE NOTE ─────────────────────────────────────────────────────────

const noteAt = (notes, p, s) => notes.find(n => n.p === p && n.s === s)
const noteCovering = (notes, p, s) =>
  notes.find(n => n.p === p && s > n.s && s < n.s + (n.d || 1))

// ── RENDER ────────────────────────────────────────────────────────────────────

/**
 * opts = {
 *   rows       number[]            pitches des lignes (haut → bas)
 *   steps      number              nombre de colonnes
 *   notes      Note[]              tableau mutable des notes utilisateur
 *   lang?      'fr'|'en'           noms de notes (défaut 'fr')
 *   editable?  boolean             active l'interaction
 *   patch?     string              son de prévisualisation
 *   tool?      () => 'put'|'len'|'vel'
 *   hl?        (p:number)=>boolean  true = ligne dans la gamme (scl/hl)
 *   ghost?     Note[]              notes piste inactive (contour teal)
 *   onEdit?    ()=>void            callback après chaque modification
 *   onSound?   (patch,p,vel)=>void prévisualisation sonore
 * }
 */
export function renderGrid(host, opts) {
  host.innerHTML = ''
  const { rows, steps, notes, lang = 'fr', editable, patch, ghost } = opts
  const getTool = opts.tool ? opts.tool : () => 'put'

  host.style.gridTemplateColumns = `var(--lab) repeat(${steps},1fr)`

  rows.forEach(p => {
    // Label de ligne
    const lab = el('div', 'glab', noteName(p, lang))
    if (isBlack(p)) lab.classList.add('blackrow')
    if (opts.hl && opts.hl(p)) lab.classList.add('hl')
    host.appendChild(lab)

    for (let s = 0; s < steps; s++) {
      const c = el('div', 'cell')
      c.dataset.p = p
      c.dataset.s = s
      if (isBlack(p)) c.classList.add('blackrow')
      if (s % 4 === 0) c.classList.add('beat')
      if (opts.hl && opts.hl(p)) c.classList.add('scl')

      const n = noteAt(notes, p, s)
      if (n) {
        c.classList.add('on')
        const lv = VLEVELS.findIndex(v => Math.abs(v - (n.v ?? 0.9)) < 0.13)
        if (lv === 1) c.classList.add('v2')
        if (lv === 2) c.classList.add('v3')
      } else if (noteCovering(notes, p, s)) {
        c.classList.add('tail')
      }

      if (ghost) {
        if (noteAt(ghost, p, s)) c.classList.add('gn')
        else if (noteCovering(ghost, p, s)) c.classList.add('gnt')
      }

      if (editable) {
        c.addEventListener('pointerdown', e => {
          e.preventDefault()
          const T = getTool()
          const ex = noteAt(notes, p, s)

          if (T === 'len') {
            const startLeft = notes
              .filter(n2 => n2.p === p && n2.s <= s)
              .sort((a, b) => b.s - a.s)[0]
            if (ex) { ex.d = 1 }
            else if (startLeft) { startLeft.d = s - startLeft.s + 1 }
            else return
          } else if (T === 'vel') {
            if (!ex) return
            const cur = VLEVELS.findIndex(v => Math.abs(v - (ex.v ?? 0.9)) < 0.13)
            ex.v = VLEVELS[(cur + 1) % 3]
            if (opts.onSound) opts.onSound(patch, p, ex.v)
          } else {
            if (ex) {
              notes.splice(notes.indexOf(ex), 1)
            } else {
              notes.push({ p, s, d: 1, v: VLEVELS[0] })
              if (opts.onSound) opts.onSound(patch, p, VLEVELS[0])
            }
          }
          renderGrid(host, opts)
          if (opts.onEdit) opts.onEdit()
        })
      }

      host.appendChild(c)
    }
  })
}

// ── PLAYHEAD ─────────────────────────────────────────────────────────────────

export function playhead(host, s) {
  host.querySelectorAll('.cell.ph').forEach(c => c.classList.remove('ph'))
  if (s >= 0) host.querySelectorAll(`.cell[data-s="${s}"]`).forEach(c => c.classList.add('ph'))
}

// ── OUTILS ───────────────────────────────────────────────────────────────────

/**
 * Rend les boutons de mode d'édition dans `host`.
 * modes = ['put'] | ['put','len'] | ['put','len','vel']
 */
export function mkTools(host, modes, getMode, setMode) {
  host.innerHTML = ''
  const LABELS = { put: 'POSER', len: 'ÉTIRER', vel: 'VÉLO' }
  const HELP = {
    put: 'tap : pose / enlève',
    len: 'tap à droite d\'une note : elle s\'étire',
    vel: 'tap une note : fort → moyen → fantôme',
  }
  const hsp = el('span', 'thelp', HELP[getMode()])

  modes.forEach(md => {
    const b = el('button', 'tl' + (getMode() === md ? ' on' : ''), LABELS[md])
    b.addEventListener('click', () => {
      setMode(md)
      host.querySelectorAll('.tl').forEach(x => x.classList.remove('on'))
      b.classList.add('on')
      hsp.textContent = HELP[md]
    })
    host.appendChild(b)
  })
  host.appendChild(hsp)
}
