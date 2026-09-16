import { Bell, Sun, Moon } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useViewport } from '../../hooks/useViewport'
import { SIZE, SPACE, RADIUS, FONT } from '../../styles/tokens'
import { useNavigate } from 'react-router-dom'

export default function TopBar() {
  const { userProfile } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { currentLang, changeLanguage, languagesList } = useLanguage()
  const { isDesktop } = useViewport()
  const navigate = useNavigate()
  const h = isDesktop ? SIZE.topbarHeight : SIZE.topbarHeightMobile

  return (
    <header style={{
      height: h, flex: `0 0 ${h}px`,
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: isDesktop ? `0 ${SPACE.xxl}px` : `0 ${SPACE.md}px`,
      gap: SPACE.md,
      position: 'sticky', top: 0, zIndex: 15,
    }}>
      {/* Left: logo only on mobile/tablet (sidebar has it on desktop) */}
      {!isDesktop ? (
        <img src="/vanguard-icon.png" alt="VANGUARD" 
             style={{height:24, width:24, flexShrink:0, objectFit:'contain'}} />
      ) : <div />}

      <div style={{display:'flex', alignItems:'center', gap: isDesktop ? SPACE.md : SPACE.sm}}>
        <select value={currentLang} onChange={(e) => changeLanguage(e.target.value)} style={{
          background:'var(--surface-2)', border:'1px solid var(--border)',
          borderRadius:RADIUS.sm, padding: isDesktop ? '6px 10px' : '4px 6px',
          fontSize: isDesktop ? FONT.sm : 10, color:'var(--text)', cursor:'pointer',
          maxWidth: isDesktop ? 'none' : 56,
        }}>
          {languagesList.map(l => (
            <option key={l.code} value={l.code}>
              {isDesktop ? l.nativeName : l.code.toUpperCase()}
            </option>
          ))}
        </select>

        <button onClick={toggleTheme} aria-label="Toggle theme" style={{
          width: isDesktop ? 36 : 32, height: isDesktop ? 36 : 32,
          borderRadius:RADIUS.sm, background:'var(--surface-2)',
          border:'1px solid var(--border)', display:'flex',
          alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text)',
        }}>
          {theme==='dark' ? <Sun size={isDesktop?16:14}/> : <Moon size={isDesktop?16:14}/>}
        </button>

        {isDesktop && (
          <button aria-label="Notifications" style={{
            width:36, height:36, borderRadius:RADIUS.sm,
            background:'var(--surface-2)', border:'1px solid var(--border)',
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text)',
          }}><Bell size={16}/></button>
        )}

        <button
          onClick={() => navigate('/profile')}
          style={{
            display:'flex', alignItems:'center', gap:SPACE.sm,
            background:'transparent', border:'none', cursor:'pointer',
            padding: isDesktop ? '4px 8px' : 0,
            borderRadius: RADIUS.md,
            paddingLeft: isDesktop ? SPACE.md : 0,
            borderLeft: isDesktop ? '1px solid var(--border)' : 'none',
          }}
          onMouseEnter={isDesktop ? (e)=>{e.currentTarget.style.background='var(--surface-2)'} : undefined}
          onMouseLeave={isDesktop ? (e)=>{e.currentTarget.style.background='transparent'} : undefined}
        >
          {isDesktop && (
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:FONT.sm, fontWeight:700, color:'var(--text)'}}>
                {userProfile?.name || 'User'}
              </div>
              <div style={{fontSize:FONT.xs, color:'var(--accent)', fontWeight:600, textTransform:'capitalize'}}>
                {userProfile?.role || 'citizen'}
              </div>
            </div>
          )}
          <div style={{
            width: isDesktop?34:30, height: isDesktop?34:30, borderRadius:'50%',
            background:'var(--accent-soft)', color:'var(--accent)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontWeight:700, fontSize: isDesktop?13:12, flexShrink:0,
          }}>{(userProfile?.name||'U')[0].toUpperCase()}</div>
        </button>
      </div>
    </header>
  )
}
