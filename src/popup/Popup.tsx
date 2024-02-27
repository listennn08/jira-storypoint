import { Box, Tabs, Tab } from '@mui/material';
import { TreeView, TreeItem } from '@mui/x-tree-view';
import { useState, useEffect } from 'react';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import './Popup.css'

export const Popup = () => {
  const [sprint, setSprint] = useState(0);
  const [tickets, setTickets] = useState({});

  function a11yProps(index: number) {
    return {
      id: `tab-${index}`,
      'aria-controls': `tabpanel-${index}`,
    };
  }

  function handleChange(event: React.SyntheticEvent, newValue: number) {
    setSprint(newValue);
  };


  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      let tabId = tabs[0].id;

      chrome.tabs.sendMessage(tabId, {event: 'popup-ready'}, (response) => {
        setTickets(response.sprintObj);
      });
    });
  }, []);

  return (
    <main>
      <Box>
        <Tabs value={sprint} onChange={handleChange}>
          {Object.keys(tickets).map((sprintName, index) => (
            <Tab label={sprintName} key={index} {...a11yProps(index)} />
          ))}
        </Tabs>
      </Box>
      {Object.keys(tickets).map((sprintName, index) => {
          return (
            <div  
              role="tabpanel"
              hidden={sprint !== index}
              id={`tabpanel-${index}`}
              aria-labelledby={`tab-${index}`}
            >
              {sprint === index && <Box>
                <h1>{sprintName}</h1>
                <TreeView>
                  {tickets[sprintName].map((ticket, index) => (
                    <TreeItem label={`(${ticket.storypoint}) ${ticket.summary} ${ticket.assignee}`} key={index} nodeId={index}>
                    {ticket.subtasks?.map((subtask, subIndex) => (
                      <TreeItem label={subtask.summary} key={subIndex} nodeId={index + subIndex} />
                    ))}
                    </TreeItem>
                  ))}
                </TreeView>
                {/* <ul>
                  {tickets[sprintName].map((ticket, index) => (
                    <li key={index}>{ticket.summary}</li>
                  ))}
                </ul> */}
              </Box>}
            </div>
          )
        })}
    </main>
  )
}

export default Popup
