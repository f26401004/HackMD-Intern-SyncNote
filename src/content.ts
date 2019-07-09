
let transfering: boolean = false
let inputDomElement: any = null
let inputEvent: any = null

window.addEventListener('load', function(this: Window, event: Event) {
  // send ping message to the background
  if (this.location.href.indexOf('https://gist.github.com') > -1) {
    chrome.runtime.sendMessage({
      type: 'ping',
      options: {
        title: 'ping',
        message: 'content_Gist_ping'  
      }
    })
    chrome.runtime.onMessage.addListener((request: IRequest, sender: any) => {
      switch (request.type) {
        case 'transfering':
          transfering = request.options.switch
          if (transfering) {
            // TODO: deal with the input event listener
          } else {
            inputDomElement.removeEventListener(inputEvent)
          }
          break
        case 'transfer_to_gist':
          if (!transfering) {
            return
          }
          inputDomElement.value = (request.options.value as Array<string>).join('\n')
          break
      }
    })
  } else if (this.location.href.indexOf('https://markdown-it.github.io') > -1) {
    chrome.runtime.sendMessage({
      type: 'ping',
      options: {
        title: 'ping',
        message: 'content_Markdown-it_ping'  
      }
    })
    inputDomElement = document.querySelector('.source')
    
    chrome.runtime.onMessage.addListener((request: IRequest, sender: any) => {
      switch (request.type) {
        case 'transfering':
          transfering = request.options.switch
          if (transfering) {
            inputEvent = inputDomElement.addEventListener('input', (event: Event) => {
              chrome.runtime.sendMessage({
                type: 'transfer_from_markdown',
                options: {
                  value: (event.target as HTMLTextAreaElement).value.split("\n")
                }
              })
            })
          } else {
            inputDomElement.removeEventListener(inputEvent)
          }
        break
        case 'transfer_to_markdown':
          if (!transfering) {
            return
          }
          inputDomElement.value = (request.options.value as Array<String>).join('\n')
          break
      }
    })
  }
})