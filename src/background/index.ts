chrome.commands.onCommand.addListener((command) => {
  if (command === 'open_jira_sprint_tab') {
    chrome.tabs.create({ url: chrome.runtime.getURL('popup.html')})
  }

  if (command === 'open_options_page') {
    chrome.runtime.openOptionsPage()
  }
})