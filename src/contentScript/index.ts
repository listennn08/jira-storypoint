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

const port = chrome.runtime.connect({ name: "content-script" });
let sprintObj: Record<string, any> = {};

async function main() {
  console.log('run...')
  const resp = await fetch("/rest/agile/1.0/board/23/sprint");
  const sprints = (await resp.json()).values.filter((sprint: Sprint) =>
    sprint.state === "active" || sprint.state === "future");
  
  const allTickets = await Promise.all(sprints.map(async (sprint: Sprint) => {
    return fetch(`/rest/agile/1.0/board/23/sprint/${sprint.id}/issue`)
      .then((resp) => resp.json())
      .then((resp) => resp.issues)
  }))

  for (let i = 0; i < sprints.length; i++) {
    const sprint = sprints[i];
    const tickets = allTickets[i];
    sprintObj[sprint.name] = tickets
      .filter((ticket: any) => ticket.fields.issuetype.name !== "Sub-task")
      .map((ticket: any) => {
        return {
          key: ticket.key,
          iconUrl: ticket.fields.issuetype.iconUrl,
          summary: ticket.fields.summary,
          status: ticket.fields.status.name,
          assignee: ticket.fields.assignee?.displayName,
          created: ticket.fields.created,
          updated: ticket.fields.updated,
          sprint: sprint.name,
          storypoint: ticket.fields.customfield_10076,
          subtasks: ticket.fields.subtasks.map((subtask: any) => {
            return {
              key: subtask.key,
              iconUrl: subtask.fields.issuetype.iconUrl,
              summary: subtask.fields.summary,
              status: subtask.fields.status.name,
              assignee: subtask.fields.assignee?.displayName,
              created: subtask.fields.created,
              updated: subtask.fields.updated,
              storypoint: subtask.fields.customfield_10076,
            }
          })
        }
    });
  }

  // port.postMessage({ sprintObj });
}

main();


chrome.runtime.onMessage.addListener((req, sender, sendResp) => {
  if (req.event && req.event === 'popup-ready') {
    sendResp({ sprintObj });
  }
});