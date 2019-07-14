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
   * Number of transfer target tab id
   * 
   * @name Client#targetTabId
   * @type number
   * @default -1
   */
  targetTabId: number = -1
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
   * Event to detect input
   * 
   * @name Client#inputEvent
   * @type Event
   * @default null
   */
  inputEvent: Event | any = null

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
        message: 'content_Markdown-it_ping',
        tabId: this.id
      }
    })
    // add the favicon to the page
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
        /**
         * transfering
         * The request message to start/stop transfering
         */
        case 'transfering':
          this.transfering = request.options.switch
          // set up the transfering port to the channel
          if (this.transfering) {
            console.log('Start transfering ...')
            this.startTransfer(request.options.tabId)
          } else {
            console.log('Stop transfering!')
            this.stopTransfer()
          }
          break
        /**
         * transfer_to_makrdown
         * The request message to transfer the text from Gist to Markdown-it
         */
        case 'transfer_to_makrdown':
          if (request.options.tabId === this.id && this.transfering) {
            this.textareaPool[0].value = request.options.value as string
          }
          break
        /**
         * choose_tab
         * The request message to set the chosed label on favicon
         */
        case 'choose_tab':
          this.tabIcon.setAttribute('href', chrome.extension.getURL("icons/favicon_markdown-it_choose.ico"))
          break
        /**
         * unchoose_tab
         * The request message to set the unchosed label on favicon
         */
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
   * Function to start transfering
   * 
   * @param targetTabId 
   */
  startTransfer(targetTabId: number) {
    this.targetTabId = targetTabId
    this.transferingEditor = this.textareaPool[0].getAttribute('data-sync-id') as string
    // establish connection port
    this.port = chrome.runtime.connect({ name: 'markdown_transfering' })
    // default config input event to the fisrt textarea in textareaPool
    const self = this
    this.inputEvent = function (this: HTMLTextAreaElement, event: Event) {
      self.transfer(this.value)
    }
    this.textareaPool[0].addEventListener('input', this.inputEvent)
  }
  
  /**
   * Function to stop transfering
   */
  stopTransfer() {
    if (this.port === null) {
      return
    }
    this.port.disconnect()
    this.targetTabId = -1
    this.transferingEditor = ''
    this.transfering = false
    this.textareaPool[0].removeEventListener('input', this.inputEvent)
  }

  /**
   * Transfer the text to target
   * 
   * @param {string} text - The text to transfer
   * 
   * @return {boolean} success?
   */
  transfer(text: string): boolean {
    if (this.port === null || !this.transfering) {
      throw 'The transfer port has not established!'
    }
    this.port.postMessage({ tabId: this.targetTabId, text: text })
    return true
  }
}