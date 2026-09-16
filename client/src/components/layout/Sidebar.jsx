import { NavLink } from 'react-router-dom'
import { Home, Map, MessageSquare, Users, AlertTriangle,
         Bot, Building2, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { SIZE, SPACE, RADIUS, FONT } from '../../styles/tokens'

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { userProfile } = useAuth()
  const { t } = useTranslation()
  const w = collapsed ? SIZE.sidebarCollapsed : SIZE.sidebarWidth

  const items = [
    { path: '/', icon: Home, label: t('nav_home'), end: true },
    { path: '/map', icon: Map, label: t('nav_map') },
    { path: '/community', icon: MessageSquare, label: t('nav_community') },
    { path: '/workers', icon: Users, label: t('nav_workers') },
    { path: '/emergency', icon: AlertTriangle, label: t('nav_emergency') },
    { path: '/ai', icon: Bot, label: t('nav_ai') },
    { path: '/officials', icon: Building2, label: t('nav_officials') },
    { path: '/profile', icon: User, label: t('nav_profile') },
  ]

  return (
    <aside style={{
      width: w,
      flex: `0 0 ${w}px`,
      height: '100vh',
      position: 'sticky',
      top: 0,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.18s ease',
      zIndex: 20,
    }}>
      <div style={{
        height: SIZE.topbarHeight,
        flex: `0 0 ${SIZE.topbarHeight}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        padding: collapsed ? 0 : `0 ${SPACE.lg}px`,
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{display:'flex', alignItems:'center', gap: collapsed ? 0 : 8}}>
          <img src="/vanguard-icon.png" alt="VANGUARD" 
               style={{height:26, width:26, flexShrink:0, objectFit:'contain'}} />
          {!collapsed && (
            <span style={{fontWeight:800, fontSize:16, color:'var(--text)', 
                           whiteSpace:'nowrap'}}>VANGUARD</span>
          )}
        </div>
        <button onClick={() => setCollapsed(c => !c)} aria-label="Toggle sidebar" style={{
          width:32, height:32, flexShrink:0, borderRadius:RADIUS.sm,
          background:'transparent', border:'none', cursor:'pointer',
          color:'var(--text-muted)', display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          {collapsed ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}
        </button>
      </div>

      <nav style={{
        flex: '1 1 auto',
        overflowY: 'auto',
        padding: `${SPACE.md}px ${SPACE.sm}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}>
        {items.map(({path, icon:Icon, label, end}) => (
          <NavLink key={path} to={path} end={end} style={({isActive}) => ({
            display:'flex', alignItems:'center', gap:SPACE.md,
            height: SIZE.touchTarget,
            padding: collapsed ? 0 : `0 ${SPACE.md}px`,
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: RADIUS.md,
            textDecoration:'none',
            color: isActive ? 'var(--accent)' : 'var(--text-muted)',
            background: isActive ? 'var(--accent-soft)' : 'transparent',
            fontWeight: isActive ? 700 : 500,
            fontSize: FONT.base,
            whiteSpace:'nowrap',
          })}>
            <Icon size={19} style={{flexShrink:0}} />
            {!collapsed && <span style={{overflow:'hidden', textOverflow:'ellipsis'}}>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div style={{
        flex: `0 0 64px`,
        height: 64,
        borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: SPACE.sm,
        padding: collapsed ? 0 : `0 ${SPACE.md}px`,
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <div style={{
          width:36, height:36, borderRadius:'50%', flexShrink:0,
          background:'var(--accent-soft)', color:'var(--accent)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontWeight:700, fontSize:FONT.base,
        }}>{(userProfile?.name||'U')[0].toUpperCase()}</div>
        {!collapsed && (
          <div style={{minWidth:0}}>
            <div style={{fontSize:FONT.sm, fontWeight:700, color:'var(--text)',
                         whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
              {userProfile?.name || 'User'}
            </div>
            <div style={{fontSize:FONT.xs, color:'var(--accent)', fontWeight:600, textTransform:'capitalize'}}>
              {userProfile?.role || 'citizen'}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
