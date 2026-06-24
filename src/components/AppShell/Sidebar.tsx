import { NavLink } from 'react-router-dom'

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  display: 'block', padding: '8px 12px', borderRadius: 6,
  color: isActive ? 'var(--text)' : 'var(--muted)',
  background: isActive ? 'var(--panel-2)' : 'transparent',
  textDecoration: 'none', fontSize: 14,
})

function SectionLabel({ children }: { children: string }) {
  return <div style={{ fontSize: 11, letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase', margin: '16px 0 6px' }}>{children}</div>
}

export function Sidebar() {
  return (
    <nav style={{ width: 240, padding: 16, borderRight: '1px solid var(--border)', height: '100%' }}>
      <SectionLabel>Network</SectionLabel>
      <NavLink to="/" style={linkStyle} end>Summary</NavLink>
      <NavLink to="/" style={linkStyle}>Juniper Mist</NavLink>
      <SectionLabel>Integrate</SectionLabel>
      <NavLink to="/configure" style={linkStyle}>Configure</NavLink>
      <NavLink to="/integrations" style={linkStyle}>Integrations</NavLink>
    </nav>
  )
}
