import { useMemo } from 'react'

const COLOR_PALETTE = [
    '#e6194b',
    '#3cb44b',
    '#ffe119',
    '#4363d8',
    '#f58231',
    '#911eb4',
    '#46f0f0',
    '#f032e6',
    '#bcf60c',
    '#fabebe',
]

export const useOwnerColorMap = (playerNames: string[]) => {
    const ownerColorMap = useMemo(() => {
        const map: Record<string, string> = {}

        playerNames.forEach((playerName, index) => {
            map[playerName] = COLOR_PALETTE[index % COLOR_PALETTE.length]
        })

        return map
    }, [playerNames])

    return ownerColorMap
}

export const getColorForOwner = (owner: string | null, colorMap: Record<string, string>): string => {
    if (!owner) return '#666666'
    return colorMap[owner] || '#888888'
}
