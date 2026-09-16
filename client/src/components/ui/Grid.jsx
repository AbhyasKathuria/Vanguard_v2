import { useViewport } from '../../hooks/useViewport'
import { SPACE } from '../../styles/tokens'

export default function Grid({ children, desktopCols = 3, tabletCols = 2, mobileCols = 2, gap = SPACE.lg }) {
  const { isDesktop, isTablet } = useViewport()
  const cols = isDesktop ? desktopCols : isTablet ? tabletCols : mobileCols
  return (
    <div style={{
      display:'grid',
      gridTemplateColumns:`repeat(${cols}, 1fr)`,
      gap,
    }}>
      {children}
    </div>
  )
}
