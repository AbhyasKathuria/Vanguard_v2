import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import { useViewport } from '../../hooks/useViewport'
import { SIZE } from '../../styles/tokens'

export default function AppLayout() {
  const { isDesktop } = useViewport()

  return (
    <div style={{
      display: 'flex',
      width: '100%',
      minHeight: '100vh',
      background: 'var(--bg)',
    }}>
      {isDesktop && <Sidebar />}

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 0%',
        minWidth: 0,
        minHeight: '100vh',
      }}>
        <TopBar />

        <main style={{
          flex: '1 1 auto',
          width: '100%',
          maxWidth: SIZE.maxContentWidth,
          marginInline: 'auto',
          padding: isDesktop ? '28px 32px' : '16px 16px 88px',
          boxSizing: 'border-box',
        }}>
          <Outlet />
        </main>

        {!isDesktop && <BottomNav />}
      </div>
    </div>
  )
}
