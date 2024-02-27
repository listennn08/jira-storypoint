console.log('background is running')

chrome.runtime.onMessage.addListener((request) => {
  if (request.type === 'COUNT') {
    console.log('background has received a message from popup, and count is ', request?.count)
  }
})

chrome.runtime.onConnect.addListener((port) => {
  console.log('background has received a connection from popup')
  port.onMessage.addListener((message) => {
    console.log('background has received a message from popup, and count is ', message?.count)
  })
})