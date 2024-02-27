import { useState, useEffect } from 'react'

import './Popup.css'


// const port = chrome.runtime.connect({ name: "content-script" });
export const Popup = () => {
  const [tickets, setTickets] = useState({})

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      let tabId = tabs[0].id;

      console.log('tabId', tabId)
      chrome.tabs.sendMessage(tabId, {event: 'popup-ready'}, (response) => {
        setTickets(response.sprintObj)
      })
    })
  }, [])

  return (
    <main>
      {Object.keys(tickets).map((sprintName) => {
        return (
          <>
            {sprintName}
          </>
        )
      })}
    </main>
  )
}

export default Popup
