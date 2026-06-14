/**
 * mission.js — orchestrateur de mission
 *
 * openMission(m, ctx)   — charge et affiche une mission
 * brickCard(m, ctx)     — construit la carte brique (réutilisé par bricks view)
 *
 * ctx = { allMissions, modules, store, onFinish, onBack }
 *   onFinish() appelé après la révélation de brique + "CONTINUER"
 *   onBack()   appelé sur "← CHEMIN"
 */
import { validate } from '../core/validators.js'
import { noteName } from '../core/model.js'
import { once, loopStart, stop as playerStop } from '../core/player.js'
import { playImmediate } from '../core/engine.js'
import { renderGrid, playhead, mkTools } from './grid.js'
import {
  initKeyboard, getKBSel, clearKBSel,
  showKeyboard, hideKeyboard, flashKey,
} from './keyboard.js'

// ── GAMMES ────────────────────────────────────────────────────────────────────

const SCALE_PC = { 'Amin': [9, 11, 0, 2, 4, 5, 7] }

function inScale(p, scale) {
  if (!scale || !SCALE_PC[scale]) return false
  const pc = ((p % 12) + 12) % 12
  return SCALE_PC[scale].includes(pc)
}

// ── HELPERS DOM ──────────────────────────────────────────────────────────────

function el(tag, cls, text) {
  const e = document.createElement(tag)
  if (cls) e.className = cls
  if (text != null) e.textContent = text
  return e
}

function btn(cls, text, onClick) {
  const b = el('button', cls, text)
  b.addEventListener('click', onClick)
  return b
}

function $(sel) { return document.querySelector(sel) }

// ── BASCULES DE LECTURE ────────────────────────────────────────────────────────
// Évite la désynchro entre boutons : une seule lecture « live » à la fois.

let _toggles = []

function _resetToggles() {
  _toggles.forEach(fn => fn())
}

/**
 * Bouton-bascule de lecture. Démarrer une bascule (ou appeler _resetToggles
 * depuis une lecture one-shot) réinitialise toutes les autres.
 * @param {Function} startFn  démarre la lecture (loopStart…)
 * @param {Function} [onReset] nettoyage visuel quand la bascule s'éteint (ex. playhead)
 */
function makeToggleBtn(offText, onText, startFn, onReset) {
  let on = false
  const off = () => {
    if (!on) return
    on = false
    b.textContent = offText
    b.classList.remove('live')
    if (onReset) onReset()
  }
  const b = btn('btn', offText, () => {
    if (on) {
      playerStop()
      off()
    } else {
      _resetToggles()
      startFn()
      on = true
      b.textContent = onText
      b.classList.add('live')
    }
  })
  _toggles.push(off)
  return b
}

// ── BRIQUE ────────────────────────────────────────────────────────────────────

/**
 * Construit le DOM de la carte brique (format bdetail).
 * withListen : ajoute le bouton "▶ ENTENDRE LA BRIQUE" si m.demo existe.
 */
export function brickCard(m, { allMissions, modules }, withListen = false) {
  const idx = allMissions.findIndex(x => x.id === m.id)
  const mod = modules[m.mod]
  const d = el('div', 'bdetail')
  d.style.setProperty('--mh', mod.hue)
  d.appendChild(el('div', 'bno', `BRIQUE Nº${idx + 1} — ${mod.name}`))
  d.appendChild(el('div', 'bn', m.brick.name))
  d.appendChild(el('p', '', m.brick.def))
  d.appendChild(el('div', 'lbl', 'POURQUOI ÇA SONNE'))
  d.appendChild(el('p', '', m.brick.why))
  d.appendChild(el('div', 'lbl', 'DANS ABLETON'))
  d.appendChild(el('p', '', m.brick.abl))
  if (withListen) {
    const demo = m.demo || {
      bpm: m.bpm || 100, steps: m.steps || 16, swing: m.swing || 0,
      tracks: [{ patch: m.patch || 'keys', notes: m.target || [] }],
    }
    if (demo.tracks?.some(t => t.notes?.length)) {
      d.appendChild(btn('btn', '▶ ENTENDRE LA BRIQUE', () => once(demo)))
    }
  }
  return d
}

