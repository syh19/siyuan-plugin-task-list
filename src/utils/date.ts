function padZero(num: number) {
  return num.toString().padStart(2, '0')
}

/**
 * 获取此时此刻的日期时间
 * @returns
 */
export function getCurrentDateTime() {
  let now = new Date()

  let year = now.getFullYear()
  let month = padZero(now.getMonth() + 1)
  let day = padZero(now.getDate())
  let hours = padZero(now.getHours())
  let minutes = padZero(now.getMinutes())
  let seconds = padZero(now.getSeconds())

  return year + month + day + hours + minutes + seconds
}

/**
 * 格式化时间
 */
export function formatDateTime(dateTime: string) {
  if (!dateTime) return ''

  let year = dateTime.slice(0, 4)
  let month = dateTime.slice(4, 6)
  let day = dateTime.slice(6, 8)
  // let hours = dateTime.slice(8, 10)
  // let minutes = dateTime.slice(10, 12)
  // let seconds = dateTime.slice(12, 14)

  // return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  return `${year}-${month}-${day}`
}

/**
 * 将形如 2024-05-08 的日期转换为形如 20240508000000 的格式
 * @param dateParam 形如 2024-05-08 或者 Date格式 的日期格式
 * @returns {string} 形如 20240508000000 的日期格式
 */
export function formatHandleDateToStorage({
  dateParam,
  isDateRangeStart = false,
  isDateInRangeEnd = false,
}: {
  dateParam: string | Date
  isDateRangeStart?: boolean
  isDateInRangeEnd?: boolean
}): string {
  let date: Date = null
  if (typeof dateParam === 'string') {
    // 将日期字符串转换为Date对象
    date = new Date(dateParam)
  } else {
    date = dateParam
  }

  // 获取年、月、日等信息
  let year = date.getFullYear()
  let month = padZero(date.getMonth() + 1)
  let day = padZero(date.getDate())
  let hours = padZero(date.getHours())
  let minutes = padZero(date.getMinutes())
  let seconds = padZero(date.getSeconds())

  // 拼接字符串
  let formattedDate = year + month + day + hours + minutes + seconds
  if (isDateRangeStart) {
    formattedDate = year + month + day + '000000'
  }
  if (isDateInRangeEnd) {
    formattedDate = year + month + day + '235959'
  }

  return formattedDate
}

export function isDateInRange(
  date: string,
  startDate: string,
  endDate: string
) {
  return date >= startDate && date <= endDate
}

/**
 * 将Date格式的日期转换为形如 20240508000000 的格式
 * @param date Date格式的日期
 * @returns
 */
export function formatDate(date: Date) {
  let year = date.getFullYear()
  let month = padZero(date.getMonth() + 1) // getMonth() 返回的月份是从0开始的
  let day = padZero(date.getDate())
  let hour = padZero(date.getHours())
  let minute = padZero(date.getMinutes())
  let second = padZero(date.getSeconds())
  return `${year}${month}${day}${hour}${minute}${second}`
}

/**
 * 根据枚举值和今天的日期获取日期范围
 * @param enumValue 日期范围枚举值
 * @returns
 */
export function getDateRangeByEnumValue(enumValue: string) {
  let today = new Date()
  let start: Date = null
  let end: Date = null

  switch (enumValue) {
    case 'currentMonth':
      // 本月的第一天和最后一天
      start = new Date(today.getFullYear(), today.getMonth(), 1)
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      break
    case 'currentWeek':
      // 本周的第一天（周日）和最后一天（周六）
      let dayOfWeek = today.getDay()
      let diff = today.getDay() - 1
      if (dayOfWeek === 0) diff-- // 如果今天是周日，那么上一周的周日是本周的第一天
      start = new Date(today)
      start.setDate(today.getDate() - diff)
      end = new Date(start)
      end.setDate(start.getDate() + 6)
      break
    case 'pastThreeDays':
      // 今天的日期减去2天
      start = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)
      end = today
      break
    case 'today':
      // 今天的开始和结束
      start = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
        0
      )
      end = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59
      )
      break
    case 'futureThreeDays':
      // 今天的日期加上2天
      start = today
      end = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)
      break
    default:
      throw new Error('Invalid enum value')
  }

  // 格式化日期
  return {
    start: formatDate(start),
    end: formatDate(end),
  }
}
