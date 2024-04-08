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
 * 解析节点的自定义属性
 * @param ial
 * @returns
 */
export function parseNodeCustomIal(ial: string) {
  const regex = /(?:{: |}|")/g
  ial = ial.replace(regex, '') // 去除不需要的字符
  const pairs = ial.split(/\s+/) // 分割字符串成键值对
  const obj = {}
  pairs.forEach((pair) => {
    const [key, value] = pair.split('=')
    obj[key] = value.replace(/"/g, '') // 去除双引号
  })
  return obj
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
