import Client from './client'
import randomstring from 'crypto-random-string'
import './datatype'

export default class markdownEditor implements Client {
  /**
   * Number representing the client tab number
   * 
   * @name Client#id
   * @type number
   * @default -1
   */
  id: number = -1
  /**
   * Array to store all textarea in the page
   * 
   * @name Client#textareaPool
   * @type Array<HTMLTextAreaElement>
   * @default []
   */
  textareaPool: Array<HTMLTextAreaElement> = []
  /**
   * String id to representing the current focus textarea
   * 
   * @name Client#currentEditor
   * @type string
   * @default ''
   */
  currentEditor: string = ''
  /**
   * String id to representing the current transfering textarea
   * 
   * @name Client#transferingEditor
   * @type string
   * @default ''
   */
  transferingEditor: string = ''
  /**
   * Boolean to representing the current transfer status
   * 
   * @name Client#transfering
   * @type boolean
   * @default false
   */
  transfering: boolean = false
  /**
   * Instance of the connection with transfering target
   * 
   * @name Client#port
   * @type chrome.runtime.Port
   * @default null
   */
  port: chrome.runtime.Port | any = null
  /**
   * Link HTML element of the favicon
   * 
   * @name Client#tabIcon
   * @type HTMLLinkElement
   * @default null
   */
  tabIcon: HTMLLinkElement | any = null
  /**
   * Url of the tab of origin favicon
   * 
   * @name Client#tabIconOrig
   * @type string
   * @default ''
   */
  tabIconOrig: string = ''

  /**
   * Constructor to create the client instance
   * 
   * @constructor
   * @param {number} id - the client tab id
   */
  constructor(id: number) {
    this.id = id
    // send ping message to config the information to channel instance
    chrome.runtime.sendMessage({
      type: 'ping',
      options: {
        message: 'content_Markdown-it_ping'
      }
    })
    this.tabIcon = document.createElement('link')
    this.tabIconOrig = ''
    this.tabIcon.setAttribute('rel', 'icon')
    this.tabIcon.setAttribute('type', 'image/x-icon')
    this.tabIcon.setAttribute('href', chrome.extension.getURL("icons/favicon_markdown-it_unchoose.ico"))
    document.head.appendChild(this.tabIcon)
  }

  /**
   * Find out all textarea HTML element in page
   */
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

  /**
   * Start listening message from popup/background
   */
  startListening() {
    console.log(`Markdown-it client ${this.id} start listening ...`)
    // config the listener
    chrome.runtime.onMessage.addListener((request: IRequest, sender: any, sendResponse: any) => {
      switch (request.type) {
        case 'transfering':
          if (this.id !== request.options.activeTabs.markdown) {
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
        case 'choose_tab':
          this.tabIcon.setAttribute('href', chrome.extension.getURL("icons/favicon_markdown-it_choose.ico"))
          break
        case 'unchoose_tab':
          this.tabIcon.setAttribute('href', chrome.extension.getURL("icons/favicon_markdown-it_unchoose.ico"))
          break
      }
      if (sender.tab) {
        sendResponse({
          type: `client ${this.id}`,
          options: {
            tabId: sender.tab.id,
            message: 'received'
          }
        })
      }
    })
  }

  /**
   * Transfer the text to target
   * 
   * @return {boolean} success?
   */
  transfer(): boolean {
    if (this.port === null) {
      throw 'The transfer channel has not established!'
    }
    // TODO: send the message to the target gist
    this.port.postMessage()
    return true
  }
}