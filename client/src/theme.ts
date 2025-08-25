import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  shape: { borderRadius: 12 },
  typography: {
    h3: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 }
  },
  components: {
    MuiTextField: {
      defaultProps: { size: 'small' }
    },
    MuiButton: {
      defaultProps: { variant: 'contained' }
    },
    MuiPaper: {
      styleOverrides: { root: { padding: 16 } }
    }
  }
})
