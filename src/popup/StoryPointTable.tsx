import { memo } from 'react'
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'

const StoryPointTable = (
  { groupByAssigneeObj, tableHeaders }: { groupByAssigneeObj: Record<string, Record<string, number>>, tableHeaders: string[] }
) => {
  return (
    <Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Assignee</TableCell>
              {tableHeaders.map((sprintName) => (
                <TableCell key={`table-header-${sprintName}`} align="right">{sprintName}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(groupByAssigneeObj).map((user: string) => (
              <TableRow key={`row-${user}`}>
                <TableCell component="th" scope="row">{user}</TableCell>
                {tableHeaders.map((sprintName) => (
                  <TableCell key={`table-cell-${user}-${sprintName}`} align="right">{groupByAssigneeObj[user][sprintName] || 0}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default memo(StoryPointTable)