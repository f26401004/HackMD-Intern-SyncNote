/** Interface: representing the active tabs. */
interface IActiveTab {
  gist: number,
  markdown: number
}

/** Interface: representing the request options. */
interface IRequestOption {
  activeTabs: IActiveTab,
  tabId: number,
  gist: Array<number>,
  markdown: Array<number>,
  message: string,
  value: Array<string>,
  switch: boolean
}

/** Interface: representing the request. */
interface IRequest {
  type: string,
  options: IRequestOption
}