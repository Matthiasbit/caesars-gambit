export interface TerritoryState {
    territory: string
    owner: string | null
    troops: number
}

export const TERRITORY_NEIGHBORS: Record<string, readonly string[]> = {
    'Agualaine': ['Augusta Nemeters', 'Farnovia', 'Lisitone', 'Montegro', 'Tuskulum'],
    'Alabre Kuste': ['Hari', 'Kraildune', 'Sizillebt Ergansekur', 'Tuku'],
    'ApeniniiTal': ['Porrugiert', 'Sandmeer', 'Varensia', 'Silber-Bucht'],
    'Apilion': ['Felsdüne', 'Hari', 'Mendria', 'Palerno', 'Tuku'],
    'Appullen': ['Eraldis', 'Lisitone', 'Mendria', 'Pergugia', 'Eichenwald'],
    'Aquitane': ['Augusta Nemeters', 'Maureniet'],
    'Augusta Nemeters': ['Agualaine', 'Aquitane', 'Farnovia', 'Forouza', 'Maureniet', 'Tuskulum'],
    'Campania a Lappe': ['Eichenwald', 'Forum Trastevevee', 'Forum Vatlkanstadt'],
    'Dünensee': ['Jonische-Ufer', 'Neapel', 'Ponralma', 'Reniakuste', 'Sizi Küste'],
    'Eichenwald': ['Appullen', 'Campania a Lappe', 'Neapel', 'Ponralma', 'Tenubra'],
    'Eraldis': ['Appullen', 'Mendria', 'Tuku'],
    'Farnovia': ['Agualaine', 'Augusta Nemeters', 'Forouza', 'Lisitone', 'Mattra', 'Pergugia'],
    'Felsdüne': ['Apilion', 'Hari', 'Sandmeer', 'Palerno'],
    'Felsdüne2': ['Molassno', 'Palemo', 'Ponralma Ufer', 'Sizi Küste'],
    'Florenzz': ['Forum Vatlkanstadt', 'Porrugiert', 'Sandfelsen', 'Toscana + Unburia', 'Varensia'],
    'Forouza': ['Augusta Nemeters', 'Farnovia', 'Horthital', 'Mattra', 'Toscana + Unburia'],
    'Forum Trastevevee': ['Campania a Lappe', 'Palatin'],
    'Forum Vatlkanstadt': ['Campania a Lappe', 'Florenzz', 'Porrugiert'],
    'Hairon': ['Mattra', 'Mendria', 'Pergugia', 'Sandfelsen', 'Silber-Bucht'],
    'Hari': ['Alabre Kuste', 'Apilion', 'Felsdüne', 'Lucerra', 'Sandmeer', 'Tuku'],
    'Horthital': ['Forouza', 'Mattra', 'Sandfelsen', 'Silber-Bucht', 'Toscana + Unburia'],
    'Jonische-Ufer': ['Dünensee', 'Reniakuste', 'Strumiciache Ufer'],
    'Kraildune': ['Alabre Kuste', 'Mal Golf Tarent', 'Sizillebt Ergansekur'],
    'Laterano': ['Palatin', 'Toscana + Unburia'],
    'Lauria': ['Montegro', 'Tenubra'],
    'Lisitone': ['Agualaine', 'Appullen', 'Farnovia', 'Marskem', 'Montegro', 'Pergugia'],
    'Lucerra': ['Hari', 'Molassno', 'Palemo', 'Sandmeer', 'Szulionen'],
    'Mal Golf Tarent': ['Kraildune', 'Messno Erkansi', 'Monte Skarno', 'Sizillebt Ergansekur'],
    'Marskem': ['Lisitone', 'Montegro'],
    'Mattra': ['Farnovia', 'Forouza', 'Hairon', 'Horthital', 'Pergugia', 'Sandfelsen', 'Silber-Bucht'],
    'Maureniet': ['Augusta Nemeters', 'Aquitane', 'Tuskulum'],
    'Mendria': ['Apilion', 'Appullen', 'Hairon', 'Palerno', 'Pergugia', 'Tuku'],
    'Messno Erkansi': ['Mal Golf Tarent', 'Monte Skarno', 'Patatra'],
    'Molassno': ['Felsdüne2', 'Lucerra', 'Palemo', 'Szulionen', 'Trevoia'],
    'Monte Skarno': ['Mal Golf Tarent', 'Messno Erkansi', 'Patatra', 'Sizillebt Ergansekur'],
    'Montegro': ['Agualaine', 'Lauria', 'Lisitone', 'Marskem', 'Tuskulum'],
    'Neapel': ['Dünensee', 'Eichenwald', 'Porrugiert', 'Ponralma', 'Reniakuste'],
    'Palatin': ['Forum Trastevevee', 'Laterano'],
    'Palemo': ['Felsdüne2', 'Lucerra', 'Molassno', 'Sandmeer', 'Sizi Küste', 'Szulionen'],
    'Palerno': ['ApeniniiTal', 'Apilion', 'Mendria', 'Silber-Bucht', 'Felsdüne'],
    'Patatra': ['Messno Erkansi', 'Monte Skarno', 'Trevoia'],
    'Pergugia': ['Appullen', 'Farnovia', 'Hairon', 'Lisitone', 'Mattra', 'Mendria'],
    'Ponralma': ['Eichenwald','Dünensee', 'Neapel', 'Reniakuste', 'Trentakuste'],
    'Porrugiert': ['ApeniniiTal', 'Florenzz', 'Forum Vatlkanstadt', 'Neapel', 'Varensia'],
    'Reniakuste': ['Dünensee', 'Jonische-Ufer', 'Neapel', 'Ponralma', 'Strumiciache Ufer', 'Trentakuste'],
    'Sandfelsen': ['Florenzz', 'Hairon', 'Horthital', 'Mattra', 'Silber-Bucht', 'Toscana + Unburia', 'Varensia'],
    'Sandmeer': ['ApeniniiTal', 'Felsdüne', 'Hari', 'Lucerra', 'Palemo', 'Sandfelsen', 'Sizi Küste', 'Szulionen'],
    'Silber-Bucht': ['ApeniniiTal', 'Hairon', 'Horthital', 'Mattra', 'Palerno', 'Sandfelsen', 'Varensia'],
    'Sizillebt Ergansekur': ['Alabre Kuste', 'Kraildune', 'Mal Golf Tarent', 'Monte Skarno'],
    'Sizi Küste': ['Dünensee', 'Felsdüne2', 'Palemo', 'Sandmeer'],
    'Strumiciache Ufer': ['Jonische-Ufer', 'Reniakuste'],
    'Szulionen': ['Lucerra', 'Molassno', 'Palemo', 'Sandmeer', 'Trevoia'],
    'Tenubra' : ['Lauria', 'Eichenwald'],
    'Toscana + Unburia': ['Florenzz', 'Forouza', 'Horthital', 'Laterano', 'Sandfelsen', 'Varensia'],
    'Trevoia': ['Molassno', 'Patatra', 'Szulionen'],
    'Trentakuste': ['Ponralma', 'Reniakuste'],
    'Tuku': ['Alabre Kuste', 'Apilion', 'Eraldis', 'Hari', 'Mendria'],
    'Tuskulum': ['Agualaine', 'Maureniet', 'Montegro'],
    'Varensia': ['ApeniniiTal', 'Florenzz', 'Porrugiert', 'Sandfelsen', 'Silber-Bucht', 'Toscana + Unburia'],
    'Ponralma Ufer': ['Felsdüne2'],
}

