<template>
  <div v-if="show" class="modal-backdrop">
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">프로젝트 템플릿화</h3>
        <button class="close-button" @click="$emit('close')">×</button>
      </div>

      <!-- 검색창 -->
      <div class="search-project">
        <input type="text" v-model="search" placeholder="프로젝트명 검색..." />
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
              <th>지연일</th>
              <th>완료일</th>
              <!-- <th>참여 부서</th> -->
            </tr>
          </thead>
          <tbody>
            <tr v-for="project in filteredProjects"
                :key="project?.id"
                :class="{ selected: selected?.id === project?.id }"
                @click="selected = project"
                style="cursor: pointer;"
            >
                <td>
                <input
                    type="radio"
                    :id="`project-${project?.id}`"
                    :value="project"
                    v-model="selected"
                />
                </td>
                <td>{{ project?.name }}</td>
                <td>{{ project?.duration }}일</td>
                <td>{{ project?.taskCount }}</td>
                <td>{{ project?.delayDays }}</td>
                <td>{{ project?.endDate }}</td>
                <!-- <td>
                <span
                    v-for="dept in project?.deptList ?? []"
                    :key="dept?.id"
                    class="badge"
                >
                    {{ dept?.name }} + {{ dept?.count || 10 }}
                </span>
                </td> -->
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
import { ref, computed } from 'vue'

const props = defineProps({
  show: Boolean,
  projects: Array
})

const emit = defineEmits(['select', 'close'])

const search = ref('')
const selected = ref(null)

const filteredProjects = computed(() => {
  return props.projects.filter(p =>
    p.name?.toLowerCase().includes(search.value.toLowerCase())
  )
})

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
.search-project {
  margin: 16px 0;
}
.search-project input {
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
  background: #25bead;
  color: white;
  border: none;
}
.confirm-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
tr.selected {
  background-color: #d1f3ef;
  transition: background-color 0.2s;
}

</style>
