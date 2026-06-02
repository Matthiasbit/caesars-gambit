import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import styles from './GameCard.module.css'
import { TerritoryLabels } from './TerritoryLabels'
import { getColorForOwner, useOwnerColorMap } from '@/lib/useOwnerColorMap'
import { getContinentForTerritory } from '@/lib/continents'

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
    onTerritoryAnimationEnd?: (territoryId: string) => void
    continentConquered?: { player: string; continent: string } | null
    playerNames?: string[]
    clickableRegions?: string[]
}

export default function GameCard({ onRegionClick, onRegionHover, gameStateJson, selectedRegionId, hoveredRegionId, justConqueredTerritory, onTerritoryAnimationEnd, continentConquered, playerNames = [], clickableRegions = [] }: GameCardProps) {
    const svgContainerRef = useRef<HTMLDivElement | null>(null)
    const onRegionClickRef = useRef(onRegionClick)
    const onRegionHoverRef = useRef(onRegionHover)
    const [svgLoaded, setSvgLoaded] = useState(false)
    const ownerColorMap = useOwnerColorMap(playerNames)

    const territories = useMemo<TerritoryData[]>(() => {
        if (!gameStateJson) return []
        try {
            const parsed = JSON.parse(gameStateJson)
            return Array.isArray(parsed) ? parsed : []
        } catch (err) {
            console.error('Fehler beim Parsen von gameStateJson:', err)
            return []
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

        const continentOwnerMap = new Map<string, string | null>()
        const continentGroups = new Map<string, TerritoryData[]>()
        territories.forEach(t => {
            const cont = getContinentForTerritory(t.territory)
            if (cont) {
                const group = continentGroups.get(cont) ?? []
                group.push(t)
                continentGroups.set(cont, group)
            }
        })
        continentGroups.forEach((terrs, cont) => {
            const firstOwner = terrs[0]?.owner
            const controlled = !!firstOwner && terrs.every(t => t.owner === firstOwner)
            continentOwnerMap.set(cont, controlled ? firstOwner : null)
        })

        regions.forEach((region) => {
            const territory = territories.find((entry) => entry.territory === region.id)
            const territoryColor = territory ? getColorForOwner(territory.owner, ownerColorMap) : null
            const isClickable = clickableRegions.length === 0 || clickableRegions.includes(region.id)

            region.setAttribute('fill', 'transparent')
            region.setAttribute('fill-opacity', '0')
            region.setAttribute('stroke', 'transparent')
            region.setAttribute('stroke-width', '0')
            region.style.fill = 'transparent'
            region.style.fillOpacity = '0'
            region.style.stroke = '#f00'
            region.style.strokeWidth = '0'
            region.style.filter = 'none'
            region.style.transition = 'all 0.2s ease'
            region.style.cursor = isClickable ? 'pointer' : 'not-allowed'
            region.style.opacity = isClickable ? '1' : '0.4'

            if (territory?.owner && territoryColor) {
                region.setAttribute('fill', territoryColor)
                region.setAttribute('fill-opacity', '0.55')
                region.setAttribute('stroke', 'rgba(255,255,255,0.7)')
                region.setAttribute('stroke-width', '1')
                region.style.fill = territoryColor
                region.style.fillOpacity = '0.55'
                region.style.stroke = 'rgba(255,255,255,0.7)'
                region.style.strokeWidth = '1'
            }

            if (territory) {
                const cont = getContinentForTerritory(territory.territory)
                if (cont) {
                    const continentOwner = continentOwnerMap.get(cont)
                    if (continentOwner) {
                        const continentColor = getColorForOwner(continentOwner, ownerColorMap)
                        if (continentColor) {
                            region.setAttribute('stroke', continentColor)
                            region.setAttribute('stroke-width', '2')
                            region.setAttribute('fill-opacity', '0.4')
                            region.style.stroke = continentColor
                            region.style.strokeWidth = '2'
                            region.style.fillOpacity = '0.4'
                            if (!region.classList.contains('continent-conquered')) {
                                region.setAttribute('stroke', continentColor)
                                region.style.stroke = continentColor
                            }
                        }
                    }
                }
            }
            if (region.id === justConqueredTerritory) {
                const animationEndHandler = () => {
                    region.classList.remove('territory-conquered')
                    onTerritoryAnimationEnd?.(region.id)
                    region.removeEventListener('animationend', animationEndHandler)
                }

                region.removeEventListener('animationend', animationEndHandler)
                region.classList.add('territory-conquered')
                region.addEventListener('animationend', animationEndHandler)
            }

            if (territory?.territory === selectedRegionId && territoryColor) {
                region.setAttribute('fill', territoryColor)
                region.setAttribute('fill-opacity', '0.85')
                region.setAttribute('stroke', territoryColor)
                region.setAttribute('stroke-width', '3')
                region.setAttribute('opacity', '1')
                region.style.fill = territoryColor
                region.style.fillOpacity = '0.85'
                region.style.opacity = '1'
                region.style.stroke = territoryColor
                region.style.strokeWidth = '3'

            } else if (territory?.owner && territoryColor && territory.territory === hoveredRegionId) {
                region.setAttribute('fill', territoryColor)
                region.setAttribute('fill-opacity', '0.75')
                region.setAttribute('stroke', 'rgba(255,255,255,0.98)')
                region.setAttribute('stroke-width', '3')
                region.style.fill = territoryColor
                region.style.fillOpacity = '0.75'
                region.style.stroke = 'rgba(255,255,255,0.98)'
                region.style.strokeWidth = '3'
            }
        })
    }, [territories, ownerColorMap, selectedRegionId, hoveredRegionId, justConqueredTerritory, onTerritoryAnimationEnd, svgLoaded, clickableRegions])

    // Continent conquest pulse animation
    useEffect(() => {
        if (!continentConquered || !svgLoaded) return
        const container = svgContainerRef.current
        if (!container) return
        const svg = container.querySelector('svg')
        if (!svg) return

        const affectedRegions = svg.querySelectorAll<SVGGraphicsElement>('path[id]')
        const conquered = continentConquered.continent
        const toAnimate: SVGGraphicsElement[] = []
        affectedRegions.forEach(region => {
            const territory = territories.find(t => t.territory === region.id)
            if (territory && getContinentForTerritory(territory.territory) === conquered) {
                toAnimate.push(region)
            }
        })
        toAnimate.forEach(region => {
            const animationEndHandler = () => {
                region.classList.remove('continent-conquered')
                region.removeEventListener('animationend', animationEndHandler)
            }

            region.removeEventListener('animationend', animationEndHandler)
            region.classList.remove('continent-conquered')
            void (region as unknown as { offsetWidth: number }).offsetWidth
            region.classList.add('continent-conquered')
            region.addEventListener('animationend', animationEndHandler)
        })
    }, [continentConquered, onTerritoryAnimationEnd, svgLoaded, territories])

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
                    playerNames={playerNames}
                />
            </div>
        </>
    )
}
