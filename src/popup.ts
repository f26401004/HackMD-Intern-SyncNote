import Vue from 'vue'
import { Button, Select, Badge } from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'

Vue.use(Button)
Vue.use(Select)
Vue.use(Badge)

const app = new Vue({
  el: '#app',
  data: {
    tabIds: {
      gist: [] as Array<number>,
      markdown: [] as Array<number>
    },
    activeTabs: {
      gist: -1,
      markdown: -1
    },
    transfering: false
  },
  created: function () {
    // check all tabs are already configed to the background pool
    chrome.tabs.query({}, (result) => {
      result.forEach(target => {
        if ((target.url as string).indexOf('https://gist.github.com') > -1) {
          chrome.runtime.sendMessage({
            type: 'ping',
            options: {
              message: 'content_Gist_ping',
              tabId: target.id
            }
          })
        } else if ((target.url as string).indexOf('https://markdown-it.github.io') > -1) {
          chrome.runtime.sendMessage({
            type: 'ping',
            options: {
              message: 'content_Markdown-it_ping',
              tabId: target.id
            }
          })
        }
      })
    })
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
          this.tabIds = Object.assign({}, {
            gist: request.options.gist.slice(),
            markdown: request.options.markdown.slice()
          })
          this.transfering = request.options.switch
          this.activeTabs.gist = request.options.activeTabs.gist
          this.activeTabs.markdown = request.options.activeTabs.markdown
          if (!this.transfering) {
            this.tabIds.gist.forEach(target => {
              chrome.tabs.sendMessage(target, { type: 'unchoose_tab' })
            })
            this.tabIds.markdown.forEach(target => {
              chrome.tabs.sendMessage(target, { type: 'unchoose_tab' })
            })
          }
          break
      }
    })
    // config the popup page close event
    const background: any = chrome.extension.getBackgroundPage()
    window.addEventListener('unload', (event: Event) => {
        background.__SYNCNOTE__.channel.unchooseTabs()
    }, true)
  },
  watch: {
    'activeTabs.gist': function (newVal: number, oldVal: number) {
      chrome.tabs.sendMessage(newVal, { type: 'choose_tab' })
      if (oldVal !== -1) {
        chrome.tabs.sendMessage(oldVal, { type: 'unchoose_tab' })
      }
    },
    'activeTabs.markdown': function (newVal: number, oldVal: number) {
      chrome.tabs.sendMessage(newVal, { type: 'choose_tab' })
      if (oldVal !== -1) {
        chrome.tabs.sendMessage(oldVal, { type: 'unchoose_tab' })
      }
    }
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