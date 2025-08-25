import React, { useCallback, useState } from 'react'
import { Box, Container, Snackbar, Alert, Typography, Paper } from '@mui/material'
import { UrlForm } from './components/UrlForm'
import { ResultCard } from './components/ResultCard'
import { shorten, getStats } from './lib/api'
import type { ShortenResponse, StatsResponse } from './types'

export default function App() {
  const [result, setResult] = useState<ShortenResponse | null>(null)
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [snack, setSnack] = useState<string | null>(null)

  const handleShorten = useCallback(async (url: string, expiresInDays?: number) => {
    const data: ShortenResponse = await shorten(url, expiresInDays)
    setResult(data)
    try {
      const s: StatsResponse = await getStats(data.short_url)
      setStats(s)
    } catch {
      setStats(null)
    }
  }, [])

  const copyShort = useCallback(() => {
    if (!result) return
    navigator.clipboard?.writeText(result.short_link)
    setSnack('Short link copied to clipboard')
  }, [result])

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={0} sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h3" gutterBottom>URL Shortener</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Paste a long URL and get a short link. Optionally set an expiration.
        </Typography>
        <UrlForm onSubmit={handleShorten} />
        <ResultCard data={result} stats={stats} onCopy={copyShort} />
      </Paper>

      <Box sx={{ textAlign: 'center', color: 'text.disabled', mt: 4, fontSize: 12 }}>
        API endpoint: <code>{import.meta.env.VITE_API_BASE ?? 'http://localhost:3000'}</code>
      </Box>

      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack(null)}>
        <Alert severity="success" variant="filled">{snack}</Alert>
      </Snackbar>
    </Container>
  )
}