export function isAdjacent(from: string, to: string): boolean {
    const normalizedFrom = from.trim()
    const normalizedTo = to.trim()
    const directNeighbors = TERRITORY_NEIGHBORS[normalizedFrom] ?? []
    const reverseNeighbors = TERRITORY_NEIGHBORS[normalizedTo] ?? []
    return directNeighbors.includes(normalizedTo) || reverseNeighbors.includes(normalizedFrom)
}

export function getNeighbors(territory: string): readonly string[] {
    return TERRITORY_NEIGHBORS[territory.trim()] ?? []
}

export function findWayIfPossible(from: string, to: string, territories: TerritoryState[], currentPlayer: string | null): boolean {
    if (from.trim() === to.trim()) {
        return true
    }

    if (!currentPlayer) {
        return false
    }

    const ownedTerritories = new Set(
        territories
            .filter((territory) => territory.owner === currentPlayer)
            .map((territory) => territory.territory),
    )

    if (!ownedTerritories.has(from.trim()) || !ownedTerritories.has(to.trim())) {
        return false
    }

    const visited = new Set<string>()

    const visit = (current: string): boolean => {
        if (current === to.trim()) {
            return true
        }

        if (visited.has(current)) {
            return false
        }

        visited.add(current)

        for (const neighbor of getNeighbors(current)) {
            if (ownedTerritories.has(neighbor) && !visited.has(neighbor)) {
                if (visit(neighbor)) {
                    return true
                }
            }
        }

        return false
    }

    return visit(from.trim())
}
