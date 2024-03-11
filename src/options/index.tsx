import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material'
import App from './Options'
import './index.css'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
  typography: {
    fontWeightRegular: 500
  },
})

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <ThemeProvider theme={darkTheme}>
    <App />
  </ThemeProvider>,
)
