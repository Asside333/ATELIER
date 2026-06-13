/**
 * path.js — vue "Le chemin"
 *
 * renderPath({ allMissions, modules, done, seen, onSeen, onOpen })
 *   allMissions  Mission[]
 *   modules      Module[]
 *   done         string[]    IDs validés
 *   seen         boolean     message de bienvenue déjà fermé
 *   onSeen       () => void
 *   onOpen       (m: Mission) => void
 */

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

function unlocked(allMissions, done, idx) {
  if (idx === 0) return true
  return done.includes(allMissions[idx - 1].id)
}

export function renderPath({ allMissions, modules, done, seen, onSeen, onOpen }) {
  // ── Bienvenue ─────────────────────────────────────────────────────────────
  const welcomeHost = document.getElementById('welcome')
  welcomeHost.innerHTML = ''
  if (!seen) {
    const card = el('div', 'welcome')
    card.innerHTML = '<b>Bienvenue dans ton atelier.</b> Trois espaces : le <b>Chemin</b> (une mission à la fois, 5–10 minutes), le <b>Studio</b> (deux pistes libres, comme un mini-Ableton), les <b>Briques</b> (tout ce que tu as appris, relisible sans son). Commence par la mission 1.'
    card.appendChild(btn('btn', 'COMPRIS', () => { onSeen(); renderPath({ allMissions, modules, done: done, seen: true, onSeen, onOpen }) }))
    welcomeHost.appendChild(card)
  }

  // ── Liste des modules ─────────────────────────────────────────────────────
  const host = document.getElementById('pathList')
  host.innerHTML = ''

  modules.forEach((mod, mi) => {
    const sec = el('div', 'module')
    sec.style.setProperty('--mh', mod.hue)

    // En-tête module
    const mh = el('div', 'modhead')
    const h = el('h2', '', mod.key + ' — ' + mod.name)
    mh.appendChild(h)
    mh.appendChild(el('div', 'modintro', mod.intro))
    sec.appendChild(mh)

    // Barre de progression
    const list = allMissions.filter(m => m.mod === mi)
    const doneCount = list.filter(m => done.includes(m.id)).length
    const prog = el('div', 'mprog')
    const bar = el('i')
    bar.style.width = (doneCount / list.length * 100) + '%'
    prog.appendChild(bar)
    sec.appendChild(prog)

    // Boutons de mission
    allMissions.forEach((m, i) => {
      if (m.mod !== mi) return
      const isDone = done.includes(m.id)
      const isUnlocked = unlocked(allMissions, done, i)

      const b = el('button', 'mrow')
      if (isDone) b.classList.add('done')
      else if (isUnlocked) b.classList.add('cur')
      else b.disabled = true

      b.appendChild(el('span', 'dot'))
      b.appendChild(el('span', 'mt', (i + 1) + '. ' + m.title))
      b.appendChild(el('span', 'tag t-' + m.tag, m.tag))
      b.addEventListener('click', () => { if (isUnlocked) onOpen(m) })
      sec.appendChild(b)
    })

    host.appendChild(sec)
  })
}
