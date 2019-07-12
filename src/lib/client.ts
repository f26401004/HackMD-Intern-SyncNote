export default interface Client {
  Id: number
  textareaPool: Array<HTMLTextAreaElement>
  currentEditor: string
  transferingEditor: string
  transfering: boolean;
  port: chrome.runtime.Port
  detect(): Array<HTMLTextAreaElement>
  transfer(): boolean
}