const LS = 'atelier_v3'
const DEFAULTS = { done: [], streak: 0, lastDay: '', seen: false, names: 'fr', sketches: [] }

let S = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(LS) || '{}') }

const save = () => localStorage.setItem(LS, JSON.stringify(S))
const today = () => new Date().toISOString().slice(0, 10)

export const getState = () => S

export function markDone(id) {
  if (!S.done.includes(id)) S.done.push(id)
  save()
}

export function markActivity() {
  const t = today()
  if (S.lastDay === t) return
  const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10)
  S.streak = (S.lastDay === yesterday) ? S.streak + 1 : 1
  S.lastDay = t
  save()
}

export function setSeen() { S.seen = true; save() }

export function toggleNames() {
  S.names = S.names === 'fr' ? 'en' : 'fr'
  save()
  return S.names
}

export function addSketch(sketch) {
  if (!S.sketches) S.sketches = []
  S.sketches.push(sketch)
  markActivity()
  save()
}

export function removeSketch(i) {
  if (!S.sketches) return
  S.sketches.splice(i, 1)
  save()
}

export function resetProgress() {
  localStorage.removeItem(LS)
  location.reload()
}
