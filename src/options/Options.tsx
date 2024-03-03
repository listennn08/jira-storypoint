import { useState, useEffect } from 'react'
import { Box, Button, Card, FormControl, Grid, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField, Typography } from '@mui/material'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import Visibility from '@mui/icons-material/Visibility'

export const Options = () => {
  const [email, setEmail] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [baseURL, setBaseURL] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  function handleClickShowPassword() {
    setShowPassword(!showPassword)
  }

  function handleMouseDownPassword(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
  }

  function handleSaveOption() {
    chrome.storage.sync.set({ email, apiKey, baseURL }, () => {
      console.log('Options saved')
    })
    chrome.runtime.sendMessage({ event: 'options-saved' })
  }

  function handleClearOption() {
    chrome.storage.sync.clear(() => {
      console.log('Options cleared')
    })
    chrome.runtime.sendMessage({ event: 'options-cleared' })
    setEmail('')
    setApiKey('')
    setBaseURL('')
  }

  useEffect(() => {
    chrome.storage.sync.get(['email', 'apiKey', 'baseURL'], (result) => {
      setEmail(result.email)
      setApiKey(result.apiKey)
      setBaseURL(result.baseURL)
    })
  }, [])

  return (
    <Grid container p={12} gap={4} justifyContent="end">
      <Typography variant="h4" width="100%">Options</Typography>
      <TextField
        label="Jira base URL"
        value={baseURL}
        onChange={(e) => setBaseURL(e.target.value)}
        fullWidth
      />
      <TextField
        label="Jira account email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
      />
      <TextField
        label="Jira API key"
        type={showPassword ? 'text' : 'password'}
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Button
        variant="contained"
        onClick={handleSaveOption}
      >
        Save
      </Button>
      <Button
        variant="contained"
        color="error"
        onClick={handleClearOption}
      >
        Clear
      </Button>
    </Grid>
  )
}

export default Options
