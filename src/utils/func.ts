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