// ── RÉVÉLATION BRIQUE ─────────────────────────────────────────────────────────

function _reveal(m, ctx) {
  const { allMissions, modules, onFinish } = ctx
  const veil = document.getElementById('veil')
  const card = brickCard(m, { allMissions, modules }, true)
  card.id = 'veilCard'
  card.classList.add('drop')
  document.getElementById('veilCard').replaceWith(card)
  veil.classList.add('show')
  document.getElementById('veilGo').onclick = () => {
    veil.classList.remove('show')
    playerStop()
    onFinish()
  }
}

// ── FINISH ────────────────────────────────────────────────────────────────────

function _finish(m, ctx) {
  const { store } = ctx
  playerStop()
  store.markDone(m.id)
  store.markActivity()
  _reveal(m, ctx)
}

// ── OUVERTURE DE MISSION ──────────────────────────────────────────────────────

export function openMission(m, ctx) {
  const { allMissions, modules, store, onBack } = ctx
  const state = store.getState()
  const lang = state.names || 'fr'
  const idx = allMissions.findIndex(x => x.id === m.id)

  // Arrête tout ce qui tourne
  playerStop()
  hideKeyboard()
  _toggles = []

  // ── En-tête ──────────────────────────────────────────────────────────────
  const mod = modules[m.mod]
  document.getElementById('mTitle').textContent = `${idx + 1}. ${m.title}`
  const tgEl = document.getElementById('mTag')
  tgEl.textContent = m.tag
  tgEl.className = 'tag t-' + m.tag

  document.getElementById('mInstr').textContent = m.instr

  const tipEl = document.getElementById('mTip')
  tipEl.innerHTML = ''
  if (m.tip) {
    const t = el('div', 'tip')
    const b = el('b', '', '◆ AU PASSAGE ')
    t.appendChild(b)
    t.appendChild(document.createTextNode(m.tip))
    tipEl.appendChild(t)
  }

  // ── Zones réinitialisées ──────────────────────────────────────────────────
  const ctxEl = document.getElementById('mCtx')
  const body = document.getElementById('mBody')
  const feed = document.getElementById('mFeed')
  const actions = document.getElementById('mActions')
  ctxEl.innerHTML = ''; body.innerHTML = ''; feed.textContent = ''; feed.className = 'feed'; actions.innerHTML = ''

  // ── Enlève l'ancien div hints s'il existe ─────────────────────────────────
  document.getElementById('mHints')?.remove()
  const hintsEl = el('div', 'hintsarea')
  hintsEl.id = 'mHints'
  actions.after(hintsEl)

  // Bouton retour
  document.getElementById('mBack').onclick = () => {
    playerStop()
    hideKeyboard()
    onBack()
  }

  // ── Dispatch par type ─────────────────────────────────────────────────────
  if (m.type === 'keys') _renderKeys(m, { ctx, ctxEl, body, feed, actions, hintsEl, lang })
  if (m.type === 'grid') _renderGrid(m, { ctx, ctxEl, body, feed, actions, hintsEl, lang })
  if (m.type === 'decode') _renderDecode(m, { ctx, ctxEl, body, feed, actions, hintsEl, lang })
  if (m.type === 'ear')  _renderEar(m, { ctx, ctxEl, body, feed, actions, hintsEl, lang })

  // ── Hints progressifs ─────────────────────────────────────────────────────
  _attachHints(m.hints || [], actions, hintsEl, feed)
}

// ── HINTS PROGRESSIFS ─────────────────────────────────────────────────────────

function _attachHints(hints, actions, hintsEl, feed) {
  if (!hints.length) return
  let level = -1
  const b = btn('btn', 'INDICE', () => {
    level++
    feed.textContent = hints[level]
    feed.className = 'feed hint'
    if (level >= hints.length - 1) {
      b.textContent = 'DERNIER INDICE'
      b.disabled = true
    }
  })
  actions.appendChild(b)
}

