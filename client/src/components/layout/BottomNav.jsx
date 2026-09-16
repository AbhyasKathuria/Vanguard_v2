import { NavLink } from 'react-router-dom'
import { Home, Map, MessageSquare, Bot, User } from 'lucide-react'
import { SIZE } from '../../styles/tokens'

export default function BottomNav() {
  const items = [
    { path:'/', icon:Home, end:true },
    { path:'/map', icon:Map },
    { path:'/community', icon:MessageSquare },
    { path:'/ai', icon:Bot },
    { path:'/profile', icon:User },
  ]

  return (
    <nav style={{
      position:'fixed', left:0, right:0, bottom:0,
      height: SIZE.bottomNavHeight,
      background:'var(--surface)',
      borderTop:'1px solid var(--border)',
      display:'flex', zIndex:30,
      paddingBottom:'env(safe-area-inset-bottom)',
    }}>
      {items.map(({path, icon:Icon, end}) => (
        <NavLink key={path} to={path} end={end} style={({isActive}) => ({
          flex:'1 1 0%',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          color: isActive ? 'var(--accent)' : 'var(--text-muted)',
          textDecoration:'none', gap:3,
        })}>
          {({isActive}) => (
            <>
              <Icon size={22} />
              <span style={{
                width:4, height:4, borderRadius:'50%',
                background: isActive ? 'var(--accent)' : 'transparent',
              }} />
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
