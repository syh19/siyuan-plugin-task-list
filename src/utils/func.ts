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
  let hours = dateTime.slice(8, 10)
  let minutes = dateTime.slice(10, 12)
  // let seconds = dateTime.slice(12, 14)

  // return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

/**
 * 解析字符串为键值对
 * 解析节点的自定义属性 ial
 * @param ial
 * @returns
 */
export function parseStringToKeyValuePairs(ial: string) {
  // 使用正则表达式匹配键值对
  const pattern = /(\w[\w-]*)="([^"]*)"/g
  let match: any = {}
  const keyValuePairs = {}

  while ((match = pattern.exec(ial)) !== null) {
    // 将匹配到的键和值添加到对象中
    keyValuePairs[match[1]] = match[2]
  }

  return keyValuePairs
}

/**
 * 判断节点的真实完成状态
 * 不要通过完成时间判断，不然使用插件之前完成的任务就统计不出来了
 * @param params
 * @returns 'todo' | 'done'
 */
// export function findTaskNodeRealStatus(params: {
//   markdown: string
// }): 'todo' | 'done' {
//   return params.markdown.substring(0, 5) === '* [ ]' ? 'todo' : 'done'
// }