// ── TYPE : KEYS ──────────────────────────────────────────────────────────────

function _renderKeys(m, { ctx, ctxEl, body, feed, actions, lang }) {
  // Drone
  if (m.drone) {
    ctxEl.appendChild(makeToggleBtn('LANCER LE DRONE', 'DRONE EN COURS', () => {
      loopStart({
        bpm: 60, steps: 4,
        tracks: [{ patch: 'keys', notes: [{ p: m.drone, s: 0, d: 4, v: 0.5 }] }],
      })
    }))
  }

  // Chips de sélection
  const chipsEl = el('div', 'chips')
  const countEl = el('div', 'selcount')
  body.appendChild(chipsEl)
  body.appendChild(countEl)

  function renderChips() {
    chipsEl.innerHTML = ''
    const sel = getKBSel()
    sel.forEach(p => {
      chipsEl.appendChild(el('span', 'chip', noteName(p, lang)))
    })
    countEl.textContent = sel.length + (m.maxSel ? ` / ${m.maxSel} notes` : ' notes')
  }

  // Clavier
  initKeyboard({
    low: m.kb[0], high: m.kb[1],
    mode: 'select', max: m.maxSel || 0,
    lang,
    onChange: renderChips,
    playSound: (p, vel) => playImmediate('keys', p, vel, 0.45),
  })
  showKeyboard()
  renderChips()

  // Écouter
  actions.appendChild(btn('btn', 'ÉCOUTER MA SÉLECTION', () => {
    const sel = getKBSel()
    if (!sel.length) return
    _resetToggles()
    if (m.listen === 'arp') {
      once({
        bpm: 120, steps: sel.length + 1,
        tracks: [{ patch: 'keys', notes: sel.map((p, j) => ({ p, s: j, d: 1.4 })) }],
      })
    } else {
      once({
        bpm: 80, steps: 4,
        tracks: [{ patch: 'keys', notes: sel.map(p => ({ p, s: 0, d: 3 })) }],
      })
    }
  }))

  // Valider
  actions.appendChild(btn('btn prime', 'VALIDER', () => {
    const sel = getKBSel()
    const result = validate(m.validate, sel)
    if (result.ok) {
      feed.textContent = 'Juste.'
      feed.className = 'feed good'
      setTimeout(() => _finish(m, ctx), 500)
    } else {
      const expected = m.validate.kind === 'set-exact'
        ? m.validate.pitches.length
        : (m.validate.params?.count ?? m.maxSel ?? 0)
      if (expected && sel.length !== expected) {
        feed.textContent = `Il faut ${expected} note${expected > 1 ? 's' : ''} — tu en as ${sel.length}.`
      } else {
        feed.textContent = 'Pas encore — essaie une autre combinaison.'
      }
      feed.className = 'feed warn'
    }
  }))
}

// ── TYPE : GRID ───────────────────────────────────────────────────────────────

