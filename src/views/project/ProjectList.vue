
<script setup>
import Breadcrumb from '@/components/common/BreadCrumb.vue';
import ListLayout from '@/components/layout/ListLayout.vue';

import { ref, onMounted } from 'vue';
import api from '@/api';
import ProjectCard from '@/components/project/ProjectCard.vue';

const projectList = ref([])
const searchKeyword = ref('')
const fullProjectList = ref([])
const statusOptions = [
  { label: '전체', value: 'ALL' },
  { label: '시작전', value: 'PENDING' },
  { label: '진행중', value: 'PROGRESS' },
  { label: '완료', value: 'COMPLETED' },
  { label: '취소됨', value: 'CANCELLED'},
  { label: '삭제됨', value: 'DELETED'},
]
const selectedStatuses = ref([])
const showFilterDropdown = ref(false)

onMounted(async () => {
  try {
    const res = await api.get('/api/projects/list');
    projectList.value = res.data.data;
    fullProjectList.value = res.data.data;
  } catch(err){
    console.error('프로젝트 목록 조회 실패', err);
  }
})

const onSearch=()=>{
  const keyword = searchKeyword.value.trim().toLowerCase();
  if(!keyword){
    projectList.value = fullProjectList.value;
    return;
  }
  projectList.value = fullProjectList.value.filter(p=>
    p.name.toLowerCase().includes(keyword)
  )
}

const toggleStatus = (status) => {
  const index = selectedStatuses.value.indexOf(status)
  if (index>-1){
    selectedStatuses.value.splice(index, 1)
  }else{
    selectedStatuses.value.push(status)
  }
  applyFilter()
}

const applyFilter = ()=> {
  const keyword = searchKeyword.value.trim().toLocaleLowerCase();
  let filtered = fullProjectList.value;

  if (selectedStatuses.value.length>0){
    filtered = filtered.filter(p=>
      selectedStatuses.value.includes(p.status)
    )
  }

  if(keyword){
    filtered = filtered.filter(p=>
      p.name.toLowerCase().includes(keyword)
    )
  }
  projectList.value = filtered
  // if()
}

</script>

<template>


    <ListLayout title="프로젝트 목록" >
      <div class="search-bar">
        <div class="left-side">
          <div class="search-input-wrapper">
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="프로젝트 검색"
              @keydown.enter="onSearch"
            />
            <button @click="onSearch">
              <v-icon class="search-icon" size="18">mdi-magnify</v-icon>
            </button>
          </div>
          <div class="filter-wrapper">
            <button @click="showFilterDropdown = !showFilterDropdown" class="filter-btn">
              <v-icon class="filter-icon" size="18">
                {{ selectedStatuses.length > 0 ? 'mdi-filter-menu' : 'mdi-filter-menu-outline' }}
              </v-icon>
              필터
            </button>
            <div v-if="showFilterDropdown" class="filter-dropdown">
                <ul class="filter-list">
                  <li
                    v-for="option in statusOptions.slice(1)" 
                    :key="option.value"
                    :class="{ active: selectedStatuses.includes(option.value) }"
                    @click="() => toggleStatus(option.value)"
                  >
                    <input type="checkbox" :checked="selectedStatuses.includes(option.value)" readonly />
                    {{ option.label }}
                  </li>
                  <li @click="() => { selectedStatuses = []; applyFilter() }">전체 해제</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="create-btn">
          <button >+ 프로젝트 생성하기</button>
        </div>
      </div>

      <div class="project-list">
        <ProjectCard
        v-for="project in projectList"
        :key="project.id"
        :project="project"/>
      </div>
    </ListLayout>


</template>



<style scoped>
.left-side{
  display: flex;
  flex-direction: row;
  align-items: center;
}
.content-box {
  background-color: #ddd;
  min-height: 600px;
  border-radius: 8px;
  padding: 20px;
}
.search-bar {
  display: flex;
  flex-direction: row;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
  justify-content: space-between;
}
.project-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.create-btn {
  background-color: #00c6a7;
  color: white;
  border-radius: 4px;
  padding: 6px 12px;
}
.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  padding: 6px 10px 6px 10px;
  border: 1px solid #ccc; 
  border-radius: 4px;
  width: 300px;
  justify-content: space-between;
}
.search-input-wrapper input {
  flex: 1; /* ✅ 버튼 제외 나머지 공간 전부 차지 */
  border: none;
  padding: 6px 10px;
  font-size: 14px;
  outline: none;
}

.filter-wrapper{
  display: flex;
  flex-direction: row;
  padding: 5px;
}

.filter-dropdown .filter-list {
  list-style: none;         
  display: flex;            
  gap: 4px;               
  padding: 0;
  margin: 0;
}

.filter-dropdown .filter-list li {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: white;
}

.filter-dropdown .filter-list li.active {
  background-color: #84c3ed;
  color: white;
  font-weight: bold;
}

</style>

