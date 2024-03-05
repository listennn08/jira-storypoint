import { useState, useEffect } from 'react'
import {
  Button,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography
} from '@mui/material'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import Visibility from '@mui/icons-material/Visibility'
import Add from '@mui/icons-material/Add';
import Delete from '@mui/icons-material/Delete';

export const Options = () => {
  const [email, setEmail] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [baseURL, setBaseURL] = useState('')
  const [boards, setBoards] = useState<{
    id: string
    name: string
  }[]>([])

  const [showPassword, setShowPassword] = useState(false)

  function handleClickShowPassword() {
    setShowPassword(!showPassword)
  }

  function handleMouseDownPassword(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
  }

  function handleSaveOption() {
    console.log(JSON.stringify(boards))
    chrome.storage.sync.set({ 
      email,
      apiKey,
      baseURL,
      boards,
    }, () => {
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
    setBoards([{ id: '', name: '' }])
  }

  useEffect(() => {
    chrome.storage.sync.get(['email', 'apiKey', 'baseURL', 'boards'], (result) => {
      setEmail(result.email)
      setApiKey(result.apiKey)
      setBaseURL(result.baseURL)
      setBoards(result.boards || [{ id: '', name: '' }])
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

      <Grid container item xs={12} gap={2} alignItems="center">
        <Typography variant="h6" width="100%">Jira Boards</Typography>
        {boards.map((board, index) => (
          <Grid container key={`board-${index}`} item xs={12} gap={2} alignItems="center">
            <Grid item xs={1}>
              <TextField
                key={`board-id-${index}`}
                label="Board ID"
                value={board.id}
                fullWidth
                onChange={(e) => {
                  const newBoards = [...boards]
                  newBoards[index].id = e.target.value
                  setBoards(newBoards)
                }}
              />
            </Grid>
            <Grid item xs={5}>
              <TextField
                key={`board-name-${index}`}
                label="Board Name"
                value={board.name}
                fullWidth
                onChange={(e) => {
                  const newBoards = [...boards]
                  newBoards[index].name = e.target.value
                  setBoards(newBoards)
                }}
              />
            </Grid>
            {!!index && (
              <Grid key={`delete-board-${index}`}>
                <IconButton 
                  color="error"
                  onClick={() => {
                    const newBoards = [...boards]
                    newBoards.splice(index, 1)
                    setBoards(newBoards)
                  }}
                >
                  <Delete />
                </IconButton>
              </Grid>
            )}
          </Grid>
        ))}
        <Grid item xs={1}>
          <IconButton color="primary" onClick={() => setBoards([...boards, { id: '', name: '' }])}>
            <Add />
          </IconButton>
        </Grid>
      </Grid>
      
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
