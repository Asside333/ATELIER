// Noms de notes — convention Ableton : Do3/C3 = MIDI 60
export const NFR = ['Do','Do#','Ré','Ré#','Mi','Fa','Fa#','Sol','Sol#','La','La#','Si']
export const NEN = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']

/** Retourne le nom affiché d'un pitch MIDI (ex: 60 → "Do3", 57 → "La2"). */
export function noteName(p, lang = 'fr') {
  const names = lang === 'fr' ? NFR : NEN
  const pc = ((p % 12) + 12) % 12
  const octave = Math.floor(p / 12) - 2
  return names[pc] + octave
}

/** Vrai si le pitch correspond à une touche noire. */
export function isBlack(p) {
  return [1, 3, 6, 8, 10].includes(((p % 12) + 12) % 12)
}

/** Classe de hauteur 0-11 (Do=0 … Si=11). */
export function notePC(p) {
  return ((p % 12) + 12) % 12
}

/** Fréquence Hz d'un pitch MIDI (La4=440 Hz). */
export function freq(p) {
  return 440 * Math.pow(2, (p - 69) / 12)
}

/**
 * Parse un nom de note avec octave vers un pitch MIDI.
 * "La2" → 57, "Do3" → 60, "Sol#3" → 68, "A2" → 57 (EN)
 * Retourne null si le format est invalide.
 */
export function parseName(name, lang = 'fr') {
  const names = lang === 'fr' ? NFR : NEN
  // Trie par longueur décroissante pour que "Do#" passe avant "Do"
  const sorted = [...names].sort((a, b) => b.length - a.length)
  const pat = sorted.map(n => n.replace('#', '\\#')).join('|')
  const re = new RegExp(`^(${pat})(-?\\d)$`)
  const m = name.match(re)
  if (!m) return null
  const pc = names.indexOf(m[1])
  if (pc < 0) return null
  const octave = parseInt(m[2], 10)
  return (octave + 2) * 12 + pc
}

/**
 * Compare deux tableaux de pitches indépendamment de l'ordre.
 * eqSet([57,60,64], [64,57,60]) → true
 */
export function eqSet(a, b) {
  const x = [...a].sort((m, n) => m - n)
  const y = [...b].sort((m, n) => m - n)
  return x.length === y.length && x.every((v, i) => v === y[i])
}

/**
 * Durée d'un step en secondes pour un séquenceur de `steps` pas par mesure à `bpm`.
 * stepDur(132, 16) → 0.1136…s
 */
export function stepDur(bpm, steps = 16) {
  return 60 / bpm / (steps / 4)
}
