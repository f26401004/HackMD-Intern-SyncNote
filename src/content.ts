window.addEventListener('load', function(this: Window, event: Event) {
  if (this.location.href.indexOf('https://gist.github.com') > -1) {
    chrome.runtime.sendMessage({
      type: 'ping',
      options: {
        title: 'ping',
        message: 'content_Gist_ping'  
      }
    })
  } else if (this.location.href.indexOf('https://markdown-it.github.io') > -1) {
    console.log('test')
    chrome.runtime.sendMessage({
      type: 'ping',
      options: {
        title: 'ping',
        message: 'content_Markdown-it_ping'  
      }
    })
  }
})