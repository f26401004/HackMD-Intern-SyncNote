import Vue from 'vue'

const app = new Vue({
  el: '#app',
  data: {
    tabIds: {
      gist: [-1],
      markdown: [-1]
    },
    activeTabs: {
      gist: -1,
      markdown: -1
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
          this.tabIds.gist = request.options.gist.slice()
          this.tabIds.markdown = request.options.markdown.slice()
          this.transfering = request.options.switch
          this.activeTabs.gist = request.options.activeTabs.gist
          this.activeTabs.markdown = request.options.activeTabs.markdown
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
          switch: type,
          activeTabs: this.activeTabs
        }
      })
    }
  }
})