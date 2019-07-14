

# HackMD-Intern-SyncNote

###### tags: `HackMD`, `Intern`, `SyncNote`, `Chrome-extension`, `Gist`, `Markdown-it`

The first intern project of HackMD: **Sync the note between Gist and Markdown-it.**

**Deadline**: 2019-07-15 00:00:00

## Getting Started

![](https://i.imgur.com/NyCkFSG.gif)

### Prerequisites
||Verion|
|-|-|
|[TypeScript](https://www.typescriptlang.org/)|3.5.2|
|[Webpack](https://webpack.js.org/)|4.35.2|
|[Vue](https://vuejs.org/)|2.6.10|
|[Ant-Design-Vue](https://vue.ant.design/docs/vue/introduce/)|1.3.10|

### Step One - Install dependencies
`npm install` or `npm i`

### Step Two - Build
* `npm run dev` for development
* `npm run build` for production

The code will be generated in `dist/` directory

### Step Three - Load extension
Open browser -> go to `chrome://extensions/` -> Load unpacked -> Choose the `dist/` directory -> Enjoy!

## Directory Structure
```
├── src
    ├── icnos -- Icons of the extension
    ├── lib
        ├── channel.ts -- Channel class.
        ├── client.ts -- Client interface.
        ├── datatype.ts -- Datatype definition
        ├── gistClient.ts -- Gist client class.
        ├── markdownClient.ts -- Markdown-it client class.
    ├── util
        └── injectScript.ts -- Injection with custom logic.
    ├── background.js -- The transmitter to forward messages.
    ├── content.js -- The injection and initialization of whole SyncNote app
    ├── manifest.json -- Configuration file of extension
    ├── popup.html -- Popup page definition
    ├── popup.ts-- Popup page action definition
└── dist -- output directory generated from command "npm run build"
```

## Development Note

#### 2019-07-07 (about 1hr)
* Use webpack to build the extension
* Set up the typescript compile environment
* Set up the vue framework to build the popup page
* Set up the basic communication channel between background.js and content.js

#### 2019-07-09 (about 2hr)
* Start to build the basic communication channel between background/content/popup

#### 2019-07-12 (about 2hr)
* Refactor the content script and background script
* channel.ts -> gen instance in background script to deal with communication between tabs
* clien.ts -> gen instance in content script to deal with the page operation
* Develop with es2016 feature

#### 2019-07-13 (about 2hr)
* Add success/failed animation to label the availability of transfering
* Use Ant-Design to build the popup page
* Labeling the choosing/transfering tab on favicon

#### 2019-07-14 (about 5hr)
* Use javascript injection to access the CodeMirror to set change event
* Only Makrdown-it use port to communicate with background while transfering
* Comment the code