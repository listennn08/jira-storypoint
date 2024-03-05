import { useEffect, useState } from "react";
import { Buffer } from "buffer";
import { orderKeyBySprint } from "../utils";

interface Sprint {
  createdDate: string;
  endDate: string;
  goal: string;
  id: number;
  name: string;
  originBoardId: number;
  self: string;
  startDate: string;
  state: "future" | "active" | "closed";
}

const boardMap: Record<string, string> = {
  "23": "CloudBar",
  "24": "DrinkBot",
  "25": "DevOps",
  "31": "Firmware DBP"
}

function groupByAssignee(sprintObj: Record<string, any>) {
  const assigneeStoryPointsBySprint: Record<string, any> = {};
  for (const sprint in sprintObj) {
    const tickets = sprintObj[sprint];

    for (const ticket of tickets) {
      if (!ticket.assignee || ticket.status === "Done" || ticket.status === "Blocked") {
        continue;
      }
      if (!assigneeStoryPointsBySprint[ticket.assignee]) {
        assigneeStoryPointsBySprint[ticket.assignee] = {};
      }
      if (!assigneeStoryPointsBySprint[ticket.assignee][sprint]) {
        assigneeStoryPointsBySprint[ticket.assignee][sprint] = 0;
      }
      assigneeStoryPointsBySprint[ticket.assignee][sprint] += ticket.story_point || 0;
    }
  }
  return assigneeStoryPointsBySprint;
}

function sortTickets(a: any, b: any) {
  const typeOrder = ["Story", "Task", "Bug", "Operation"];
  if (a.type === b.type) {
    return a.key.split("-")[1] - b.key.split("-")[1];
  }
  return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
}

export default function useFetchData() {
  const [email, setEmail] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [baseURL, setBaseURL] = useState('')
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Record<string, any>>({});
  const [groupByAssigneeObj, setGroupByAssigneeObj] = useState<Record<string, any>>({});
  const [tableHeaders, setTableHeaders] = useState([] as any[]);
  const [error, setError] = useState('');
  const [boardMap, setBoardMap] = useState({});

  async function request(url: string) {
    return fetch(`${baseURL}${url}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${email}:${apiKey}`).toString(
          "base64"
        )}`,
      },
    }).then((resp) => resp.json());
  }

  async function getSprintData() {
    console.log("Fetching data...")
    setLoading(true);
  
    let sprintObj: Record<string, any> = {};

    try {
      await Promise.all(Object.keys(boardMap).map(async (boardId) => {
        const resp = await request(`/rest/agile/1.0/board/${boardId}/sprint`);
        const sprints = (await resp).values.filter((sprint: Sprint) =>
          sprint.state === "active" || sprint.state === "future");
        
        const allTickets = await Promise.all(sprints.map(async (sprint: Sprint) => {
          return request(`/rest/agile/1.0/board/${boardId}/sprint/${sprint.id}/issue`)
            .then((resp) => resp.issues)
        }))
    
        for (let i = 0; i < sprints.length; i++) {
          const sprint = sprints[i];
          const tickets = allTickets[i];
          const subTasks = tickets.filter((ticket: any) => ticket.fields.issuetype.name === "Sub-task");
          sprintObj[sprint.name] = (sprintObj[sprint.name] || []).concat(tickets
            .filter((ticket: any) => ticket.fields.issuetype.name !== "Sub-task")
            .map((ticket: any) => {
              return {
                key: ticket.key,
                iconUrl: ticket.fields.issuetype.iconUrl,
                type: ticket.fields.issuetype.name,
                summary: ticket.fields.summary,
                status: ticket.fields.status.name,
                assignee: ticket.fields.assignee?.displayName,
                created: ticket.fields.created,
                updated: ticket.fields.updated,
                sprint: sprint.name,
                story_point: ticket.fields.customfield_10076,
                subtasks: ticket.fields.subtasks.map((subtask: any) => {
                  const taskInfo = subTasks.find((subtask: any) => subtask.key === subtask.key);
                  return {
                    key: subtask.key,
                    iconUrl: subtask.fields.issuetype.iconUrl,
                    type: subtask.fields.issuetype.name,
                    summary: subtask.fields.summary,
                    status: subtask.fields.status.name,
                    assignee: taskInfo.fields.assignee?.displayName,
                    created: taskInfo.fields.created,
                    updated: taskInfo.fields.updated,
                    sprint: sprint.name,
                    story_point: taskInfo.fields.customfield_10076,
                  }
                }).sort(sortTickets)
              }
            })
            .sort(sortTickets)
          );
        }
      }));
    
      setTickets(orderKeyBySprint(sprintObj));
      setGroupByAssigneeObj(groupByAssignee(sprintObj));
      setTableHeaders(Object.keys(sprintObj).sort((a, b) => {
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
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    chrome.storage.sync.get(['email', 'apiKey', 'baseURL', 'boards'], (result) => {
      if (!result.baseURL || !result.email || !result.apiKey) {
        chrome.runtime.openOptionsPage();
        setError("Please set your Jira credentials")
        return;
      }
      setEmail(result.email)
      setApiKey(result.apiKey)
      setBaseURL(result.baseURL)
      setBoardMap(result.boards.reduce((acc: any, board: any) => {
        acc[board.id] = board.name;
        return acc;
      }, {}));
    })

    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.event === "options-saved") {
        chrome.storage.sync.get(['baseURL', 'email', 'apiKey'], (result) => {
          setEmail(result.email)
          setApiKey(result.apiKey)
          setBaseURL(result.baseURL)
        })
      }
      if (msg.event === "options-cleared") {
        setEmail('')
        setApiKey('')
        setBaseURL('')
      }
    })
  }, [])

  useEffect(() => {
    if (email && apiKey && baseURL) {
      getSprintData()
    }
  }, [email, apiKey, baseURL])

  return {
    email,
    setEmail,
    apiKey,
    setApiKey,
    baseURL,
    setBaseURL,
    loading,
    tickets,
    error,
    groupByAssigneeObj,
    getSprintData,
    tableHeaders,
  }
}