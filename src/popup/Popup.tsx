import { useState, useEffect } from 'react';
import { Box, BottomNavigation, BottomNavigationAction, Paper, CircularProgress, Typography, } from '@mui/material';
import FeedIcon from '@mui/icons-material/Feed';
import PersonIcon from '@mui/icons-material/Person';

import { orderKeyBySprint } from '../utils';
import TicketTabs from './TicketTabs';
import StoryPointTable from './StoryPointTable';

import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const port = chrome.runtime.connect({ name: 'popup' });

export const Popup = () => {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Record<string, any>>({});
  const [activeBlock, setActiveBlock] = useState(0);
  const [groupByAssigneeObj, setGroupByAssigneeObj] = useState<Record<string, any>>({});
  const [tableHeaders, setTableHeaders] = useState([] as any[]);
  const [error, setError] = useState('');

  function messageListener(data: any) {
    if (!data) return;
    if (data.loading) {
      setLoading(true);
      return;
    } else {
      setLoading(false);
    }
    if (data.error) {
      setError(data.error);
      return;
    }

    setTickets(orderKeyBySprint(data.sprintObj));
    setGroupByAssigneeObj(data.groupByAssigneeObj);
    setTableHeaders(Object.keys(data.sprintObj).sort((a, b) => {
      const springItemOrder = ['CDB', 'DBP', 'FWP', 'DevOps']
      if (a.includes('Backlog')) return 1;
      if (b.includes('Backlog')) return -1;
      const [aBoard, , aSprint] = a.split(' ');
      const [bBoard, , bSprint] = b.split(' ');
      if (aBoard !== bBoard) {
        return springItemOrder.indexOf(aBoard) - springItemOrder.indexOf(bBoard);
      }
      const aSpringNumber = Number(aSprint.replace('R', ''))
      const bSpringNumber = Number(bSprint.replace('R', ''))
      return aSpringNumber - bSpringNumber;
    }));
  }



  useEffect(() => {
    port.postMessage({ event: 'popup-ready' });
    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      port.onMessage.removeListener(messageListener);
      chrome.runtime.onMessage.removeListener(messageListener);
    }
  }, []);

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
