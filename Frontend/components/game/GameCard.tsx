import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import styles from './GameCard.module.css'
import { TerritoryLabels } from './TerritoryLabels'
import { getColorForOwner, useOwnerColorMap } from '@/lib/useOwnerColorMap'

const KARTE_SVG_PATH = '/assets/Karte-neutral.svg'
const KARTE_FABIG_PATH = '/assets/Karte-fabig.jpg'

interface TerritoryData {
    territory: string
    owner: string | null
    troops: number
}

export interface GameCardProps {
    onRegionClick?: (regionId: string) => void
    onRegionHover?: (regionId: string | null) => void
    gameStateJson?: string | null
    selectedRegionId?: string | null
    hoveredRegionId?: string | null
    justConqueredTerritory?: string | null
}

export default function GameCard({ onRegionClick, onRegionHover, gameStateJson, selectedRegionId, hoveredRegionId, justConqueredTerritory }: GameCardProps) {
    const svgContainerRef = useRef<HTMLDivElement | null>(null)
    const onRegionClickRef = useRef(onRegionClick)
    const onRegionHoverRef = useRef(onRegionHover)
    const [territories, setTerritories] = useState<TerritoryData[]>([])
    const [svgLoaded, setSvgLoaded] = useState(false)
    const ownerColorMap = useOwnerColorMap(territories)

    useEffect(() => {
        if (!gameStateJson) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTerritories([])
            return
        }

        try {
            const parsed = JSON.parse(gameStateJson)
            if (Array.isArray(parsed)) {
                setTerritories(parsed)
            }
        } catch (err) {
            console.error('Fehler beim Parsen von gameStateJson:', err)
        }
    }, [gameStateJson])

    useEffect(() => {
        onRegionClickRef.current = onRegionClick
    }, [onRegionClick])

    useEffect(() => {
        onRegionHoverRef.current = onRegionHover
    }, [onRegionHover])

    useEffect(() => {
        const container = svgContainerRef.current
        if (!container) return
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSvgLoaded(false)

        fetch(KARTE_SVG_PATH)
            .then((res) => res.text())
            .then((svgText) => {
                container.innerHTML = svgText

                const svg = container.querySelector('svg')
                if (!svg) return

                svg.setAttribute('width', '100%')
                svg.setAttribute('height', '100%')
                svg.style.display = 'block'
                svg.style.opacity = '1'
                svg.style.pointerEvents = 'auto'

                const regions =
                    svg.querySelectorAll<SVGGraphicsElement>('path[id]')

                regions.forEach((region) => {
                    region.style.cursor = 'pointer'
                    region.style.pointerEvents = 'auto'

                    const clickHandler = () => {
                        onRegionClickRef.current?.(region.id)
                    }

                    const mouseEnterHandler = () => {
                        onRegionHoverRef.current?.(region.id)
                    }

                    const mouseLeaveHandler = () => {
                        onRegionHoverRef.current?.(null)
                    }

                    region.addEventListener('click', clickHandler)
                    region.addEventListener('mouseenter', mouseEnterHandler)
                    region.addEventListener('mouseleave', mouseLeaveHandler)
                        ; (region as SVGGraphicsElement & { _gcClickHandler?: () => void })._gcClickHandler = clickHandler
                        ; (region as SVGGraphicsElement & { _gcMouseEnterHandler?: () => void })._gcMouseEnterHandler = mouseEnterHandler
                        ; (region as SVGGraphicsElement & { _gcMouseLeaveHandler?: () => void })._gcMouseLeaveHandler = mouseLeaveHandler
                })

                setSvgLoaded(true)

                return () => {
                    regions.forEach((region) => {
                        const handler = (region as SVGGraphicsElement & { _gcClickHandler?: () => void })._gcClickHandler
                        if (handler) {
                            region.removeEventListener('click', handler)
                        }
                    })
                }
            })
            .catch((err) => {
                console.error('SVG konnte nicht geladen werden:', err)
            })
    }, [])

    useEffect(() => {
        if (!svgLoaded) return

        const container = svgContainerRef.current
        if (!container) return

        const svg = container.querySelector('svg')
        if (!svg) return

        const regions = svg.querySelectorAll<SVGGraphicsElement>('path[id]')

        regions.forEach((region) => {
            const territory = territories.find((entry) => entry.territory === region.id)
            const territoryColor = territory ? getColorForOwner(territory.owner, ownerColorMap) : null

            region.setAttribute('fill', 'transparent')
            region.setAttribute('fill-opacity', '0')
            region.setAttribute('stroke', 'transparent')
            region.setAttribute('stroke-width', '0')
            region.style.fill = 'transparent'
            region.style.fillOpacity = '0'
            region.style.stroke = 'transparent'
            region.style.strokeWidth = '0'
            region.style.filter = 'none'
            region.style.transition = 'all 0.2s ease'

            // Show all territories with 35% opacity
            if (territory?.owner && territoryColor) {
                region.setAttribute('fill', territoryColor)
                region.setAttribute('fill-opacity', '0.35')
                region.setAttribute('stroke', 'rgba(255,255,255,0.7)')
                region.setAttribute('stroke-width', '1')
                region.style.fill = territoryColor
                region.style.fillOpacity = '0.35'
                region.style.stroke = 'rgba(255,255,255,0.7)'
                region.style.strokeWidth = '1'
            }

            // Apply conquest animation if this territory was just conquered
            if (region.id === justConqueredTerritory) {
                region.classList.add('territory-conquered')
                // Remove animation class after animation completes so it can be replayed
                setTimeout(() => {
                    region.classList.remove('territory-conquered')
                }, 1500)
            }

            // Highlight selected territory
            if (territory?.territory === selectedRegionId && territoryColor) {
                region.setAttribute('fill', territoryColor)
                region.setAttribute('fill-opacity', '0.55')
                region.setAttribute('stroke', 'rgba(255,255,255,0.95)')
                region.setAttribute('stroke-width', '3')
                region.style.fill = territoryColor
                region.style.fillOpacity = '0.55'
                region.style.stroke = 'rgba(255,255,255,0.95)'
                region.style.strokeWidth = '3'
                region.style.filter = 'drop-shadow(0 0 8px rgba(255,255,255,0.45))'
            } else if (territory?.owner && territoryColor && territory.territory === hoveredRegionId) {
                region.setAttribute('fill', territoryColor)
                region.setAttribute('fill-opacity', '0.75')
                region.setAttribute('stroke', 'rgba(255,255,255,0.98)')
                region.setAttribute('stroke-width', '3')
                region.style.fill = territoryColor
                region.style.fillOpacity = '0.75'
                region.style.stroke = 'rgba(255,255,255,0.98)'
                region.style.strokeWidth = '3'
                region.style.filter = 'drop-shadow(0 0 15px rgba(255,255,255,0.6))'
            }
        })
    }, [territories, ownerColorMap, selectedRegionId, hoveredRegionId, justConqueredTerritory, svgLoaded])

    return (
        <>
            <div className={styles.mapWrapper}>
                <Image
                    src={KARTE_FABIG_PATH}
                    alt="Spielkarte"
                    className={styles.mapBg}
                    priority
                    width={2400}
                    height={1600}
                    style={{ width: '100%', height: '100%' }}
                />

                <div
                    ref={svgContainerRef}
                    className={styles.mapSvgContainer}
                    onMouseLeave={() => onRegionHoverRef.current?.(null)}
                />
                <TerritoryLabels
                    gameStateJson={gameStateJson || null}
                    onTerritoryButtonClick={onRegionClick}
                    onTerritoryHover={onRegionHover}
                />
            </div>
        </>
    )
}
