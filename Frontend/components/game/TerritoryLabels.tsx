import { useEffect, useState } from 'react'
import { useOwnerColorMap, getColorForOwner } from '@/lib/useOwnerColorMap'

interface TerritoryData {
    territory: string
    owner: string | null
    troops: number
}

interface TerritoryLabelsProps {
    gameStateJson: string | null
    onTerritoryButtonClick?: (territoryId: string) => void
    onTerritoryHover?: (territoryId: string | null) => void
    playerNames?: string[]
}

export const TerritoryLabels: React.FC<TerritoryLabelsProps> = ({
    gameStateJson,
    onTerritoryButtonClick,
    onTerritoryHover,
    playerNames = [],
}) => {
    const [territories, setTerritories] = useState<TerritoryData[]>([])

    useEffect(() => {
        if (!gameStateJson) return

        try {
            const parsed = JSON.parse(gameStateJson)
            if (Array.isArray(parsed)) {
                Promise.resolve().then(() => setTerritories(parsed))
            }
        } catch (err) {
            console.error('Fehler beim Parsen von gameStateUpdate:', err)
        }
    }, [gameStateJson])

    const ownerColorMap = useOwnerColorMap(playerNames)

    const territoryPositions: Record<string, { x: number; y: number }> = {
        Palatin: { x: 166.3, y: 92.6 },
        Laterano: { x: 296.2, y: 107.0 },
        'Forum Trastevevee': { x: 175.8, y: 200.1 },
        'Campania a Lappe': { x: 158.3, y: 279.0 },
        Eichenwald: { x: 205.0, y: 355.7 },
        Ponralma: { x: 198.4, y: 435.3 },
        Neapel: { x: 305.7, y: 417.9 },
        Trentakuste: { x: 128.2, y: 482.6 },
        Dünensee: { x: 346.0, y: 467.3 },
        Reniakuste: { x: 232.3, y: 511.4 },
        'Jonische-Ufer': { x: 358.1, y: 524.9 },
        'Strumiciache Ufer': { x: 222.8, y: 575.5 },
        'Toscana + Unburia': { x: 479.5, y: 136.2 },
        Florenzz: { x: 419.0, y: 220.2 },
        'Forum Vatlkanstadt': { x: 336.3, y: 274.5 },
        Varensia: { x: 496.6, y: 251.1 },
        Porrugiert: { x: 416.2, y: 311.3 },
        Sandfelsen: { x: 571.8, y: 203.4 },
        ApeniniiTal: { x: 505.2, y: 329.6 },
        'Silber-Bucht': { x: 594.5, y: 258.9 },
        Palerno: { x: 644.4, y: 319.3 },
        Hairon: { x: 693.0, y: 240.4 },
        Mattra: { x: 701.1, y: 178.4 },
        Horthital: { x: 631.8, y: 145.6 },
        Forouza: { x: 666.1, y: 112.1 },
        Apilion: { x: 731.7, y: 350.0 },
        Mendria: { x: 749.3, y: 292.3 },
        Pergugia: { x: 786.9, y: 216.7 },
        Farnovia: { x: 768.9, y: 169.7 },
        Lisitone: { x: 854.3, y: 189.4 },
        Marskem: { x: 922.9, y: 192.1 },
        Appullen: { x: 862.4, y: 264.6 },
        Tuku: { x: 812.1, y: 360.8 },
        Eraldis: { x: 859.5, y: 324.3 },
        'Augusta Nemeters': { x: 759.9, y: 95.7 },
        Aquitane: { x: 743.7, y: 46.7 },
        Maureniet: { x: 830.3, y: 45.0 },
        Tuskulum: { x: 897.2, y: 74.3 },
        Montegro: { x: 934.1, y: 141.2 },
        Agualaine: { x: 844.1, y: 125.1 },
        Lauria: { x: 999.5, y: 239.8 },
        Tenubra: { x: 966.0, y: 310.2 },
        Felsdüne: { x: 709.6, y: 384.1 },
        'Sizi Küste': { x: 512.5, y: 451.2 },
        Sandmeer: { x: 670.5, y: 453.5 },
        Hari: { x: 789.7, y: 424.2 },
        Palemo: { x: 617.9, y: 511.8 },
        Felsdüne2: { x: 531.7, y: 551.6 },
        'Ponralma Ufer': { x: 423.3, y: 636.1 },
        Molassno: { x: 621.7, y: 577.6 },
        Lucerra: { x: 713.9, y: 503.4 },
        Szulionen: { x: 711.0, y: 561.3 },
        Trevoia: { x: 699.5, y: 611.8 },
        Patatra: { x: 782.5, y: 655.6 },
        'Alabre Kuste': { x: 922.3, y: 406.4 },
        'Sizillebt Ergansekur': { x: 950.0, y: 514.4 },
        Kraildune: { x: 960.7, y: 449.8 },
        'Mal Golf Tarent': { x: 866.9, y: 527.4 },
        'Messno Erkansi': { x: 862.6, y: 592.8 },
        path1764700: { x: 896.2, y: 542.0 },
        'Monte Skarno': { x: 908.9, y: 598.5 },
    }

    return (
        <svg
            viewBox="0 0 1093.3333 717.33331"
            xmlns="http://www.w3.org/2000/svg"
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 50,
                mixBlendMode: 'normal',
            }}
        >
            {territories.map((territory) => {
                const pos = territoryPositions[territory.territory]
                if (!pos) {
                    console.warn('No position for territory', territory.territory)
                    return null
                }

                const color = getColorForOwner(territory.owner, ownerColorMap)

                return (
                    <g
                        key={territory.territory}
                    >
                        <circle
                            cx={pos.x}
                            cy={pos.y}
                            r={16}
                            fill="rgba(0,0,0,0.45)"
                            pointerEvents="none"
                        />
                        <g
                            transform={`translate(${pos.x}, ${pos.y})`}
                            style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                            onClick={() => onTerritoryButtonClick?.(territory.territory)}
                            onMouseEnter={() => onTerritoryHover?.(territory.territory)}
                            onMouseLeave={() => onTerritoryHover?.(null)}
                            aria-label={`Territory ${territory.territory}`}
                        >
                            <circle cx={0} cy={0} r={12} fill={color} stroke="#000" strokeWidth={1} />
                            <text
                                x={0}
                                y={0}
                                fontSize="11"
                                fontWeight={700}
                                fill="#000"
                                textAnchor="middle"
                                dominantBaseline="middle"
                            >
                                {territory.troops}
                            </text>
                        </g>
                    </g>
                )
            })}
        </svg>
    )
}
