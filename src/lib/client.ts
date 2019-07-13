export default interface Client {
  id: number
  textareaPool: Array<HTMLTextAreaElement>
  currentEditor: string
  transferingEditor: string
  transfering: boolean;
  port: chrome.runtime.Port
  tabIcon: HTMLLinkElement
  tabIconOrig: string
  detect(): Array<HTMLTextAreaElement>
  transfer(): boolean
  startListening(): any
}