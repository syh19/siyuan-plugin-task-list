import * as API from '@/api'
import * as date from '@/utils/date'
import { addHandleDateToTaskNode } from '@/utils/addInfoToHtmlNode'

/**
 * 为任务节点设置自定义属性：完成时间
 * @param id
 * @param isFinish
 */
const setTaskBlockAttrs = async (id: string, isFinish: boolean) => {
  await API.setBlockAttrs({
    id,
    attrs: {
      /**
       * 这里必须加上 custom- 前缀
       * 关联思源issue：https://github.com/siyuan-note/siyuan/issues/10928
       */
      'custom-plugin-task-list-finished': isFinish
        ? date.getCurrentDateTime()
        : '',
    },
  })
}

/**
 *
 * @param e ws-main的事件参数
 * @returns
 */
export const taskNodeFinishedSetAttrs = (e: any): void => {
  const detailData = e.detail.data
  if (!detailData) return
  const divStr = detailData[0]?.doOperations[0]?.data

  if (!divStr || typeof divStr !== 'string') return

  // <div data-marker="*" data-subtype="t" data-node-id="20240402102312-0rq2x0n" data-type="NodeListItem" class="li protyle-task--done" updated="20240402194853"><div class="protyle-action protyle-action--task" draggable="true"><svg><use xlink:href="#iconCheck"></use></svg></div><div data-node-id="20240402102310-rk7rbp2" data-type="NodeParagraph" class="p" updated="20240402193444"><div contenteditable="true" spellcheck="false">节点内容</div><div class="protyle-attr" contenteditable="false">​</div></div><div class="protyle-attr" contenteditable="false">​</div></div>

  // 创建DOMParser对象
  let parser = new DOMParser()
  // 将字符串解析为DOM元素
  let doc = parser.parseFromString(divStr, 'text/html')
  // 获取最外层的div
  let outerDiv = doc.querySelector('div')

  if (!outerDiv) {
    console.log("siyuan-plugin-task-list: can't find outerDiv")
    return
  }

  // 获取div的class属性
  let divClass = outerDiv?.getAttribute('class')
  // 获取div的data-marker属性
  let divDataMarker = outerDiv?.getAttribute('data-marker')
  // 获取div的data-subtype属性
  let divDataSubtype = outerDiv?.getAttribute('data-subtype')
  // 获取div的data-node-id属性
  let divNodeId = outerDiv?.getAttribute('data-node-id')
  // 获取div的data-type属性
  let divDataType = outerDiv?.getAttribute('data-type')

  if (
    divDataMarker === '*' &&
    divDataSubtype === 't' &&
    divDataType === 'NodeListItem'
  ) {
    // 勾选任务节点
    if (divClass.includes('protyle-task--done')) {
      setTaskBlockAttrs(divNodeId, true)
    }
    // 取消勾选任务节点
    else {
      setTaskBlockAttrs(divNodeId, false)
    }
    setTimeout(() => {
      addHandleDateToTaskNode()
    }, 100)
  }
}
