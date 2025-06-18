<template>
  <div>
    <div class="tab-row">
      <div class="tab-menu">
        <button
          v-for="tab in tabs"
          :key="tab.name"
          @click="selectedTab = tab.name"
          :class="['tab-button', { active: selectedTab === tab.name }]"
        >
          {{ tab.label }}
        </button>
      </div>
      <button class="schedule-button"  @click="openModal">+ 세부일정 생성</button>
    </div>

    <component :is="selectedComponent" :taskId="taskId" />
  
  </div>
</template>
  
<script setup>
import { ref, computed } from 'vue'
import TaskInfoTab from '@/components/task/TaskInfoTab.vue'
import TaskApprovalTab from '@/components/task/TaskApprovalTab.vue'
import TaskAttachmentTab from '@/components/task/TaskAttachmentTab.vue' 
import DetailTab from './DetailTab.vue'
import { defineEmits } from 'vue'

const emit = defineEmits() // 이벤트를 부모로 전달하기 위한 정의

const openModal = () => {
  console.log("버튼 클릭됨!"); // 클릭 시 로그 찍어보세요
  emit('openModal'); // 부모로 openModal 이벤트 전달
};

const props = defineProps({ taskId: String })

const tabs = [
  { name: 'info', label: '태스크 정보', component: TaskInfoTab },
  { name: 'detail', label: '세부 일정', component: DetailTab},
  { name: 'approval', label: '결재 내역', component: TaskApprovalTab },
  { name: 'attachments', label: '자료 검색', component: TaskAttachmentTab }
]

const selectedTab = ref('info')

const selectedComponent = computed(() => {
  return tabs.find(tab => tab.name === selectedTab.value)?.component || TaskInfoTab
})
</script>
  
<style scoped>
.tab-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}
.tab-menu {
  display: flex;
  gap: 24px;
  border-bottom: 1px solid #ccc;
}
.tab-button {
  font-size: 15px;
  color: #444;
  text-decoration: none;
  padding-bottom: 4px;
  border-bottom: 2px solid transparent;
  transition: 0.2s;
}
.tab-button.active {
  font-weight: bold;
  color: #000;
  border-color: #000;
}
.schedule-button {
  background-color: #00cfc1;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 6px 40px;
  font-size: 14px;
  cursor: pointer;
}
</style>
  