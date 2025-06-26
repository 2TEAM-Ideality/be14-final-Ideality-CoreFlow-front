import { defineStore } from 'pinia'
import api from '@/api'
import dayjs from 'dayjs'

export const useHolidayStore = defineStore('holiday', {
  state: () => ({
    holidaySet: new Set(),  // 'YYYY-MM-DD' 형태로 저장
    holidayList: []
  }),

  actions: {
    async fetchHolidays() {
      try {
        const res = await api.get('/api/holidays')
        const list = res.data?.data?.holidays || []

        this.holidayList = list.map(h => dayjs(h.date).format('YYYY-MM-DD'))
        this.holidaySet = new Set(this.holidayList)

        console.log('✅ 공휴일 로드 완료:', [...this.holidaySet])
      } catch (e) {
        console.error('❌ 공휴일 로딩 실패:', e)
      }
    },

    isHoliday(dateInput) {
        const formatted = dayjs(dateInput).format('YYYY-MM-DD')
        const day = dayjs(formatted).day()

        const isWeekend = day === 0 || day === 6
        const isHoliday = this.holidaySet.has(formatted)

        return isWeekend || isHoliday
    }
  }
})
