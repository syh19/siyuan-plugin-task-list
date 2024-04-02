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
