import { defineStore } from 'pinia'

export const useUpdateStore = defineStore('update', {
  state: () => ({
    shouldRefreshSearchHistory: false,  // 자료 검색 탭 갱신 필요 여부 
  }),
  actions: {
    triggerSearchHistoryUpdate() {
      this.shouldRefreshSearchHistory = true
    },
    acknowledgeSearchHistoryUpdate() {
      this.shouldRefreshSearchHistory = false
    }
  }
})