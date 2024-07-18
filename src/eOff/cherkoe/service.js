import { parseMessage }   from './parser.js'
import config             from '../../config.js'
import { getTelegramClient } from './utils.js'


const daysScheduleData = {}

const getFormattedDate = (date) => {
  const year  = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0') // Months are zero-based, so add 1
  const day   = date.getDate().toString().padStart(2, '0') // Pad single-digit days with a leading zero
  return `${year}-${month}-${day}`
}

const today     = new Date()
const todayDate = getFormattedDate(today)

const tomorrow = new Date()
tomorrow.setDate(today.getDate() + 1)
const tomorrowDate = getFormattedDate(tomorrow)

const getDataForCherkOE = async () => {
  console.log('Processing data for CHERKOE')
  const client = await getTelegramClient()

  // Getting the channel entity
  const channel = await client.getEntity(config.telegram.channelUsername)
  console.log('Channel ID:', channel.id.toString())

  // Fetching the last 20 messages from the channel
  const lastMessages = await client.getMessages(channel, { limit: config.telegram.MESSAGES_LIMIT })

  lastMessages.reverse()

  lastMessages.forEach(message => {
    if (message.message) {
      console.log(`Message from ${config.telegram.channelUsername}: ${message.message}`)
      const parsedMessage = parseMessage(message.message)
      if (!parsedMessage) {
        return
      }
      daysScheduleData[ parsedMessage.targetDate ] = parsedMessage.eventsList
    }
  })

  const result = { events: [], hasTodayData: false, hasTomorrowData: false }
  if (daysScheduleData[ todayDate ]) {
    result.events       = [ ...result.events, ...daysScheduleData[ todayDate ] ]
    result.hasTodayData = true
  }
  if (daysScheduleData[ tomorrowDate ]) {
    result.events          = [ ...result.events, ...daysScheduleData[ tomorrowDate ] ]
    result.hasTomorrowData = true
  }

  return result
}

export { getDataForCherkOE }
