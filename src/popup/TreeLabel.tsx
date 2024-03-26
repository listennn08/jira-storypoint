import { Avatar, Box, Chip, Link, Typography } from "@mui/material";
import { Ref, forwardRef, memo, useEffect, useState } from "react";
import { STORAGE_KEYS } from "../constants";

const colorMap: Record<string, "default" | "success" | "warning" | "info"> = {
  "Done": "default",
  "In Development": "success",
  "In Testing": "warning",
  "To Do": "info",
}

const TreeLabel = forwardRef((
  props: { ticket: any },
  ref: Ref<HTMLLIElement>
) => {
  const { ticket } = props;
  const [baseURL, setBaseURL] = useState("");
  useEffect(() => {
    chrome.storage.sync.get(STORAGE_KEYS, (result) => {
      setBaseURL(result.baseURL);
    });
  }, [])

  return (
    <Box ref={ref} sx={{ p: 0.5, display: "flex", justifyContent: "space-between", gap: 1 }}>
      <Box sx={{ display: "flex", gap: 0.5 }}>
        <Avatar src={ticket.iconUrl} variant="square" sx={{ width: 20, height: 20 }} />
        <Box sx={{ display: "flex", alignItems: "start", gap: 1 }}>
          <Typography variant="body2" color={"GrayText"} sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
              <Link
                href={`${baseURL}/browse/${ticket.key}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {ticket.key}
              </Link>
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>{ticket.summary}</Typography>
        </Box>
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "30px 100px 100px" , gap: 0.5 }}>
        <Chip label={ticket.story_point || 0} variant="outlined" size="small" sx={{ fontSize: "10px" }} />
        <Chip label={ticket.status} color={colorMap[ticket.status] || "default"} size="small" sx={{ fontSize: "10px" }} />
        {ticket.assignee && <Chip label={ticket.assignee} color="default" size="small" sx={{ fontSize: "10px" }} />}
      </Box>
    </Box>
  )
})

export default memo(TreeLabel);