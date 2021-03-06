import './datatype'

/** Class: representing the channel instance. */
export default class Channel {
  /**
   * Array to store all gist tab Id in current chrome app
   * 
   * @name Channel#gistTabs
   * @type Array<number>
   * @default []
   */
  gistTabs: Array<number> = []
  /**
   * Array to store all markdown-it tab Id in current chrome app
   * 
   * @name Channel#markdownTabs
   * @type Array<number>
   * @default []
   */
  markdownTabs: Array<number> = []
  /**
   * Number to limit the channel pool
   * 
   * @name Channel#maximum
   * @type numbrt
   * @default 0
   */
  maximum: number = 0
  /**
   * Object to representing the current active tabs
   * 
   * @name Channel#currentActive
   * @type IActiveTab
   * @default { gist: -1, markdown: -1 }
   */
  currentActive: IActiveTab = {
    gist: -1,
    markdown: -1
  }
  /**
   * Boolean to representing transfering status
   * 
   * @name Channel#transfering
   * @type boolean
   * @default false
   */
  transfering: boolean = false

  /**
   * Constructor to create the channel instance
   * 
   * @constructor
   * @param {number} maxnum - the maximum number of the channel pool
   */
  constructor(maxnum: number) {
    this.maximum = maxnum
    // config removed event to remove the configuration 
    chrome.tabs.onRemoved.addListener((tabId: number, removeInfo: any) => {
      if (this.gistTabs.includes(tabId)) {
        this.removeGistTab(tabId)
        if (this.currentActive.gist === tabId) {
          this.stopTransfering()
        }
      } else if (this.markdownTabs.includes(tabId)) {
        this.removeMarkdownTab(tabId)
        if (this.currentActive.markdown === tabId) {
          this.stopTransfering()
        }
      }
    })
  }

  /**
   * Add the gist tab id to the gistTabs pool
   * 
   * @param {number} id - the target gist tab id
   * 
   * @return {boolean} success?
   */
  addGistTab(id: number): boolean {
    if (this.gistTabs.includes(id)) {
      throw 'The tab already exists in the channel pool!'
    }
    this.gistTabs.push(id)
    return true
  }

  /**
   * Add the markdown tab id to the markdownTabs pool
   * 
   * @param {number} id - the target markdown-it tab id
   * 
   * @return {boolean} success?
   */
  addMarkdownTab(id: number): boolean {
    if (this.markdownTabs.includes(id)) {
      throw 'The tab already exists in the channel pool!'
    }
    this.markdownTabs.push(id)
    return true
  }

  /**
   * Remove the gist tab id to the gistTabs pool
   * 
   * @param {number} id - the target gist tab id
   * 
   * @return {boolean} success?
   */
  removeGistTab(id: number): boolean {
    if (!this.gistTabs.includes(id)) {
      throw 'The tab do not exists in the channel pool!'
    }
    const index: number = this.gistTabs.indexOf(id)
    this.gistTabs.splice(index, 1)
    // stop the transfer status
    if (this.currentActive.gist === id) {
      this.stopTransfering()
    }
    return true
  }
  /**
   * Remove the markdown-it tab id to the markdownTabs pool
   * 
   * @param {number} id - the target markdown-it tab id
   * 
   * @return {boolean} success?
   */
  removeMarkdownTab(id: number): boolean {
    if (!this.markdownTabs.includes(id)) {
      throw 'The tab do not exists in the channel pool!'
    }
    const index: number = this.markdownTabs.indexOf(id)
    this.markdownTabs.splice(index, 1)
    // stop the transfer status
    if (this.currentActive.markdown === id) {
      this.stopTransfering()
    }
    return true
  }

