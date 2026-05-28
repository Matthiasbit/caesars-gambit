export interface ContinentInfo {
  bonusTroops: number
  territories: readonly string[]
}

export const CONTINENTS: Record<string, ContinentInfo> = {
  BLAUE_KUESTE: {
    bonusTroops: 2,
    territories: ['Palatin', 'Laterano', 'Forum Trastevevee', 'Campania a Lappe'],
  },
  ANTIKENHERZ: {
    bonusTroops: 5,
    territories: [
      'Toscana + Unburia', 'Florenzz', 'Forum Vatlkanstadt', 'Varensia',
      'Porrugiert', 'Sandfelsen', 'ApeniniiTal', 'Palerno', 'Hairon',
      'Mattra', 'Horthital', 'Forouza',
    ],
  },
  WESTKUESTE: {
    bonusTroops: 3,
    territories: [
      'Eichenwald', 'Ponralma', 'Neapel', 'Trentakuste',
      'Dünensee', 'Reniakuste', 'Jonische-Ufer', 'Strumiciache Ufer',
    ],
  },
  NORDOSTEN: {
    bonusTroops: 7,
    territories: [
      'Aquitane', 'Maureniet', 'Tuskulum', 'Augusta Nemeters',
      'Agualaine', 'Farnovia', 'Montegro', 'Marskem', 'Lisitone',
      'Lauria', 'Tenubra', 'Pergugia', 'Appullen', 'Eraldis', 'Mendria',
    ],
  },
  SUEDMITTE: {
    bonusTroops: 5,
    territories: [
      'Silber-Bucht', 'Apilion', 'Tuku', 'Felsdüne', 'Sizi Küste',
      'Sandmeer', 'Hari', 'Palemo', 'Felsdüne2', 'Ponralma Ufer',
      'Molassno', 'Lucerra', 'Szulionen', 'Trevoia', 'Patatra',
    ],
  },
  SUEDOSTEN: {
    bonusTroops: 3,
    territories: [
      'Alabre Kuste', 'Sizillebt Ergansekur', 'Kraildune',
      'Mal Golf Tarent', 'Messno Erkansi', 'Monte Skarno',
    ],
  },
}

/** Gibt den Kontinent-Key (z.B. "BLAUE_KUESTE") für ein Gebiet zurück, oder null. */
export function getContinentForTerritory(territory: string): string | null {
  for (const [key, info] of Object.entries(CONTINENTS)) {
    if ((info.territories as string[]).includes(territory)) return key
  }
  return null
}
