import { TelegramClient } from 'telegram'
import config             from '../../config.js'

const MONTH_NAMES = [ 'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня',
                      'жовтня', 'листопада', 'грудня' ]

const getCurrentMonth = () => {
  const currentDate  = new Date()
  const currentMonth = currentDate.getMonth() // Returns a number (0-11)

  return { index: currentMonth + 1, name: MONTH_NAMES[ currentMonth ], year: currentDate.getFullYear() }
}

const getNextMonth = () => {
  const currentDate  = new Date()
  let nextMonthIndex = currentDate.getMonth() + 1 // Increment to get next month
  const currentYear  = currentDate.getFullYear()

  let year = currentYear
  // Handle wrap around for December
  if (nextMonthIndex === 12) {
    nextMonthIndex = 0 // January (0 index)
    if (currentDate.getDate() === 31) {
      year = currentYear + 1
    }
  }

  return { index: nextMonthIndex + 1, name: MONTH_NAMES[ nextMonthIndex ], year }
}

function formatDateFromObject(obj) {
  const year       = new Date().getFullYear() // Get the current year
  const monthIndex = obj.index - 1 // Convert month index to zero-based
  const month      = (monthIndex + 1).toString().padStart(2, '0') // Convert to one-based index and pad to two digits
  const day        = obj.day.toString().padStart(2, '0') // Ensure day is two digits with leading zero if necessary

  // Create date string in YYYY-MM-DD format
  const dateString = `${year}-${month}-${day}`

  return dateString
}

function getTodayDate() {
  const today = new Date()
  const year  = today.getFullYear() // Get the year (YYYY)
  const month = (today.getMonth() + 1).toString().padStart(2, '0') // Get the month (MM) and pad with leading zero if
                                                                    // necessary
  const day   = today.getDate().toString().padStart(2, '0') // Get the day (DD) and pad with leading zero if necessary

  // Construct date string in YYYY-MM-DD format
  const dateString = `${year}-${month}-${day}`

  return dateString
}



let tgClient

const getTelegramClient = async () => {
  if (tgClient) {
    console.log('Returning existing client')
    return tgClient
  }

  console.log('Creating new Telegram client')
  tgClient =
    new TelegramClient(config.telegram.stringSession, config.telegram.apiId, config.telegram.apiHash, { connectionRetries: 10 })

  console.log('Connecting to telegram')
  await tgClient.connect()

  console.log('You should now be connected.')
  return tgClient
}

export { getCurrentMonth, getNextMonth, formatDateFromObject, getTodayDate, getTelegramClient }
