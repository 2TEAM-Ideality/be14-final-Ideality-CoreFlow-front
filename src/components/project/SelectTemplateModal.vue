<template>
  <div v-if="show" class="modal-backdrop">
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">템플릿 선택</h3>
        <button class="close-button" @click="$emit('close')">×</button>
      </div>

      <!-- 검색창 -->
      <div class="search-template">
        <input type="text" v-model="search" placeholder="템플릿명 검색..." />
      </div>

      <!-- 테이블 형식 목록 -->
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>프로젝트명</th>
              <th>총 소요일</th>
              <th>전체 태스크</th>
              <th>생성일</th>
              <th>생성자</th>
              <!-- <th>참여 부서</th> -->
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="template in filteredTemplates"
              :key="template?.id"
              :class="{ selected: selected?.id === template?.id }"
              @click="toggleSelection(template)"
              style="cursor: pointer;"
            >
              <td>
                <input
                  type="radio"
                  :id="`template-${template?.id}`"
                  :value="template"
                  v-model="selected"
                />
              </td>
              <td>{{ template?.name }}</td>
              <td>{{ template?.duration }}일</td>
              <td>{{ template?.taskCount }}</td>
              <td>{{ template?.createdAt.split("T")[0] }}</td>
              <td>{{ template?.createdBy }}</td>
            </tr>
            </tbody>

        </table>
      </div>

      <!-- 하단 버튼 -->
      <div class="modal-footer">
        <button class="cancel-btn" @click="$emit('close')">취소</button>
        <button class="confirm-btn" @click="confirmSelection" :disabled="!selected">선택 완료</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  templates: Array
})

const emit = defineEmits(['select', 'close'])

const search = ref('')
const selected = ref(null)

const filteredTemplates = computed(() => {
  return props.templates.filter(p =>
    p.name?.toLowerCase().includes(search.value.toLowerCase())
  )
})

// ✅ show가 false로 바뀌면 선택 초기화
watch(() => props.show, (newVal) => {
  if (!newVal) {
    selected.value = null
    search.value = ''
  }
})

const toggleSelection = (template) => {
  if (selected.value?.id === template.id) {
    selected.value = null
  } else {
    selected.value = template
  }
}

const confirmSelection = () => {
  if (selected.value) {
    emit('select', selected.value)
  }
}


</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal {
  width: 800px;
  min-height: 550px;
  background: white;
  border-radius: 12px;
  padding: 24px;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.close-button {
  font-size: 20px;
  background: none;
  border: none;
  cursor: pointer;
}
.search-template {
  margin: 16px 0;
}
.search-template input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
.table-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 8px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
thead {
  background-color: #f8f8f8;
}
th, td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #eee;
}
.badge {
  display: inline-block;
  background: #f1f1f1;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 12px;
  margin-right: 4px;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}
.cancel-btn,
.confirm-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}
.cancel-btn {
  background: #f1f1f1;
  border: none;
}
.confirm-btn {
  background: #7578ee;
  color: white;
  border: none;
}
.confirm-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
tr.selected {
  background-color: #EEEFFA;
  transition: background-color 0.2s;
}

</style>
