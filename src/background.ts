// define the config interface
interface IConfig {
  gistTabId: number,
  markdownTabId: number,
  currentTabId: number,
  currentType: string
}

// initialize the config
let config: IConfig = {
  gistTabId: -1,
  markdownTabId: -1,
  currentTabId: -1,
  currentType: ''
}

// config omMessage event to get the data from the page
chrome.runtime.onMessage.addListener(function (request: any, sender: any) {
  switch (request.type) {
    case 'ping':
      if (request.options.message == 'content_Gist_ping') {
        config.gistTabId = sender.tab.id
        config.currentTabId = sender.tab.id
        config.currentType = 'Gist'
      } else if (request.options.message == 'content_Markdown-it_ping') {
        config.markdownTabId = sender.tab.id
        config.currentTabId = sender.tab.id
        config.currentType = 'Markdown-it'
      }
      break
  }
})

// config onActivated event to switch the current tab information
chrome.tabs.onActivated.addListener(function (activeInfo: any) {
  console.log(activeInfo)
  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs: Array<any>) {
    console.log(tabs[0].url)
    // update the current tab id and type
    config.currentTabId = activeInfo.tabId
    if (tabs[0].url.indexOf('https://gist.github.com/') > 0) {
      config.currentType = 'Gist'
    } else if (tabs[0].url.indexOf('https://markdown-it.github.io/') > 0) {
      config.currentType = 'Markdown-it'
    }
  })
})
