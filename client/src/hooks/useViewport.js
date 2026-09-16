import { useState, useEffect } from 'react'
import { BREAKPOINT } from '../styles/tokens'

export function useViewport() {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1280
  )

  useEffect(() => {
    let raf
    const handler = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setWidth(window.innerWidth))
    }
    window.addEventListener('resize', handler)
    return () => {
      window.removeEventListener('resize', handler)
      cancelAnimationFrame(raf)
    }
  }, [])

  return {
    width,
    isMobile: width < BREAKPOINT.mobile,
    isTablet: width >= BREAKPOINT.mobile && width < BREAKPOINT.tablet,
    isDesktop: width >= BREAKPOINT.desktop,
  }
}
