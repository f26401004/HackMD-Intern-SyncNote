interface ITabId {
  gist: number,
  markdown: number,
  current: number
}

interface IRequestOption {
  tabId: ITabId,
  current: number,
  message: string,
  value: Array<string>,
  switch: boolean
}

interface IRequest {
  type: string,
  options: IRequestOption
}

// define the config interface
interface IConfig {
  tabId: ITabId
}


// initialize the config
let config: IConfig = {
  tabId: {
    gist: -1,
    markdown: -1,
    current: -1
  }
}

// config omMessage event to get the data from the page
chrome.runtime.onMessage.addListener(function (request: IRequest, sender: any) {
  switch (request.type) {
    case 'ping':
      if (request.options.message == 'content_Gist_ping') {
        config.tabId.gist = sender.tab.id
      } else if (request.options.message == 'content_Markdown-it_ping') {
        config.tabId.markdown = sender.tab.id
      }
      config.tabId.current = sender.tab.id
      break
    case 'tab_deletion':
      if (request.options.message == 'content_Gist_tab_deleteion') {
        config.tabId.gist = -1
      } else if (request.options.message == 'content_Markdown-it_tab_deletion') {
        config.tabId.markdown = -1
      }
      config.tabId.current = request.options.tabId.current
      break
    case 'tab_swtich':
      config.tabId.current = request.options.tabId.current
      break
    case 'get_config':
      chrome.runtime.sendMessage({
        type: 'config_information', 
        options: config
      })
      break
    case 'transfering':
      chrome.runtime.sendMessage({
        type: 'transfering',
        options: {
          switch: request.options.switch
        }
      })
    case 'transfer_from_gist':
      chrome.runtime.sendMessage({
        type: 'transfer_to_makrdown',
        options: {
          value: request.options.value
        }
      })
      break
      case 'transfer_from_makrdown':
      chrome.runtime.sendMessage({
        type: 'transfer_to_gist',
        options: {
          value: request.options.value
        }
      })
      break
  }
})

// config onActivated event to switch the current tab information
chrome.tabs.onActivated.addListener(function (activeInfo: any) {
  // update the current tab id
  config.tabId.current = activeInfo.tabId
})
