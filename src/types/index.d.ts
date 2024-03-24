export type IRange = 'doc' | 'box' | 'workspace'

export type TResponse<T> = {
  code: number
  data: T
  msg: string
}

/** sql接口的返回值类型 */
export type TSqlResItem = {
  alias: string
  box: string
  content: string
  created: string
  fcontent: string
  hash: string
  hapth: string
  ial: string
  id: string
  length: number
  markdown: string
  memo: string
  name: string
  parent_id: string
  path: string
  root_id: string
  sort: number
  subtype: string
  tag: string
  type: string
  updated: string
}
