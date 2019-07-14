# HackMD-Intern-SyncNote

The first intern project of HackMD

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

#### 2019-07-14 (about 3hr)
* Use javascript injection to access the CodeMirror to set change event
* Only Makrdown-it use port to communicate with background while transfering
* Comment the code