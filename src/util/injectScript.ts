// Breaks out of the content script context by injecting a specially
// constructed script tag and injecting it into the page.
export default (method: any, ...args:  any[]) => {
  // The stringified method which will be parsed as a function object.
  const stringifiedMethod = method instanceof Function
    ? method.toString()
    : `() => { ${method} }`

  // The stringified arguments for the method as JS code that will reconstruct the array.
  const stringifiedArgs = JSON.stringify(args, function(key, val) {
    if (typeof val === 'function') {
      return val + ''
    }
    return val
  })

  // The full content of the script tag.
  const scriptContent = `
    // Parse and run the method with its arguments.
    (${stringifiedMethod})(...${stringifiedArgs})

    // Remove the script element to cover our tracks.
    document.currentScript.parentElement
      .removeChild(document.currentScript)
  `

  // Create a script tag and inject it into the document.
  const scriptElement = document.createElement('script')
  scriptElement.innerHTML = scriptContent
  document.head.appendChild(scriptElement)
}
