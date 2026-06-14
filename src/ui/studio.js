/**
 * studio.js — Studio libre 2 pistes
 *
 * initStudio() — câble une seule fois tous les listeners DOM
 * renderStudio() — re-render complet (appelé à chaque changement d'état)
 */
import { NFR, NEN } from '../core/model.js'
import { getState, addSketch, removeSketch } from '../core/store.js'
import { loopStart, stop as playerStop, isRunning } from '../core/player.js'
import { playImmediate } from '../core/engine.js'
import { renderGrid, playhead, mkTools } from './grid.js'

// ── PATCHES EXPOSÉS ───────────────────────────────────────────────────────────

const PATCHES = {
  sub: 'SUB', bass: 'BASSE', wobble: 'WOBBLE',
  keys: 'CLÉS', pad: 'PAD', pluck: 'PLUCK',
  bell: 'BELL', stab: 'STAB',
}

// ── GAMMES ────────────────────────────────────────────────────────────────────

const SCALE_PAT = {
  min: [0, 2, 3, 5, 7, 8, 10],
  maj: [0, 2, 4, 5, 7, 9, 11],
}

// ── ÉTAT STUDIO ───────────────────────────────────────────────────────────────

const STU = {
  bpm: 132,
  steps: 16,
  active: 0,       // 0 = piste A, 1 = piste B
  rowLow: 40,      // pitch le plus bas de la grille
  tool: 'put',
  tracks: [
    { name: 'A', patch: 'sub',  notes: [] },
    { name: 'B', patch: 'keys', notes: [] },
  ],
}

// ── HELPERS DOM ──────────────────────────────────────────────────────────────

const $ = sel => document.querySelector(sel)

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

// ── GRILLE ────────────────────────────────────────────────────────────────────

function stuRows() {
  const rows = []
  for (let p = STU.rowLow + 11; p >= STU.rowLow; p--) rows.push(p)
  return rows
}

function inScale(p) {
  const mode = $('#stMode').value
  if (!mode) return false
  const root = +$('#stRoot').value
  const pat = SCALE_PAT[mode] || []
  return pat.includes(((p - root) % 12 + 12) % 12)
}

function renderStuGrid() {
  const a = STU.tracks[STU.active]
  const b = STU.tracks[1 - STU.active]
  const lang = getState().names || 'fr'
  renderGrid($('#stGrid'), {
    rows: stuRows(),
    steps: STU.steps,
    notes: a.notes,
    ghost: b.notes,
    lang,
    editable: true,
    patch: a.patch,
    tool: () => STU.tool,
    hl: inScale,
    onSound: (patch, p, vel) => playImmediate(patch, p, vel, 0.2),
    onEdit: () => {
      if (isRunning()) _startLoop()
    },
  })
}

// ── CONFIG PLAYER ─────────────────────────────────────────────────────────────

function stuCfg() {
  STU.bpm = Math.min(200, Math.max(60, +$('#stBpm').value || 132))
  return {
    bpm: STU.bpm,
    steps: STU.steps,
    swing: (+$('#stSwing').value || 0) / 100,
    tracks: STU.tracks.map(t => ({ patch: t.patch, notes: t.notes })),
  }
}

function _startLoop() {
  loopStart(stuCfg(), { onStep: s => playhead($('#stGrid'), s) })
  $('#stPlay').textContent = '■ STOP'
  $('#stPlay').classList.add('live')
}

// ── SKETCHES ──────────────────────────────────────────────────────────────────

function renderSketches() {
  const host = $('#stSketches')
  host.innerHTML = ''
  const sketches = getState().sketches || []
  if (!sketches.length) return
  host.appendChild(el('div', 'eyebrow', 'Sketches'))
  sketches.forEach((sk, i) => {
    const r = el('div', 'skrow')
    r.appendChild(el('span', 'nm', sk.name))
    r.appendChild(el('span', 'ts', new Date(sk.ts).toLocaleDateString('fr-FR')))
    r.appendChild(btn('btn', 'CHARGER', () => loadSketch(sk)))
    r.appendChild(btn('btn', '✕', () => {
      if (confirm(`Supprimer "${sk.name}" ?`)) {
        removeSketch(i)
        renderSketches()
      }
    }))
    host.appendChild(r)
  })
}

function loadSketch(sk) {
  playerStop()
  if (sk.seq?.tracks) {
    STU.tracks = sk.seq.tracks.map(t => ({
      name: t.name || 'A',
      patch: t.patch,
      notes: t.notes.map(n => ({ ...n })),
    }))
    while (STU.tracks.length < 2) STU.tracks.push({ name: 'B', patch: 'keys', notes: [] })
    $('#stSwing').value = Math.round((sk.seq.swing || 0) * 100)
  }
  $('#stBpm').value = sk.seq?.bpm || 132
  const ps = STU.tracks.flatMap(t => t.notes.map(n => n.p))
  if (ps.length) STU.rowLow = Math.max(21, Math.min(...ps))
  STU.active = 0
  renderStudio()
}

// ── RENDER COMPLET ────────────────────────────────────────────────────────────

