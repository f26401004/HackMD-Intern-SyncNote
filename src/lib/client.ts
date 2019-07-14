export default interface Client {
  id: number
  textareaPool: Array<HTMLTextAreaElement>
  currentEditor: string
  transferingEditor: string
  transfering: boolean;
  port: chrome.runtime.Port
  targetTabId: number
  tabIcon: HTMLLinkElement
  tabIconOrig: string
  detect(): Array<HTMLTextAreaElement>
  transfer(text: string): boolean
  startListening(): any
}