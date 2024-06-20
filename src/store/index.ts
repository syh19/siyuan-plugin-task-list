import { defineStore } from 'pinia'
import * as API from '../api/index'

export const useGlobalStore = defineStore('global', {
  state: () => ({
    currentDocInfo: { id: '', rootID: '', name: '' },
    currentBoxInfo: { box: '', name: '' },
    currentWorkSpaceName: '',
    currentThemeMode: 'light',
  }),

  actions: {
    async setCurrentDocInfo(id: string) {
      const docInfo: any = await API.getDocInfo({ id })
      this.currentDocInfo = docInfo.data
    },

    async setCurrentBoxInfo(notebook: string) {
      const boxInfo: any = await API.getNotebookConf({ notebook })
      this.currentBoxInfo = boxInfo.data
    },

    setCurrentWorkSpaceName() {
      const workSpaceName: string = document
        .getElementById('toolbar')
        .querySelector('#barWorkspace .toolbar__text').innerHTML

      this.currentWorkSpaceName = workSpaceName
    },

    setCurrentThemeMode() {
      this.currentThemeMode =
        document.documentElement.getAttribute('data-theme-mode')
    },
  },
})