export function renderStudio() {
  const lang = getState().names || 'fr'
  const NAMES = lang === 'fr' ? NFR : NEN

  // Root select — peuplé une seule fois, labels mis à jour si lang change
  const rootSel = $('#stRoot')
  if (!rootSel.options.length) {
    NAMES.forEach((n, i) => {
      const o = document.createElement('option')
      o.value = i
      o.textContent = n
      if (i === 9) o.selected = true   // La par défaut
      rootSel.appendChild(o)
    })
  } else {
    ;[...rootSel.options].forEach((o, i) => { o.textContent = NAMES[i] })
  }

  // Patch select — peuplé une seule fois
  const pSel = $('#stPatch')
  if (!pSel.options.length) {
    Object.entries(PATCHES).forEach(([k, v]) => {
      const o = document.createElement('option')
      o.value = k; o.textContent = v
      pSel.appendChild(o)
    })
  }
  pSel.value = STU.tracks[STU.active].patch

  // Boutons de piste — libellé = patch courant
  $('#trkA').classList.toggle('on', STU.active === 0)
  $('#trkB').classList.toggle('on', STU.active === 1)
  $('#trkA').textContent = 'PISTE A · ' + (PATCHES[STU.tracks[0].patch] || '?')
  $('#trkB').textContent = 'PISTE B · ' + (PATCHES[STU.tracks[1].patch] || '?')

  // Outils
  mkTools($('#stTools'), ['put', 'len', 'vel'], () => STU.tool, v => { STU.tool = v })

  // Grille
  renderStuGrid()

  // Légende
  $('#stLegend').textContent = 'Piste active en ambre. L\'autre piste apparaît en contour turquoise — change de piste pour l\'éditer. Lignes éclaircies = notes de la gamme.'

  // Sketches
  renderSketches()
}

// ── INIT (une seule fois) ─────────────────────────────────────────────────────

let _inited = false

export function initStudio() {
  if (_inited) return
  _inited = true

  // Pistes A / B
  $('#trkA').addEventListener('click', () => { STU.active = 0; renderStudio() })
  $('#trkB').addEventListener('click', () => { STU.active = 1; renderStudio() })

  // Son de la piste active
  $('#stPatch').addEventListener('change', () => {
    const t = STU.tracks[STU.active]
    t.patch = $('#stPatch').value
    $(STU.active === 0 ? '#trkA' : '#trkB').textContent =
      'PISTE ' + t.name + ' · ' + (PATCHES[t.patch] || '?')
    renderStuGrid()
    if (isRunning()) _startLoop()
  })

  // Info gamme
  $('#stWhat').addEventListener('click', () => $('#scaleInfo').classList.toggle('show'))

  // Gamme → re-render
  $('#stRoot').addEventListener('change', renderStuGrid)
  $('#stMode').addEventListener('change', renderStuGrid)

  // Octave
  $('#stUp').addEventListener('click', () => {
    STU.rowLow = Math.min(84, STU.rowLow + 12)
    renderStuGrid()
  })
  $('#stDn').addEventListener('click', () => {
    STU.rowLow = Math.max(21, STU.rowLow - 12)
    renderStuGrid()
  })

  // Play / Stop
  $('#stPlay').addEventListener('click', () => {
    if (isRunning()) {
      playerStop()
      playhead($('#stGrid'), -1)
      $('#stPlay').textContent = '▶ LIRE'
      $('#stPlay').classList.remove('live')
    } else {
      _startLoop()
    }
  })

  // Swing / BPM live
  $('#stSwing').addEventListener('input', () => {
    if (isRunning()) _startLoop()
  })
  $('#stBpm').addEventListener('input', () => {
    if (isRunning()) _startLoop()
  })

  // Effacer la piste active
  $('#stClear').addEventListener('click', () => {
    STU.tracks[STU.active].notes.length = 0
    renderStuGrid()
  })

  // Sauver sketch
  $('#stSave').addEventListener('click', () => {
    if (!STU.tracks.some(t => t.notes.length)) {
      $('#midiStat').textContent = 'Rien à sauver — pose des notes.'
      setTimeout(() => { $('#midiStat').textContent = '' }, 2000)
      return
    }
    const sketches = getState().sketches || []
    const name = prompt('Nom du sketch :', `Sketch ${sketches.length + 1}`)
    if (name == null) return
    addSketch({
      name: name || `Sketch ${sketches.length + 1}`,
      ts: Date.now(),
      seq: {
        bpm: Math.min(200, Math.max(60, +$('#stBpm').value || 132)),
        steps: STU.steps,
        swing: (+$('#stSwing').value || 0) / 100,
        tracks: JSON.parse(JSON.stringify(STU.tracks)),
      },
    })
    renderSketches()
  })

  // MIDI — stub v3.0
  $('#midiBtn').addEventListener('click', () => {
    $('#midiStat').textContent = 'MIDI-in : disponible en v3.1.'
    setTimeout(() => { $('#midiStat').textContent = '' }, 3000)
  })

  // Render initial
  renderStudio()
}
