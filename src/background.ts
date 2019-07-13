import Channel from './lib/channel'

// config the channel instance in window
(window as any).__SYNCNOTE__ = {
  channel: new Channel(100)
}

try {
  (window as any).__SYNCNOTE__.channel.startListening()
} catch (error) {
  console.log(error)
}