  /**
   * Config listening event the message from content.js
   * 
   * @param {number} id - the target markdown-it tab id
   * 
   * @return {boolean} success?
   */
  startListening(): boolean {
    console.log('Start listening from the client ...')
    chrome.runtime.onMessage.addListener((request: IRequest, sender: any, sendResponse: any) => {
      console.log(request)
      switch (request.type) {
        /**
         * ping
         * The request message to config the tab information to channel instance.
         */
        case 'ping':
          if (request.options.message == 'content_Gist_ping') {
            this.addGistTab(request.options.tabId)
          } else if (request.options.message == 'content_Markdown-it_ping') {
            this.addMarkdownTab(request.options.tabId)
          }
          break
        /**
         * get_config
         * The request message to get the current config information.
         */
        case 'get_config':
          chrome.runtime.sendMessage({
            type: 'config_information',
            options: {
              activeTabs: this.currentActive,
              gist: this.gistTabs,
              markdown: this.markdownTabs,
              switch: this.transfering
            }
          })
          break
        /**
         * transfering
         * The request message to start/stop transfering
         */
        case 'transfering':
          console.log('Transfering status changed: ',  request)
          this.currentActive.gist = request.options.activeTabs.gist
          this.currentActive.markdown = request.options.activeTabs.markdown
          // delivery the message to the other transfering tab
          chrome.tabs.sendMessage(this.currentActive.gist, {
            type: 'transfering',
            options: {
              switch: request.options.switch,
              tabId: request.options.activeTabs.markdown
            }
          })
          chrome.tabs.sendMessage(this.currentActive.markdown, {
            type: 'transfering',
            options: {
              switch: request.options.switch,
              tabId: request.options.activeTabs.gist
            }
          })
          if (request.options.switch) {
            this.startTransfering(request.options.activeTabs.gist, request.options.activeTabs.markdown)
          } else {
            this.stopTransfering()
          }
        /**
         * transfering_from_gist
         * The request message to transfer the text from gist to markdown-it
         */
        case 'transfer_from_gist':
          if (request.options.tabId) {
            // delivery the message to markdown-it
            chrome.tabs.sendMessage(request.options.tabId, {
              type: 'transfer_to_makrdown',
              options: request.options
            })
          }
          break
        // /**
        //  * transfering_from_markdown
        //  * The request message to transfer the text from markdown-it to gist
        //  */
        // case 'transfer_from_makrdown':
        //   // delivery the message to gist
        //   chrome.runtime.sendMessage({
        //     type: 'transfer_to_gist',
        //     options: {
        //       value: request.options.value
        //     }
        //   })
        //   break
      }
      if (sender.tab) {
        sendResponse({
          type: 'background',
          options: {
            tabId: sender.tab.id,
            message: 'received'
          }
        })
      }
    })
    // only Markdown-it use port to communicate with background
    chrome.runtime.onConnect.addListener((port: chrome.runtime.Port) => {
      switch (port.name) {
        case 'markdown_transfering':
          port.onMessage.addListener(request => {
            // delivery the message to gist
            chrome.tabs.sendMessage(request.tabId, {
              type: 'transfer_to_gist',
              options: {
                tabId: request.tabId,
                value: request.text
              }
            })
            port.postMessage({ status: true })
          })
          break
      }
    })
    return true
  }

  /**
   * Start the transfer
   * 
   * @param {number} gistId - the target gistt tab id
   * @param {number} markdownId - the target markdown-it tab id
   * 
   * @return {boolean} success?
   */
  startTransfering(gistId: number, markdownId: number): boolean {
    if (this.transfering) {
      throw `You are already transfering the text between Gist-${this.currentActive.gist} and Makrdown-it-${this.currentActive.markdown}`
    }
    if (!this.gistTabs.includes(gistId)) {
      throw `The Gist-${gistId} instance do not exist`
    }
    if (!this.markdownTabs.includes(markdownId)) {
      throw `The Markdown-it-${markdownId} instance do not exist`
    }
    // set the transfering status and information
    this.transfering = true
    this.currentActive.gist = gistId
    this.currentActive.markdown = markdownId
    return this.transfering
  }

  /**
   * Stop the transfer
   * 
   * @return {boolean} success?
   */
  stopTransfering(): boolean {
    if (!this.transfering) {
      throw 'Transfer status do not active!'
    }
    chrome.tabs.sendMessage(this.currentActive.gist, {
      type: 'unchoose_tab'
    })
    chrome.tabs.sendMessage(this.currentActive.markdown, {
      type: 'unchoose_tab'
    })
    this.currentActive.gist = this.currentActive.markdown = -1
    this.transfering = false
    return true
  }

  /**
   * Unchoose all tabs after popup closed
   */
  unchooseTabs(): boolean {
    // if the transfer is ogoing, then return true directly
    if (this.transfering) {
      return true
    }
    // send unchoose tab message to the client
    this.gistTabs.forEach(target => {
      chrome.tabs.sendMessage(target, { type: 'unchoose_tab' })
    })
    this.markdownTabs.forEach(target => {
      chrome.tabs.sendMessage(target, { type: 'unchoose_tab' })
    })
    return true
  }
}