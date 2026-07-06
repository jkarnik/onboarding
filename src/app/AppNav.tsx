import { NavLink } from 'react-router-dom'
import { allNav } from './registry'

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  display: 'block', padding: '8px 12px', borderRadius: 6,
  color: isActive ? 'var(--text)' : 'var(--muted)',
  background: isActive ? 'var(--panel-2)' : 'transparent',
  textDecoration: 'none', fontSize: 14,
})

function SectionLabel({ children }: { children: string }) {
  return <div style={{ fontSize: 11, letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase', margin: '16px 0 6px' }}>{children}</div>
}

export function AppNav() {
  return (
    <nav style={{ width: 240, padding: 16, borderRight: '1px solid var(--border)', height: '100%' }}>
      {allNav.map((item, i) => {
        if (item.kind === 'link') {
          return <NavLink key={i} to={item.to} style={linkStyle} end={item.end}>{item.label}</NavLink>
        }
        return (
          <div key={i}>
            <SectionLabel>{item.label}</SectionLabel>
            {item.links.map((l, j) => (
              <NavLink key={j} to={l.to} style={linkStyle} end={l.end}>{l.label}</NavLink>
            ))}
          </div>
        )
      })}
    </nav>
  )
}
