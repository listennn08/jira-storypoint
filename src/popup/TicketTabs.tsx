import { memo, useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { TreeView, TreeItem } from "@mui/x-tree-view";
import TreeLabel from "./TreeLabel";

interface TicketTabsProps {
  tickets: Record<string, any[]>;
}
const TicketTabs = (props: TicketTabsProps) => {
  const { tickets } = props;
  const [sprint, setSprint] = useState(0);

  function a11yProps(index: number) {
    return {
      id: `tab-${index}`,
      "aria-controls": `tabpanel-${index}`,
    };
  };

  function handleChange(event: React.SyntheticEvent, newValue: number) {
    setSprint(newValue);
  };

  return (
    <>
      <Box minWidth={800}>
        <Tabs value={sprint} variant="scrollable" scrollButtons="auto" onChange={handleChange}>
          {Object.keys(tickets).map((sprintName, index) => (
            <Tab label={sprintName} key={sprintName} {...a11yProps(index)} />
          ))}
        </Tabs>
      </Box>
      {Object.keys(tickets).map((sprintName, index) => (
        <div  
          role="tabpanel"
          key={`tabpanel-${index}`}
          hidden={sprint !== index}
          id={`tabpanel-${index}`}
          aria-labelledby={`tab-${index}`}
        >
          {sprint === index && (
            <Box sx={{ py: 1 }}>
              <TreeView
                defaultExpanded={
                  tickets[sprintName]
                    .map((ticket: any, index: number) => {
                      if (ticket.subtasks) {
                        return index.toString();
                      }
                    })
                    .filter((el: any) => el !== undefined) as string[]
                }
              >
                {tickets[sprintName].map((ticket: any, index: number) => (
                  <TreeItem label={<TreeLabel ticket={ticket} key={`label-${index}`} />} key={index} nodeId={`${index}`}>
                    {ticket.subtasks?.map((subtask: any, subIndex: number) => (
                      <TreeItem label={<TreeLabel ticket={subtask} key={`label-${index}${subIndex}`} />} key={`${index}${subIndex}`} nodeId={`${index}${subIndex}`} />
                    ))}
                  </TreeItem>
                ))}
              </TreeView>
            </Box>
          )}
        </div>
      ))}
    </>
  );
};

export default memo(TicketTabs);