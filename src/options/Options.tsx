import { useState, useEffect, useCallback } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography
} from "@mui/material";
import { 
  Delete,
  Download,
  DragIndicator,
  Save,
  Upload,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import DownloadDialog from "./DownloadDialog";
import { STORAGE_KEYS } from "../constants";
import { reorder } from "../utils";
import BoardItem from "./BoardItem";
import { DragDropContext, Draggable, DropResult, Droppable } from "react-beautiful-dnd";

const initialNewBoard = () => ({
  id: "",
  name: "",
  key: "",
  _id: Math.random().toString(36).substr(2, 9),
})

export const Options = () => {
  const initialNewForm = () => ({
    email: "",
    apiKey: "",
    baseURL: "",
    sprintStartWord: "",
    boards: [initialNewBoard()],
  })

  const [form, setForm] = useState(initialNewForm())

  const [showPassword, setShowPassword] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [successTexts, setSuccessTexts] = useState<string[]>([])

  useEffect(() => {
    setTimeout(() => {
      setSuccessTexts((successText) => successText.slice(1))
    }, 3000)
  }, [successTexts])

  function addBoardConfig() {
    setForm((form) => ({
      ...form,
      boards: [
        ...form.boards,
        initialNewBoard(),
      ]
    }))
  }

  function handleClickShowPassword() {
    setShowPassword(!showPassword)
  }

  function handleMouseDownPassword(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
  }

  function handleExport(confirm: boolean) {
    const data: Record<string, any> = {
      email: confirm ?  form.email : undefined,
      apiKey: confirm ?  form.apiKey : undefined,
      baseURL: form.baseURL,
      boards: form.boards,
    }

    for (let key in data) {
      if (!data[key]) {
        delete data[key]
      }
    }

    const file = new Blob([JSON.stringify(data)], { type: "application/json" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(file)
    a.download = "jira-config.json"
    a.click()
    setSuccessTexts((successText) => [...successText, "Options exported"])
  }

  function readConfigFile(file: File) {
    const reader = new FileReader()
    reader.onload = function (e) {
      const data = JSON.parse(e.target?.result as string)
      setForm(data)

      setSuccessTexts((successText) => [...successText, "Options imported"])

      chrome.storage.sync.set(data, () => {
        setSuccessTexts((successText) => [...successText, "Options saved"])
      })
    }

    reader.readAsText(file)
  }

  function handleImport() {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        readConfigFile(file)
      }
    }
    input.click()
  }

  function handleSaveOption() {
    chrome.storage.sync.set({ 
      email: form.email,
      apiKey: form.apiKey,
      baseURL: form.baseURL,
      sprintStartWord: form.sprintStartWord,
      boards: form.boards,
    }, () => {
      setSuccessTexts((successText) => [...successText, "Options saved"])
    })
    chrome.runtime.sendMessage({ event: "options-saved" })
  }

  function handleClearOption() {
    chrome.storage.sync.clear(() => {
      setSuccessTexts((successText) => [...successText, "Options cleared"])
    })
    chrome.runtime.sendMessage({ event: "options-cleared" })
    setForm(initialNewForm())
  }

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) {
      return
    }

    const newBoards = reorder(
      form.boards,
      result.source.index,
      result.destination.index
    )

    console.log(newBoards)
    setForm((form) => ({ ...form, boards: newBoards }))
  }, [form.boards])

  useEffect(() => {
    chrome.storage.sync.get(STORAGE_KEYS, (result) => {
      result.boards = result.boards,
      setForm(Object.assign({}, initialNewForm(), result))
    })
  }, [])

  return (
    <Box p={2}>
      <Grid container gap={4} justifyContent="end">
        <Typography variant="h4" width="100%">Configuration</Typography>
        <TextField
          label="Jira base URL"
          value={form.baseURL}
          required
          onChange={(e) => setForm((form) => ({
            ...form,
            baseURL: e.target.value
          }))}
          fullWidth
        />
        <TextField
          label="Jira account email"
          value={form.email}
          required
          onChange={(e) => setForm((form) => ({ ...form, email: e.target.value }))}
          fullWidth
        />
        <TextField
          label="Jira API key"
          type={showPassword ? "text" : "password"}
          value={form.apiKey}
          onChange={(e) => setForm((form) => ({ ...form, apiKey: e.target.value }))}
          fullWidth
          required
          helperText={
            <Link href="https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/" target="_blank" rel="noopener noreferrer">
              How to generate API token
            </Link>
          }
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

        <TextField
          label="Sprint start word"
          value={form.sprintStartWord}
          onChange={(e) => setForm((form) => ({ ...form, sprintStartWord: e.target.value }))}
          fullWidth
        />

        <Grid container item xs={12} gap={2} alignItems="center">
          <Typography variant="h5" width="100%" mb={2}>Jira Boards</Typography>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided, snapshot) => (
                <Box
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{ opacity: snapshot.isDraggingOver ? 0.5 : 1 }}
                >
                  {form.boards.map((board, index) => (
                    <Draggable key={board._id} draggableId={board._id} index={index}>
                      {(provided, snapshot) => (
                        <Grid 
                          ref={provided.innerRef}
                          container
                          item
                          xs={12}
                          alignItems="center"
                          {...provided.draggableProps}
                          style={provided.draggableProps.style}
                        >
                          <Grid item xs={1}>
                            <IconButton sx={{ cursor: "grab" }} {...provided.dragHandleProps}>
                              <DragIndicator />
                            </IconButton>
                          </Grid>
                          <Grid item xs={11}>
                            <BoardItem
                              index={index}
                              form={form}
                              setForm={setForm}
                              addBoardConfig={addBoardConfig}
                            />
                          </Grid>
                        </Grid>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </DragDropContext>
        </Grid>
        
        <IconButton
          color="primary"
          onClick={handleSaveOption}
        >
          <Save />
        </IconButton>
        <IconButton
          color="success"
          onClick={() => setIsDialogOpen(true)}
        >
          <Download />
        </IconButton>
        <IconButton
          color="secondary"
          onClick={handleImport}
        >
          <Upload />
        </IconButton>
        <IconButton
          color="error"
          onClick={handleClearOption}
        >
          <Delete />
        </IconButton>
      </Grid>

      {successTexts.map((successText, index) => (
        <Alert key={successText} severity="success" sx={{ position: "fixed", top: `${1 + (index * 4)}rem`, right: "1rem" }}>
          <AlertTitle>{successText}</AlertTitle>
        </Alert>
      ))}

      <DownloadDialog
        open={isDialogOpen}
        handleClose={() => setIsDialogOpen(false)}
        handleConfirm={handleExport}
      />
    </Box>
  )
}

export default Options
