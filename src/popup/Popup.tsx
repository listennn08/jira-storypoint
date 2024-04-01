import { useState } from 'react';
import { Box, BottomNavigation, BottomNavigationAction, Paper, CircularProgress, Typography, Select, MenuItem, FormControl, InputLabel, Button, IconButton, } from '@mui/material';
import FeedIcon from '@mui/icons-material/Feed';
import PersonIcon from '@mui/icons-material/Person';

import useFetchData from './hook';
import TicketTabs from './TicketTabs';
import StoryPointTable from './StoryPointTable';

import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { Refresh } from '@mui/icons-material';

export const Popup = () => {
  const {
    boardMap,
    loading,
    error,
    userOptions,
    sprintOptions,
    filteredTickets,
    filter,
    loadingText,
    setFilter,
    fetchData,
  } = useFetchData();
  const [activeBlock, setActiveBlock] = useState(0);

  let content = undefined;

  if (loading) {
    content = (
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
        <div dangerouslySetInnerHTML={{ __html: loadingText }} />
      </Box>
    );
  }

  if (error) {
    content = (
      <Typography variant="h6" textAlign="center" component="div" width={'100%'} p={2} color="error">
        {error}
      </Typography>
    );
  }

  return (
    <main>
      <Box sx={{ mb: 6, p: 2, minHeight: 'calc(100vh - 56px)' }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControl sx={{ width: '200px' }}>
            <InputLabel id="board-select">Filter Board</InputLabel>
            <Select 
              id="board-select"
              label="Filter Board"
              multiple
              value={filter.board}
              onChange={({ target: { value } }) => setFilter((filter) => ({ 
                ...filter,
                board: typeof value === 'string' ? value.split(',') : value 
              }))}
            >
              {boardMap && Object.keys(boardMap).map((key) => (
                <MenuItem value={boardMap[key]} key={key}>{boardMap[key]}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ width: '200px' }}>
            <InputLabel id="user-select">Filter User</InputLabel>
            <Select
              id="user-select"
              label="Filter User"
              multiple
              value={filter.user}
              onChange={({ target: { value } }) => setFilter((filter) => ({ 
                ...filter,
                user: typeof value === 'string' ? value.split(',') : value 
              }))}
            >
              {userOptions && userOptions.map((user) => (
                <MenuItem value={user} key={user}>{user}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ width: '200px' }}>
            <InputLabel id="sprint-select">Filter Spring</InputLabel>
            <Select 
              id="sprint-select"
              label="Filter Spring"
              multiple
              value={filter.sprint}
              onChange={({ target: { value } }) => setFilter((filter) => ({ 
                ...filter,
                sprint: typeof value === 'string' ? value.split(',') : value 
              }))}
            >
              {sprintOptions && sprintOptions.map((spring) => (
                <MenuItem value={spring} key={spring}>{spring}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <IconButton
            sx={{ ml: 'auto' }}
            color="primary"
            onClick={fetchData}
          >
            <Refresh />
          </IconButton>
        </Box>

        {content || (
          <>
            {activeBlock === 0 && (<StoryPointTable tickets={filteredTickets} />)}
            {activeBlock === 1 && (<TicketTabs tickets={filteredTickets} />)}
          </>
        )}
      </Box>
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}>
        <BottomNavigation
          showLabels
          value={activeBlock}
          onChange={(event, newValue) => {
            setActiveBlock(newValue);
          }}
        >
          <BottomNavigationAction label="Story Point" icon={<PersonIcon />} />
          <BottomNavigationAction label="Tickets" icon={<FeedIcon />} />
        </BottomNavigation>
      </Paper>
    </main>
  )
}

export default Popup
