/**
 * keyboard.js — clavier piano fixé en bas
 *
 * initKeyboard(opts)   — configure et (re)construit le clavier
 * getKBSel()           — pitches sélectionnés (mode 'select'), triés
 * clearKBSel()         — vide la sélection
 * flashKey(p)          — flash ambre bref
 * showKeyboard()       — affiche #kbzone
 * hideKeyboard()       — cache #kbzone
 * setKBLang(lang)      — rebascule fr/en et re-render
 */
import { noteName, isBlack } from '../core/model.js'

// ── ÉTAT ──────────────────────────────────────────────────────────────────────

let KB = {
  low: 60, high: 84,
  mode: 'play',     // 'play' | 'select'
  sel: new Set(),
  max: 0,           // 0 = illimité
  onChange: null,   // () => void, rappelé après chaque toggle
  lang: 'fr',
  playSound: null,  // async (p, vel) => void
}

// ── API PUBLIQUE ──────────────────────────────────────────────────────────────

export function initKeyboard({ low, high, mode = 'play', max = 0, onChange = null, lang = 'fr', playSound = null }) {
  KB = { low, high, mode, sel: new Set(), max, onChange, lang, playSound }
  _render()
}

export function getKBSel() {
  return [...KB.sel].sort((a, b) => a - b)
}

export function clearKBSel() {
  KB.sel.clear()
  _refreshSel()
}

export function flashKey(p) {
  const k = document.querySelector(`#kb [data-p="${p}"]`)
  if (!k) return
  k.classList.add('flash')
  setTimeout(() => k.classList.remove('flash'), 130)
}

export function showKeyboard() {
  document.getElementById('kbzone').classList.add('show')
}

export function hideKeyboard() {
  document.getElementById('kbzone').classList.remove('show')
  KB.sel.clear()
}

export function setKBLang(lang) {
  KB.lang = lang
  _render()
}

// ── INTERNE ───────────────────────────────────────────────────────────────────

function _refreshSel() {
  document.querySelectorAll('#kb [data-p]').forEach(k =>
    k.classList.toggle('sel', KB.sel.has(+k.dataset.p))
  )
}

function _tap(p, vel) {
  if (KB.playSound) KB.playSound(p, vel)

  if (KB.mode === 'select') {
    if (KB.sel.has(p)) {
      KB.sel.delete(p)
    } else {
      if (KB.max === 1) KB.sel.clear()  // comportement radio : une seule note
      KB.sel.add(p)
    }
    _refreshSel()
    if (KB.onChange) KB.onChange()
  }

  flashKey(p)
}

function _render() {
  const el = document.getElementById('kb')
  el.innerHTML = ''

  const whites = [], blacks = []
  for (let p = KB.low; p <= KB.high; p++) {
    (isBlack(p) ? blacks : whites).push(p)
  }
  const ww = 100 / whites.length
  const wx = {}
  whites.forEach((p, i) => { wx[p] = i * ww })

  const mkKey = (p, black, left, width) => {
    const k = document.createElement('button')
    k.className = 'key ' + (black ? 'b' : 'w')
    k.style.left = left + '%'
    k.style.width = width + '%'
    k.dataset.p = p
    if (!black) {
      const lab = document.createElement('span')
      lab.className = 'klab'
      lab.textContent = noteName(p, KB.lang)
      k.appendChild(lab)
    }
    if (KB.sel.has(p)) k.classList.add('sel')
    k.addEventListener('pointerdown', e => { e.preventDefault(); _tap(p, 0.9) })
    k.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); _tap(p, 0.9) }
    })
    el.appendChild(k)
  }

  whites.forEach(p => mkKey(p, false, wx[p], ww - 0.3))
  blacks.forEach(p => mkKey(p, true, wx[p - 1] + ww * 0.62, ww * 0.72))
}
