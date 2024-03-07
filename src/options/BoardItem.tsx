import { memo } from "react";
import { Grid, IconButton, TextField } from "@mui/material";
import { Add, Remove } from "@mui/icons-material";

interface BoardItemProps {
  index: number
  form: {
    boards: {
      id: string
      key: string
      name: string
      _id: string
    }[]
  }
  setForm: React.Dispatch<React.SetStateAction<{
    email: string;
    apiKey: string;
    baseURL: string;
    sprintStartWord: string;
    boards: {
      id: string;
      name: string;
      key: string;
      _id: string;
    }[];
  }>>,
  addBoardConfig: () => void
}

const BoardItem: React.FC<BoardItemProps> = ({
  index,
  form,
  setForm,
  addBoardConfig,
}) => {
  const board = form.boards[index];

  return (
    <Grid
      container
      item
      xs={12}
      gap={2}
      py={1}
      alignItems="center"
    >
      <Grid item xs={2}>
        <TextField
          key={`board-id-${index}`}
          label="Board ID"
          value={board.id}
          fullWidth
          required={index === 0}
          onChange={(e) => {
            const newBoards = [...form.boards]
            newBoards[index].id = e.target.value
            setForm((form) => ({ ...form, board: newBoards }))
          }}
        />
      </Grid>
      <Grid item xs={2}>
        <TextField
          label="Board Key"
          value={board.key}
          fullWidth
          required={index === 0}
          onChange={(e) => {
            const newBoards = [...form.boards]
            newBoards[index].key = e.target.value
            setForm((form) => ({ ...form, board: newBoards }))
          }}
        />
      </Grid>
      <Grid item xs={5}>
        <TextField
          key={`board-name-${index}`}
          label="Board Name"
          value={board.name}
          fullWidth
          required={index === 0}
          onChange={(e) => {
            const boards = [...form.boards]
            boards[index].name = e.target.value
            setForm((form) => ({ ...form, boards }))
          }}
        />
      </Grid>
      {!!index && (
        <Grid key={`delete-board-${index}`}>
          <IconButton 
            color="error"
            onClick={() => {
              const boards = [...form.boards]
              boards.splice(index, 1)
              setForm((form) => ({ ...form, boards }))
            }}
          >
            <Remove />
          </IconButton>
        </Grid>
      )}
      {index === form.boards.length - 1 && (
        <Grid item xs={1}>
          <IconButton
            color="primary"
            onClick={addBoardConfig}
          >
            <Add />
          </IconButton>
        </Grid>
      )}
    </Grid>
  )
}

export default memo(BoardItem);