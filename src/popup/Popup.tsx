import { useState, useEffect } from 'react';
import { Box, BottomNavigation, BottomNavigationAction, Paper, CircularProgress, Typography, } from '@mui/material';
import FeedIcon from '@mui/icons-material/Feed';
import PersonIcon from '@mui/icons-material/Person';

import useFetchData from './hook';
import TicketTabs from './TicketTabs';
import StoryPointTable from './StoryPointTable';

import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

export const Popup = () => {
  const {
    tickets,
    loading,
    error,
    groupByAssigneeObj,
    tableHeaders,
  } = useFetchData();
  const [activeBlock, setActiveBlock] = useState(0);

  let content = undefined;

  if (loading) {
    content = (
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
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
      <Box sx={{ mb: 6 }}>
        {content || (
          <>
            {activeBlock === 0 && (<TicketTabs tickets={tickets} />)}
            {activeBlock === 1 && (<StoryPointTable groupByAssigneeObj={groupByAssigneeObj} tableHeaders={tableHeaders} />)}
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
          <BottomNavigationAction label="Tickets" icon={<FeedIcon />} />
          <BottomNavigationAction label="Story Point" icon={<PersonIcon />} />
        </BottomNavigation>
      </Paper>
    </main>
  )
}

export default Popup
