import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material'
import App from './Options'
import './index.css'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

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
