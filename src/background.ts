import Channel from './lib/channel'

const channel: Channel = new Channel(100)

try {
  channel.startListening()
} catch (error) {
  console.log(error)
}