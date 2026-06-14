/**
 * app.js — point d'entrée UI
 *
 * init() est appelé depuis main.js.
 * Charge les données, câble la nav, le header et les 4 vues.
 */
import modules from '../data/modules.json'
import { getState, markDone, markActivity, setSeen, toggleNames, resetProgress } from '../core/store.js'
import { renderPath } from './path.js'
import { openMission } from './mission.js'
import { stop as playerStop } from '../core/player.js'
import { init as engineInit, isReady as engineReady } from '../core/engine.js'
import { setKBLang } from './keyboard.js'
import { initStudio, renderStudio } from './studio.js'
import { renderBricks } from './bricks.js'

// ── DONNÉES ───────────────────────────────────────────────────────────────────

const missionFiles = import.meta.glob('../data/missions/*.json', { eager: true })
const allMissions = Object.keys(missionFiles)
  .sort()
  .flatMap(k => {
    const mod = missionFiles[k]
    return Array.isArray(mod) ? mod : (mod.default ?? [])
  })

// ── STORE PROXY (shape attendue par mission.js) ───────────────────────────────

const store = { getState, markDone, markActivity }

// ── NAV ───────────────────────────────────────────────────────────────────────

const VIEWS = ['path', 'studio', 'bricks', 'mission']

function showView(id) {
  VIEWS.forEach(v => {
    const el = document.getElementById('v-' + v)
    if (el) el.classList.toggle('active', v === id)
  })
  const navMap = { path: 'nav-path', studio: 'nav-studio', bricks: 'nav-bricks' }
  Object.values(navMap).forEach(nbId => document.getElementById(nbId)?.classList.remove('on'))
  if (navMap[id]) document.getElementById(navMap[id])?.classList.add('on')
}

// ── HEADER ────────────────────────────────────────────────────────────────────

function renderHeader() {
  const s = getState()
  document.getElementById('hStreak').textContent = s.streak
  document.getElementById('hDone').textContent = s.done.length
  document.getElementById('hTotal').textContent = allMissions.length
}

// ── CHEMIN ────────────────────────────────────────────────────────────────────

function goPath() {
  renderHeader()
  const s = getState()
  renderPath({
    allMissions,
    modules,
    done: s.done,
    seen: s.seen,
    onSeen: setSeen,
    onOpen: openMissionView,
  })
  showView('path')
}

// ── MISSION ───────────────────────────────────────────────────────────────────

function openMissionView(m) {
  showView('mission')
  openMission(m, {
    allMissions,
    modules,
    store,
    onFinish: goPath,
    onBack: goPath,
  })
}

// ── INIT ──────────────────────────────────────────────────────────────────────

export function init() {
  // Buttons de navigation
  document.getElementById('nav-path').addEventListener('click', () => { playerStop(); goPath() })
  document.getElementById('nav-studio').addEventListener('click', () => {
    playerStop()
    initStudio()
    renderStudio()
    showView('studio')
  })
  document.getElementById('nav-bricks').addEventListener('click', () => {
    renderBricks({ allMissions, modules, done: getState().done })
    showView('bricks')
  })

  // Toggle noms de notes
  document.getElementById('nmToggle').addEventListener('click', () => {
    const lang = toggleNames()
    document.getElementById('nmToggle').textContent = lang === 'fr' ? 'DO/C' : 'C/DO'
    setKBLang(lang)
  })

  // Réinitialisation
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('Effacer toute la progression ? Cette action est irréversible.')) resetProgress()
  })

  // Unlock Web Audio au premier geste
  document.addEventListener('pointerdown', () => {
    if (!engineReady()) engineInit()
  }, { once: true, passive: true })

  // Affichage initial
  const lang = getState().names || 'fr'
  document.getElementById('nmToggle').textContent = lang === 'fr' ? 'DO/C' : 'C/DO'

  goPath()
}
