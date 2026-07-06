import { CATALOG } from '../data/fixtures'

// Brand-ish accent per vendor; unknown types fall back to a neutral slate badge.
const VENDOR: Record<string, { bg: string; fg: string }> = {
  'juniper-mist': { bg: '#84b135', fg: '#0b0f16' },
  'cisco-meraki': { bg: '#049fd9', fg: '#ffffff' },
  'palo-alto': { bg: '#fa582d', fg: '#ffffff' },
  'aws-cloudwatch': { bg: '#ff9900', fg: '#0b0f16' },
  datadog: { bg: '#632ca6', fg: '#ffffff' },
  fortinet: { bg: '#ee3124', fg: '#ffffff' },
}

function monogram(type: string): string {
  const name = CATALOG.find((c) => c.type === type)?.name ?? type
  const words = name.split(/[\s-]+/).filter(Boolean)
  const letters = words.length >= 2 ? words[0][0] + words[1][0] : name.slice(0, 2)
  return letters.toUpperCase()
}

export function VendorIcon({ type, size = 32 }: { type: string; size?: number }) {
  const { bg, fg } = VENDOR[type] ?? { bg: 'var(--panel-2)', fg: 'var(--text)' }
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: size, height: size, flexShrink: 0,
        borderRadius: 8, background: bg, color: fg,
        fontSize: size * 0.4, fontWeight: 700, letterSpacing: 0.5,
      }}
    >
      {monogram(type)}
    </span>
  )
}
