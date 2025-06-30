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
            <!-- download 버튼 -->
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
        <td v-for="header in headers" :key="header.key" :class="{ 'action-cell': header.key === 'actions' }">
          <!-- 파일 다운로드 버튼 -->
          <template v-if="header.key === 'link'">
            <v-btn
              icon
              variant="text"
              @click="handleDownload(item.attachmentId, item.name)"
            >
              <v-icon>mdi-download</v-icon>
            </v-btn>
          </template>

          <!-- taskName인 경우 라우팅 처리 -->
          <template v-else-if="header.key === 'taskName'">
            <router-link
              :to="`/task/${item.taskId}`"
              style="color: #1976D2; text-decoration: underline; cursor: pointer;"
            >
              {{ item[header.key] }}
            </router-link>
          </template>

           <!-- 삭제 버튼 추가 -->
          <template v-else-if="header.key === 'actions'">
            <v-btn
              icon
              variant="text"
              color="red"
              @click="$emit('delete', item)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>

          <!-- 그 외 일반 텍스트 -->
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
        color="#7578ee"
        density="comfortable"
      />
    </v-row>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import api from '@/api';

const props = defineProps({
  headers: {
    type: Array,
    required: true
  },
  items: {
    type: Array,
    required: true
  }
})



const selectAll = ref(false)
const currentPage = ref(1)
const itemsPerPage = 15

// props.items로부터 데이터 사용
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return props.items.slice(start, start + itemsPerPage)
})

const pageCount = computed(() => Math.ceil(props.items.length / itemsPerPage))

function toggleAll(value) {
  paginatedItems.value.forEach(item => (item.selected = value))
}

const handleDownload = async (attachmentId, originName) => {
  try {
    const res = await api.get(`/api/attachment/${attachmentId}/download`, {
      responseType: 'text' // 문자열 그대로 받기
    });

    const s3Url = res.data; // 그냥 URL 하나만 들어있는 응답

    // 1. 다운로드 트리거
    const a = document.createElement('a');
    a.href = s3Url;
    a.download = originName; // 선택: 없으면 S3의 Content-Disposition 따라감
    document.body.appendChild(a);
    a.click();
    a.remove();

  } catch (error) {
    console.error('S3 다운로드 URL 요청 실패:', error);
  }
};

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
.action-cell {
  width: 40px;
  min-width: 30px;
  text-align: center;
  padding: 0;
}
</style>
