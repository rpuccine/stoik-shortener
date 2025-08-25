import React from 'react'
import { Card, CardContent, CardHeader, Chip, Divider, IconButton, Link, Stack, Tooltip, Typography } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import QueryStatsIcon from '@mui/icons-material/QueryStats'
import { ShortenResponse, StatsResponse } from '../types'

interface Props {
  data: ShortenResponse | null
  stats: StatsResponse | null
  onCopy: () => void
}

export function ResultCard({ data, stats, onCopy }: Props) {
  if (!data) return null
  const createdAt = stats ? new Date(stats.created_at).toLocaleString() : null
  const expiresAt = data.expires_at ? new Date(data.expires_at).toLocaleString() : null

  return (
    <Card variant="outlined" sx={{ mt: 3 }}>
      <CardHeader
        title="Your short link"
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Open in new tab">
              <IconButton component={Link} href={data.short_link} target="_blank" rel="noreferrer">
                <OpenInNewIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy to clipboard">
              <IconButton onClick={onCopy}>
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        }
      />
      <Divider />
      <CardContent>
        <Typography variant="h6" sx={{ wordBreak: 'break-all' }}>
          <Link href={data.short_link} target="_blank" rel="noreferrer">{data.short_link}</Link>
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, wordBreak: 'break-all' }}>
          Original: {data.original_url}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          {expiresAt && <Chip label={`Expires: ${expiresAt}`} size="small" />}
        </Stack>

        {stats && (
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
            <QueryStatsIcon fontSize="small" />
            <Typography variant="body2" color="text.secondary">Created: {createdAt}</Typography>
            <Typography variant="body2" color="text.secondary">Clicks: {stats.hits}</Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}
