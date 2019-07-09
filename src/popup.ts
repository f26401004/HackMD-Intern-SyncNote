import Vue from 'vue'

const app = new Vue({
  el: '#app',
  data: {
    tabId: {
      gist: -1,
      markdown: -1,
      current: -1
    },
    transfering: false
  },
  mounted: function () {
    // set the div background image
    (this.$refs.icon as HTMLDivElement).setAttribute('style', `background-image: url('${chrome.extension.getURL("icons/icon_128.png")}')`)
    // get the config from the background
    chrome.runtime.sendMessage({
      type: 'get_config'
    })
    // set the config information
    chrome.runtime.onMessage.addListener((request: IRequest, sender: any) => {
      switch (request.type) {
        case 'config_information':
          this.tabId.gist = request.options.tabId.gist
          this.tabId.markdown = request.options.tabId.markdown
          this.tabId.current = request.options.tabId.current
          break
      }
    })
  },
  methods: {
    controlTransfer: function () {
      this.transfering = !this.transfering
      if (!this.transfering) {
        this.transfer(false)
      } else {
        this.transfer(true)
      }
    },
    transfer: function (type: boolean) {
      this.transfering = type
      chrome.runtime.sendMessage({
        type: 'transfering',
        options: {
          switch: type
        }
      })
    }
  }
})