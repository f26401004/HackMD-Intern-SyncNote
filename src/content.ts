// import CodeMirror from 'codemirror'
// const test: any = CodeMirror(document.body.querySelector('textarea') as HTMLTextAreaElement)

import Client from './lib/client'
import GistClient from './lib/gistClient'
import MakrdownClient from './lib/makrdownClient'

let client: Client | any = null

window.addEventListener('load', function(this: Window, event: Event) {
  // init the client according to the url
  chrome.runtime.sendMessage({ text: "what is my tab id?" }, res => {
    if (this.location.href.indexOf('https://gist.github.com') > -1) {
      client = new GistClient(res.options.tabId)
    } else if (this.location.href.indexOf('https://markdown-it.github.io') > -1) {
      client = new MakrdownClient(res.options.tabId)
    }
  })
})