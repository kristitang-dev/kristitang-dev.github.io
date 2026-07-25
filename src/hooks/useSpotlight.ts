import { useCallback, useEffect, useRef } from 'react'

const DEFAULT_LERP = 0.08

interface Point {
  x: number
  y: number
}

export function useSpotlight(
  containerRef: React.RefObject<HTMLElement | null>,
  anchorRef: React.RefObject<Element | null>,
  lerpFactor = DEFAULT_LERP,
) {
  const spotRef = useRef<Point>({ x: 0, y: 0 })
  const targetRef = useRef<Point>({ x: 0, y: 0 })
  const initializedRef = useRef(false)

  const getAnchor = useCallback((): Point | null => {
    const container = containerRef.current
    const anchor = anchorRef.current
    if (!container || !anchor) return null

    const cRect = container.getBoundingClientRect()
    const aRect = anchor.getBoundingClientRect()

    return {
      x: aRect.left + aRect.width / 2 - cRect.left,
      y: aRect.top + aRect.height / 2 - cRect.top,
    }
  }, [containerRef, anchorRef])

  const applySpot = useCallback(
    (point: Point) => {
      const container = containerRef.current
      if (!container) return
      container.style.setProperty('--spot-x', `${point.x}px`)
      container.style.setProperty('--spot-y', `${point.y}px`)
    },
    [containerRef],
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const snapToAnchor = () => {
      const anchor = getAnchor()
      if (!anchor) return

      targetRef.current = anchor

      if (!initializedRef.current) {
        spotRef.current = { ...anchor }
        initializedRef.current = true
        applySpot(anchor)
      }
    }

    snapToAnchor()

    // Ensure layout is complete before first snap
    requestAnimationFrame(() => {
      requestAnimationFrame(snapToAnchor)
    })

    const resizeObserver = new ResizeObserver(snapToAnchor)
    resizeObserver.observe(container)
    if (anchorRef.current) {
      resizeObserver.observe(anchorRef.current)
    }

    let rafId = 0
    const animate = () => {
      const spot = spotRef.current
      const target = targetRef.current

      spot.x += (target.x - spot.x) * lerpFactor
      spot.y += (target.y - spot.y) * lerpFactor

      applySpot(spot)
      rafId = requestAnimationFrame(animate)
    }

    rafId = requestAnimationFrame(animate)

    const onMove = (e: MouseEvent) => {
      const cRect = container.getBoundingClientRect()
      targetRef.current = {
        x: e.clientX - cRect.left,
        y: e.clientY - cRect.top,
      }
    }

    const onLeave = () => {
      const anchor = getAnchor()
      if (anchor) {
        targetRef.current = anchor
      }
    }

    container.addEventListener('mousemove', onMove)
    container.addEventListener('mouseleave', onLeave)
    window.addEventListener('resize', snapToAnchor)

    return () => {
      cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
      container.removeEventListener('mousemove', onMove)
      container.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('resize', snapToAnchor)
    }
  }, [containerRef, anchorRef, getAnchor, applySpot, lerpFactor])
}