function _renderGrid(m, { ctx, ctxEl, body, feed, actions, hintsEl, lang }) {
  const userNotes = []
  let toolMode = 'put'
  const hlFn = m.scale ? (p => inScale(p, m.scale)) : null

  const toolsHost = el('div', 'tools')
  body.appendChild(toolsHost)
  mkTools(toolsHost, ['put', 'len', 'vel'], () => toolMode, v => toolMode = v)

  const wrap = el('div', 'gridwrap')
  const grid = el('div', 'pgrid')
  wrap.appendChild(grid)
  body.appendChild(wrap)

  const gridOpts = {
    rows: m.rows, steps: m.steps, notes: userNotes, lang, editable: true,
    patch: m.patch, tool: () => toolMode, hl: hlFn,
    onSound: (patch, p, vel) => playImmediate(patch, p, vel, 0.2),
    onEdit: () => { feed.textContent = ''; feed.className = 'feed' },
  }
  renderGrid(grid, gridOpts)

  if (m.marks) {
    body.appendChild(el('div', 'glegend', 'Colonnes à liseré clair = temps forts (1, 2, 3, 4).'))
  }

  const ph = s => playhead(grid, s)

  // Bouton fond contextuel (ctx tracks)
  if (m.ctx?.length) {
    ctxEl.appendChild(makeToggleBtn('LANCER LE FOND', 'FOND EN COURS', () => {
      loopStart({
        bpm: m.bpm, steps: m.steps, swing: m.swing || 0,
        tracks: [...m.ctx, { patch: m.patch, notes: userNotes }],
      }, { onStep: ph })
    }, () => ph(-1)))
  }

  // Écouter / Boucle / Valider
  actions.appendChild(btn('btn', '▶ ÉCOUTER', () => {
    if (!userNotes.length && !m.ctx?.length) {
      feed.textContent = 'Pose des notes d\'abord.'; feed.className = 'feed warn'; return
    }
    _resetToggles()
    once({
      bpm: m.bpm, steps: m.steps, swing: m.swing || 0,
      tracks: [...(m.ctx || []), { patch: m.patch, notes: userNotes }],
    }, { onStep: ph, onEnd: () => ph(-1) })
  }))

  // BOUCLE seulement hors missions à fond : le bouton FOND tient déjà ce rôle.
  if (!m.ctx?.length) {
    actions.appendChild(makeToggleBtn('∞ BOUCLE', '■ STOP', () => {
      loopStart({
        bpm: m.bpm, steps: m.steps, swing: m.swing || 0,
        tracks: [{ patch: m.patch, notes: userNotes }],
      }, { onStep: ph })
    }, () => ph(-1)))
  }

  actions.appendChild(btn('btn prime', 'VALIDER', () => {
    const result = validate(m.validate, userNotes.map(n => ({ p: n.p, s: n.s })))
    if (result.ok) {
      feed.textContent = 'Juste.'
      feed.className = 'feed good'
      setTimeout(() => _finish(m, ctx), 500)
    } else {
      feed.textContent = 'Pas encore — réécoute et ajuste.'
      feed.className = 'feed warn'
    }
  }))
}

// ── TYPE : DECODE ─────────────────────────────────────────────────────────────

function _renderDecode(m, { ctx, ctxEl, body, feed, actions, lang }) {
  const userNotes = []
  let toolMode = 'put'

  const toolsHost = el('div', 'tools')
  body.appendChild(toolsHost)
  mkTools(toolsHost, ['put', 'len', 'vel'], () => toolMode, v => toolMode = v)

  const wrap = el('div', 'gridwrap')
  const grid = el('div', 'pgrid')
  wrap.appendChild(grid)
  body.appendChild(wrap)

  const gridOpts = {
    rows: m.rows, steps: m.steps, notes: userNotes, lang, editable: true,
    patch: m.patch, tool: () => toolMode,
    onSound: (patch, p, vel) => playImmediate(patch, p, vel, 0.2),
    onEdit: () => {
      // Efface les couleurs ok/bad lors d'une modification
      grid.querySelectorAll('.cell.ok, .cell.bad').forEach(c => {
        c.classList.remove('ok', 'bad')
      })
      feed.textContent = ''; feed.className = 'feed'
    },
  }
  renderGrid(grid, gridOpts)

  if (m.marks) {
    body.appendChild(el('div', 'glegend', 'Colonnes à liseré clair = temps forts (1, 2, 3, 4).'))
  }

  const ph = s => playhead(grid, s)

  actions.appendChild(btn('btn prime', '▶ LE MODÈLE', () => {
    once({
      bpm: m.bpm, steps: m.steps, swing: m.swing || 0,
      tracks: [{ patch: m.patch, notes: m.target }],
    }, { onStep: ph, onEnd: () => ph(-1) })
  }))

  actions.appendChild(btn('btn', '▶ MA VERSION', () => {
    if (!userNotes.length) {
      feed.textContent = 'Pose des notes d\'abord.'; feed.className = 'feed warn'; return
    }
    once({
      bpm: m.bpm, steps: m.steps, swing: m.swing || 0,
      tracks: [{ patch: m.patch, notes: userNotes }],
    }, { onStep: ph, onEnd: () => ph(-1) })
  }))

  actions.appendChild(btn('btn', 'VÉRIFIER', () => {
    const target = m.target || []
    const tset = new Set(target.map(n => `${n.p}:${n.s}`))
    let good = 0
    grid.querySelectorAll('.cell.on').forEach(c => {
      c.classList.remove('ok', 'bad')
      const k = `${c.dataset.p}:${c.dataset.s}`
      if (tset.has(k)) { c.classList.add('ok'); good++ }
      else c.classList.add('bad')
    })
    if (good === target.length && userNotes.length === target.length) {
      feed.textContent = 'Reconstruit.'
      feed.className = 'feed good'
      setTimeout(() => _finish(m, ctx), 600)
    } else {
      feed.textContent = `${good}/${target.length} justes — réécoute le modèle.`
      feed.className = 'feed warn'
    }
  }))
}

