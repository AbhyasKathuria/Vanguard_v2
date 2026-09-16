import { FONT, SPACE } from '../../styles/tokens'

export default function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{
      display:'flex', alignItems:'flex-start', justifyContent:'space-between',
      marginBottom: SPACE.xl, gap: SPACE.md, flexWrap:'wrap',
    }}>
      <div>
        {/* Accessible title utilizing upgraded FONT.xxl scale */}
        <h1 style={{fontSize:FONT.xxl, fontWeight:800, color:'var(--text)', margin:0}}>
          {title}
        </h1>
        {subtitle && (
          <p style={{fontSize:FONT.base, color:'var(--text-muted)', marginTop:4}}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}
