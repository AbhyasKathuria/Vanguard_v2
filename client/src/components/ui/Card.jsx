import { RADIUS, SPACE } from '../../styles/tokens'

export default function Card({ children, onClick, padding = SPACE.lg, style = {} }) {
  return (
    <div
      onClick={onClick}
      style={{
        background:'var(--surface)',
        border:'1px solid var(--border)',
        borderRadius: RADIUS.lg,
        padding,
        boxShadow:'var(--shadow-sm)',
        cursor: onClick ? 'pointer' : 'default',
        transition:'box-shadow .15s, transform .15s',
        ...style,
      }}
      onMouseEnter={onClick ? (e)=>{e.currentTarget.style.boxShadow='var(--shadow)'; e.currentTarget.style.transform='translateY(-1px)'} : undefined}
      onMouseLeave={onClick ? (e)=>{e.currentTarget.style.boxShadow='var(--shadow-sm)'; e.currentTarget.style.transform='translateY(0)'} : undefined}
    >
      {children}
    </div>
  )
}
