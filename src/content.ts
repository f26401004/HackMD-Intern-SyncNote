import Client from './lib/client'
import GistClient from './lib/gistClient'
import MakrdownClient from './lib/makrdownClient'

let client: Client | any = null

window.addEventListener('load', function (this: Window, event: Event) {
  // check the login status
  if (this.location.href.indexOf('https://gist.github.com') > -1 && document.body.classList.contains('logged-out')) {
    console.log('[SyncNote]: You need to login github to use the extension')
    return
  }
  // init the client according to the url
  chrome.runtime.sendMessage({ text: "what is my tab id?" }, res => {
    if (this.location.href.indexOf('https://gist.github.com') > -1) {
      client = new GistClient(res.options.tabId)
    } else if (this.location.href.indexOf('https://markdown-it.github.io') > -1) {
      client = new MakrdownClient(res.options.tabId)
    }
    client.startListening()
    client.detect()
  })
})
