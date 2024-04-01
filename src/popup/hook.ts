import { useEffect, useMemo, useState } from "react";
import { Buffer } from "buffer";
import { from, mergeMap, reduce } from "rxjs";
import _, { set } from "lodash";
import { orderKeyBySprint, groupByAssignee } from "../utils";
import { STORAGE_KEYS } from "../constants";

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

const CACHE_TIME = 1000 * 60 * 5; // 5 minutes

function sortTickets(a: any, b: any) {
  const typeOrder = ["Story", "Task", "Bug", "Operation"];
  if (a.type === b.type) {
    return a.key.split("-")[1] - b.key.split("-")[1];
  }
  return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
}

export default function useFetchData() {
  const [email, setEmail] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [baseURL, setBaseURL] = useState('');
  const [springStartWord, setSpringStartWord] = useState('');
  const [boardMap, setBoardMap] = useState<Record<string, string>>({});
  const [sprintIdMap, setSprintIdMap] = useState<Record<string, number>>({});

  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('Fetching data...');
  const [error, setError] = useState('');

  const [filter, setFilter] = useState<{
    user: string[];
    board: string[];
    sprint: string[];
  }>({
    user: [],
    board: [],
    sprint: [],
  });

  const [boards, setBoards] = useState<{
    sprints: Sprint[];
    boardId: string;
    boardName: string;
  }[]>([]);

  const [tickets, setTickets] = useState<Record<string, any>>({});
  const filteredTickets = useMemo(() => {
    return Object.keys(tickets).reduce((acc: Record<string, any>, key: string) => {
      if (filter.sprint.length && !filter.sprint.includes(key)) {
        return acc;
      }
      if (filter.board.length && !filter.board.some((board) => tickets[key].boardTitle.includes(board))) {
        return acc;
      }

      acc[key] = {
        ...tickets[key],
        issues: tickets[key].issues.filter((ticket: any) => {
          if (filter.user.length && !filter.user.includes(ticket.assignee)) {
            return false;
          }
          return true;
        })
      }
      return acc;
    }, {});
  }, [tickets, filter]);

  const userOptions = useMemo(() => _.keys(groupByAssignee(filteredTickets)), [filteredTickets]);
  const boardOptions = useMemo(() => Object.keys(boardMap), [boardMap]); 
  const sprintOptions = useMemo(() => Object.keys(filteredTickets), [filteredTickets]);

  async function request(url: string) {
    const params = new URLSearchParams({ maxResults: "1000" });
    return fetch(`${baseURL}${url}?${params.toString()}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${email}:${apiKey}`).toString(
          "base64"
        )}`,
      },
    }).then((resp) => resp.json());
  }

  async function getBoardData() {
    const boards = await Promise.all(
      Object.keys(boardMap).map(async (boardId) => 
        request(`/rest/agile/1.0/board/${boardId}/sprint`)
          .then((resp) => ({
            sprints: resp.values.filter((sprint: Sprint) => sprint.state === "active" || sprint.state === "future"),
            boardId,
            boardName: boardMap[boardId],
          }))
      )
    );

    setBoards(boards);
    return boards;
  }

  async function fetchSprintData(boardId: string, sprintId: number) {
    return request(`/rest/agile/1.0/board/${boardId}/sprint/${sprintId}/issue`)
      .then((resp) => resp.issues);
  }

  async function getSprintData(board: any) {
    setLoadingText(`Fetching data for ${board.boardName}...`);
    const { boardId, sprints } = board;

    return {
      boardId,
      sprints: await Promise.all(
        sprints.map(async (sprint: Sprint) => {
          setSprintIdMap((sprintIdMap) => {
            sprintIdMap[sprint.name] = sprint.id;
            return sprintIdMap;
          });
          return {
          ...sprint,
          issues: await fetchSprintData(boardId, sprint.id)
          }
        })
      ),
    };
  }

  function processTickets(tickets: any, originalTickets?: any[], flag: boolean = false) {
    return tickets.map((ticket: any) => {
      let subtasks = undefined

      if (ticket.fields.subtasks?.length) {
        subtasks = processTickets(ticket.fields.subtasks, tickets, true).sort(sortTickets);
      }

      if (flag) {
        ticket = originalTickets?.find((t: any) => t.key === ticket.key);
      }

      return _.omitBy({
        key: ticket.key,
        iconUrl: ticket.fields.issuetype.iconUrl,
        type: ticket.fields.issuetype.name,
        summary: ticket.fields.summary,
        status: ticket.fields.status.name,
        assignee: ticket.fields.assignee?.displayName,
        created: ticket.fields.created,
        updated: ticket.fields.updated,
        story_point: ticket.fields.customfield_10076,
        subtasks,
      }, _.isUndefined);
    })
  }

  async function processSpringData(board: { boardId: number, sprints: any[] }) {
    setLoadingText(`Processing data for <b>${boardMap[board.boardId]}</b>...`);
    return board.sprints.map((sprint: any) => {
      const tickets = processTickets(sprint.issues)
        .filter((ticket: any) => ticket.type !== "Sub-task")
        .sort(sortTickets)

      return {
        sprint: sprint.name,
        boardTitle: boardMap[board.boardId],
        issues: tickets,
      }
    })
  }

  async function fetchData() {
    setLoadingText("Fetching data...")
    setLoading(true);

    let sprintObj: Record<string, any> = {};
    const boards = await getBoardData();
    const $subscriber = from(boards).pipe(
      mergeMap(getSprintData),
      mergeMap(processSpringData),
      mergeMap((data) => from(data)),
      reduce((acc: any, result: any) => {
        const key = result.sprint
        acc[key] = {
          boardTitle: (acc[key]?.boardTitle || []).concat([result.boardTitle]),
          issues: (acc[key]?.issues || []).concat(result.issues),
        };

        return acc;
      }, {}),
    );

    $subscriber.subscribe({
      next: (data) => {
        sprintObj = data;
      },
      complete: () => {
        const sortedSpringObject = orderKeyBySprint(sprintObj, Object.values(boardMap), springStartWord);
        
        console.log(sprintIdMap)
        setTickets(sortedSpringObject);
        setLoading(false);
        chrome.storage.local.set({
          tickets: sortedSpringObject,
          ttl: Date.now() + CACHE_TIME,
        });
      },
      error: (e) => {
        setError(e.message);
        console.error(e);
      }
    })
  }

  function setConfigs() {
    chrome.storage.sync.get(STORAGE_KEYS, (result) => {
      if (!result.baseURL || !result.email || !result.apiKey) {
        setError("Please set your Jira credentials");
        chrome.runtime.openOptionsPage();
        return;
      }

      setEmail(result.email);
      setApiKey(result.apiKey);
      setBaseURL(result.baseURL);
      setBoardMap(result.boards.reduce((acc: any, board: any) => {
        acc[board.id] = board.name;
        return acc;
      }, {}));
      setSpringStartWord(result.sprintStartWord);
    })
  }

  useEffect(() => {
    setConfigs();

    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.event === "options-saved") {
        setConfigs();
      }
      if (msg.event === "options-cleared") {
        setEmail('');
        setApiKey('');
        setBaseURL('');
      }
    })
  }, [])

  useEffect(() => {
    if (email && apiKey && baseURL) {
      chrome.storage.local.get(["tickets", "ttl"], (result) => {
        if (result.tickets && result.ttl > Date.now()) {
          setTickets(result.tickets);
          setLoading(false);
          return
        }
        fetchData()
      });
    }
  }, [email, apiKey, baseURL])

  return {
    email,
    apiKey,
    baseURL,
    loading,
    tickets,
    error,
    boardMap,
    userOptions,
    sprintOptions,
    boardOptions,
    filteredTickets,
    loadingText,
    filter,
    setEmail,
    setApiKey,
    setBaseURL,
    fetchData,
    setFilter,
  }
}