// ── TYPE : EAR ────────────────────────────────────────────────────────────────

function _renderEar(m, { ctx, ctxEl, body, feed, actions }) {
  const rounds = m.validate.rounds || 5
  const pass = m.validate.pass ?? rounds - 1
  let round = 0, score = [], quality = null, root = null

  const box = el('div', 'earbox')
  const rndEl = el('div', 'rnd')
  box.appendChild(rndEl)

  const playBtn = btn('btn prime', "▶ ÉCOUTER L'ACCORD", () => _playChord())
  box.appendChild(playBtn)

  const bMin = btn('btn', 'SOMBRE (mineur)', () => _answer('min'))
  const bMaj = btn('btn', 'LUMINEUX (majeur)', () => _answer('maj'))
  const earBtns = el('div', 'earbtns')
  earBtns.appendChild(bMin)
  earBtns.appendChild(bMaj)
  box.appendChild(earBtns)

  // Réponses verrouillées tant que l'accord n'a pas été écouté
  const _setAnswerable = v => { bMin.disabled = !v; bMaj.disabled = !v }

  const dots = el('div', 'scoredots')
  box.appendChild(dots)
  body.appendChild(box)

  function _renderDots() {
    dots.innerHTML = ''
    for (let k = 0; k < rounds; k++) {
      const d = el('span', 'sd')
      if (score[k] === true) d.classList.add('ok')
      if (score[k] === false) d.classList.add('bad')
      dots.appendChild(d)
    }
  }

  function _newRound() {
    root = 50 + Math.floor(Math.random() * 17)
    quality = Math.random() < 0.5 ? 'min' : 'maj'
    rndEl.textContent = `ACCORD ${round + 1} / ${rounds}`
    _renderDots()
    _setAnswerable(false)
  }

  function _playChord() {
    const third = root + (quality === 'min' ? 3 : 4)
    once({
      bpm: 80, steps: 4,
      tracks: [{ patch: 'keys', notes: [{ p: root, s: 0, d: 3 }, { p: third, s: 0, d: 3 }, { p: root + 7, s: 0, d: 3 }] }],
    })
    _setAnswerable(true)
  }

  function _answer(q) {
    const ok = (q === quality)
    score.push(ok)
    _renderDots()
    feed.textContent = ok
      ? 'Oui — ' + (quality === 'min' ? 'mineur.' : 'majeur.')
      : 'Non — c\'était ' + (quality === 'min' ? 'mineur.' : 'majeur.')
    feed.className = ok ? 'feed good' : 'feed warn'
    round++
    if (round < rounds) {
      setTimeout(() => { feed.textContent = ''; _newRound(); _playChord() }, 1100)
    } else {
      const correct = score.filter(Boolean).length
      if (correct >= pass) {
        feed.textContent = `${correct}/${rounds} — l'oreille tranche.`
        feed.className = 'feed good'
        setTimeout(() => _finish(m, ctx), 700)
      } else {
        feed.textContent = `${correct}/${rounds} — encore une série.`
        feed.className = 'feed warn'
        setTimeout(() => { round = 0; score = []; _newRound() }, 1300)
      }
    }
  }

  _newRound()
}
