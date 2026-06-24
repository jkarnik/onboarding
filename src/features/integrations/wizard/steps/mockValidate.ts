export function mockValidate(token: string): Promise<{ ok: boolean; error?: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!token) resolve({ ok: false, error: 'Enter an API token.' })
      else if (token.includes('fail')) resolve({ ok: false, error: 'Could not connect. Check your token and region.' })
      else resolve({ ok: true })
    }, 500)
  })
}
