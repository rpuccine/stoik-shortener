import React, { useMemo, useState } from 'react'
import { z } from 'zod'
import { Box, Button, TextField, Tooltip } from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

interface Props {
  onSubmit: (url: string, expiresInDays?: number) => Promise<void>
}

const urlSchema = z.string().trim().max(2048).url().refine(
  u => u.startsWith('http://') || u.startsWith('https://'),
  'URL must start with http:// or https://'
)
const expiresSchema = z.union([z.string().length(0), z.coerce.number().int().min(0).max(3650)])

export function UrlForm({ onSubmit }: Props) {
  const [url, setUrl] = useState('')
  const [expires, setExpires] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isValid = useMemo(() => urlSchema.safeParse(url).success, [url])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const u = urlSchema.safeParse(url)
    const ex = expiresSchema.safeParse(expires)
    if (!u.success) return setError(u.error.errors[0]?.message || 'Invalid URL')
    if (!ex.success) return setError('Expiration must be an integer between 0 and 3650')

    setLoading(true)
    try {
      const days = expires === '' ? undefined : Number(expires)
      await onSubmit(u.data, days)
      setUrl('')
      setExpires('')
    } catch (err: any) {
      setError(err.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '2fr 1fr auto' } }}>
      <TextField
        fullWidth
        label="Long URL"
        placeholder="https://example.com/very/long/path?with=params"
        value={url}
        onChange={e => setUrl(e.target.value)}
        error={!!error && !isValid}
        helperText={!isValid ? error : ' '}
        required
      />
      <TextField
        label="Expire after (days)"
        placeholder="Optional"
        inputProps={{ inputMode: 'numeric', min: 0, max: 3650 }}
        value={expires}
        onChange={e => setExpires(e.target.value.replace(/[^0-9]/g, ''))}
      />
      <Button type="submit" disabled={loading || !isValid}>
        {loading ? 'Working…' : 'Shorten'}
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, gridColumn: '1 / -1', color: 'text.secondary' }}>
        <InfoOutlinedIcon fontSize="small" />
        <Tooltip title="0 = expire now; empty = no expiration">
          <span>Expiration: 0 = expire now; empty = unlimited.</span>
        </Tooltip>
      </Box>
      {error && isValid && (
        <Box sx={{ color: 'error.main' }}>{error}</Box>
      )}
    </Box>
  )
}
