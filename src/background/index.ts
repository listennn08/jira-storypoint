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

let baseURL: string
let email: string
let apiKey: string
let sprintObj: Record<string, any> = {};
let groupByAssigneeObj: Record<string, any> = {};

const boardMap: Record<string, string> = {
  "23": "CloudBar",
  "24": "DrinkBot",
  "25": "DevOps",
  "31": "Firmware DBP"
}

async function request(url: string) {
  return fetch(`${baseURL}${url}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${email}:${apiKey}`).toString(
        "base64"
      )}`,
    },
  }).then((resp) => resp.json());
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
  groupByAssigneeObj = assigneeStoryPointsBySprint;
}

function sortTickets(a: any, b: any) {
  const typeOrder = ["Story", "Task", "Bug", "Operation"];
  if (a.type === b.type) {
    return a.key.split("-")[1] - b.key.split("-")[1];
  }
  return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
}

async function main() {
  if (!baseURL || !email || !apiKey) {
    chrome.runtime.openOptionsPage();
    chrome.runtime.sendMessage({ error: "Please set your Jira credentials" });
    return;
  }
  console.log("Fetching data...")
  chrome.runtime.sendMessage({ loading: true });

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

  orderKeyBySprint(sprintObj);
  groupByAssignee(sprintObj);

  chrome.runtime.sendMessage({ sprintObj, groupByAssigneeObj });
}

chrome.storage.sync.get(['baseURL', 'email', 'apiKey'], (result) => {
  if (!result.baseURL || !result.email || !result.apiKey) {
    chrome.runtime.openOptionsPage();
    return;
  }

  baseURL = result.baseURL;
  email = result.email;
  apiKey = result.apiKey;
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.event === "options-saved") {
    chrome.storage.sync.get(['baseURL', 'email', 'apiKey'], (result) => {
      baseURL = result.baseURL;
      email = result.email;
      apiKey = result.apiKey;
    });
  }
  if (msg.event === "options-cleared") {
    baseURL = "";
    email = "";
    apiKey = "";
  }
});

chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener((msg) => {
    if (msg.event === "popup-ready") {
      main();
    }
  });
});