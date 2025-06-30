import { defineStore } from 'pinia'

// state, actions 를 한 곳에서 관리해야 함.

export const useUpdateStore = defineStore('update', {
  state: () => ({
    shouldRefreshSearchHistory: false,
    shouldRefreshDeptList: false,
    shouldRefreshTaskInfo: false,
  }),
  actions: {
    // 자료 검색 탭 갱신
    triggerSearchHistoryUpdate() {
      this.shouldRefreshSearchHistory = true
    },
    acknowledgeSearchHistoryUpdate() {
      this.shouldRefreshSearchHistory = false
    },

    // 부서 목록 갱신
    triggerDeptListUpdate() {
      this.shouldRefreshDeptList = true
    },
    acknowledgeDeptListUpdate() {
      this.shouldRefreshDeptList = false
    },

    // 태스크 정보 갱신
    triggerTaskInfoUpdate() {
      console.log('태스크 정보 업데이트 필요!')
      this.shouldRefreshTaskInfo = true
    },
    acknowledgeTaskInfoUpdate() {
      this.shouldRefreshTaskInfo = false
    },
  }
})