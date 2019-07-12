import Client from './client'
import randomstring from 'crypto-random-string'
import './datatype'

export default class markdownEditor implements Client {
  Id: number = -1
  textareaPool: Array<HTMLTextAreaElement> = []
  currentEditor: string = ''
  transferingEditor: string = ''
  transfering: boolean = false
  port: chrome.runtime.Port | any = null
  constructor(id: number) {
    this.Id = id
    // send ping message to config the information to channel instance
    chrome.runtime.sendMessage({
      type: 'ping',
      options: {
        message: 'content_Gist_ping'
      }
    })
  }

  detect(): Array<HTMLTextAreaElement> {
    // get all textarea
    const textareas = document.querySelectorAll('textarea')
    if (textareas.length === 0) {
      return []
    }
    textareas.forEach(target => {
      const id = randomstring({ length: 12, type: 'url-safe' })
      target.setAttribute('data-sync-id', id)
      // config onFocus and onBlur event
      target.addEventListener('focus', () => {
        this.currentEditor = id
      })
      target.addEventListener('blur', () => {
        this.currentEditor = ''
      })
      this.textareaPool.push(target)
    })
    return this.textareaPool
  }

  startListening() {
    console.log(`Markdown-it client ${this.Id} start listening ...`)
    // config the listener
    chrome.runtime.onMessage.addListener((request: IRequest, sender: any) => {
      switch (request.type) {
        case 'transfering':
          if (this.Id !== request.options.activeTabs.markdown) {
            return
          }
          this.transfering = request.options.switch
          // set up the transfering port to the channel
          if (this.transfering) {
            this.port = chrome.tabs.connect(request.options.activeTabs.gist, { name: 'markdown_transfering' })
          } else {
            this.port.disconnect()
          }
          break
      }
    })
  }

  transfer(): boolean {
    if (this.port === null) {
      throw 'The transfer channel has not established!'
    }
    // TODO: send the message to the target gist
    this.port.postMessage()
    return true
  }
}