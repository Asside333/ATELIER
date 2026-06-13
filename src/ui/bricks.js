import { brickCard } from './mission.js'

export function renderBricks({ allMissions, modules, done }) {
  const host = document.getElementById('brickGrid')
  const detail = document.getElementById('brickDetail')
  host.innerHTML = ''
  detail.innerHTML = ''

  allMissions.forEach((m, i) => {
    const got = done.includes(m.id)
    const b = document.createElement('button')
    b.className = 'brick' + (got ? '' : ' locked')
    b.style.setProperty('--mh', modules[m.mod]?.hue ?? 'var(--amber)')

    const bno = document.createElement('div')
    bno.className = 'bno'
    bno.textContent = 'Nº' + (i + 1)

    const bn = document.createElement('div')
    bn.className = 'bn'
    bn.textContent = got ? m.brick.name : '· · ·'

    b.appendChild(bno)
    b.appendChild(bn)

    if (got) {
      b.addEventListener('click', () => {
        detail.innerHTML = ''
        detail.appendChild(brickCard(m, { allMissions, modules }, true))
        detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      })
    } else {
      b.disabled = true
    }
    host.appendChild(b)
  })
}
