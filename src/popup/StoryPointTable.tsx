import { memo, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface StoryPointTableProps {
  groupByAssigneeObj: Record<string, Record<string, number>>;
  tableHeaders: string[];
}

interface StoryPointTableData {
  [key: string]: string | number;
  assignee: string;
}

const StoryPointTable: React.FC<StoryPointTableProps> = ({ groupByAssigneeObj, tableHeaders }) => {
  const [tableData, setTableData] = useState<StoryPointTableData[]>([]);

  useEffect(() => {
    const data = Object.keys(groupByAssigneeObj).map((user: string) => {
      const row: StoryPointTableData = { assignee: user, id: user };
      tableHeaders.forEach((sprintName) => {
        row[sprintName] = groupByAssigneeObj[user][sprintName] || 0;
      });
      return row;
    });
    setTableData(data);
  }, [])

  return (
    <Box width="800px" height="600px">
      <DataGrid 
        columns={[
          { field: 'assignee', headerName: 'Assignee', width: 100 },
          ...tableHeaders.map((header) => ({ field: header, headerName: header, width: 120 })),
        ]}
        rows={tableData}
        hideFooter
        initialState={{
          sorting: {
            sortModel: [{ field: 'assignee', sort: 'asc' }],
          }
        }}
      />
    </Box>
  )
};

export default memo(StoryPointTable);