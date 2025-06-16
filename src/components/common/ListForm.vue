<template>
    <v-table>
      <thead style="background-color: #F8F8F8; padding: 5px;">
        <tr>
            <th>
                <v-checkbox
                v-model="selectAll"
                @update:modelValue="toggleAll"
                hide-details
                density="compact"
                class="small-checkbox"
                />
            </th>
            <th v-for="header in headers" :key="header.key">
            {{ header.title }}
            </th>
            <th></th> <!-- download 버튼 -->
        </tr>
      </thead>

      <tbody style="font-size: 13px;">
         <tr v-for="(item, index) in paginatedItems" :key="index">
        <td>
            <v-checkbox
            v-model="item.selected"
            hide-details
            density="compact"
            class="small-checkbox"
            />
        </td>
        <td
            v-for="header in headers"
            :key="header.key"
        >
            <template v-if="header.key === 'link'">
            <v-btn
                v-if="item.link"
                :href="item.link"
                icon
                variant="text"
                target="_blank"
                download 
            >
                <v-icon>mdi-download</v-icon>
            </v-btn>
            </template>
            <template v-else>
            {{ item[header.key] }}
            </template>
        </td>
        </tr>
      </tbody>
    </v-table>
    <v-row justify="center" class="mt-4">
      <v-pagination
        v-model="currentPage"
        :length="pageCount"
        total-visible="5"
        color="primary"
        density="comfortable"
      />
    </v-row>
</template>

<script setup>
import { ref, computed, watch } from 'vue'


const selectAll = ref(false)
const currentPage = ref(1)
const itemsPerPage = 15

const headers = ref([
  { title: '파일명', key: 'name' },
  { title: '관련 태스크', key: 'task' },
  { title: '파일 유형', key: 'type' },
  { title: '등록자', key: 'author' },
  { title: '등록일', key: 'date' },
  { title: '링크', key: 'link' } // link가 있으면 아이콘 표시됨
])

const items = ref([
  {
    name: '제품기획서.pdf',
    task: '제품 기획 회의',
    type: 'PDF',
    author: '기획팀 김하늘',
    date: '2025-05-01',
    link: 'https://example.com/download1', // ✅ 링크 있음
    selected: false
  },
  {
    name: '원단스펙시트.xlsx',
    task: '원단 스펙 확정',
    type: 'XLSX',
    author: '소재팀 이지수',
    date: '2025-05-02',
    selected: false // ❌ 링크 없음
  }
])

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return items.value.slice(start, start + itemsPerPage)
})

const pageCount = computed(() => Math.ceil(items.value.length / itemsPerPage))

function toggleAll(value) {
  paginatedItems.value.forEach(item => (item.selected = value))
}

watch(currentPage, () => {
  selectAll.value = false
})
</script>

<style scoped>
.v-table {
  font-size: 14px;
}
.small-checkbox {
  transform: scale(0.8); /* 80% 축소 */
  margin: 0;
  padding: 0;
}
.tbody{
    font-size: 12px;
}
.file-list-container {
  margin-top: 20px;
}
</style>
