import { useState } from 'react'
import type { WizardDraft } from '../draft'
import { mockValidate } from './mockValidate'
import { TextField } from '../../../../components/ui/TextField'
import { Select } from '../../../../components/ui/Select'
import { Button } from '../../../../components/ui/Button'

const REGIONS = [
  { value: 'global', label: 'Global' },
  { value: 'eu', label: 'EU' },
  { value: 'apac', label: 'APAC' },
]

export function StepConnect({ draft, setDraft }: { draft: WizardDraft; setDraft: React.Dispatch<React.SetStateAction<WizardDraft>> }) {
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState<string>()

  const setConn = (patch: Partial<WizardDraft['connection']>) =>
    setDraft((d) => ({ ...d, connection: { ...d.connection, ...patch } }))

  const test = async () => {
    setTesting(true); setError(undefined)
    const res = await mockValidate(draft.connection.token)
    setTesting(false)
    if (res.ok) setConn({ tested: true })
    else { setConn({ tested: false }); setError(res.error) }
  }

  return (
    <div>
      <TextField label="Connection Name" value={draft.name}
        onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
        error={draft.name.trim() ? undefined : 'Connection name is required'}
        placeholder="e.g. Juniper Mist – Global" />
      <TextField label="API token" type="password" value={draft.connection.token}
        onChange={(v) => { setConn({ token: v, tested: false }); setError(undefined) }} placeholder="Paste your Mist API token" />
      <Select label="Region / cloud" value={draft.connection.region} onChange={(v) => setConn({ region: v, tested: false })} options={REGIONS} />
      <Button variant="ghost" disabled={!draft.connection.token || testing} onClick={test}>
        {testing ? 'Testing…' : 'Test connection'}
      </Button>
      {draft.connection.tested && !error && <p style={{ color: 'var(--green)' }}>✓ Connected</p>}
      {error && <p style={{ color: 'var(--red)' }}>{error}</p>}
    </div>
  )
}
