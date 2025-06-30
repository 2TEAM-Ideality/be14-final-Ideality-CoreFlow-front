
<script setup>
import Breadcrumb from '@/components/common/BreadCrumb.vue';
import ListLayout from '@/components/layout/ListLayout.vue';
import { useUserStore } from '@/stores/userStore.js'
import { useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue';
import api from '@/api';
import ProjectCard from '@/components/project/ProjectCard.vue';

const router = useRouter()
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
const userStore = useUserStore()


onMounted(async () => {
  try {
    const res = await api.get('/api/projects/list');
    const fetched = res.data.data;

    // DELETED 상태 제거
    const filtered = fetched.filter(p => p.status !== 'DELETED');

    projectList.value = filtered;
    fullProjectList.value = filtered;
  } catch(err){
    console.error('프로젝트 목록 조회 실패', err);
  }
})

// 페이징
const currentPage    = ref(1)
const itemsPerPage   = 6
const totalPages     = computed(() =>
  Math.max(1, Math.ceil(projectList.value.length / itemsPerPage))
)
const paginatedProjects = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return projectList.value.slice(start, start + itemsPerPage)
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

const goToCreateProject = () => {
  router.push('/project/create')
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
  currentPage.value = 1
  // if()
}


const removeProjectFromList = (deletedId) => {
  projectList.value = projectList.value.filter(p => p.id !== deletedId);
  fullProjectList.value = fullProjectList.value.filter(p => p.id !== deletedId);
};


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
            <button @click="showFilterDropdown = !showFilterDropdown" class="filter-btn" style="margin-right: 10px; ">
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
                    <input type="checkbox" :checked="selectedStatuses.includes(option.value)" readonly 
                    style="margin-right: 10px;"
                    />
                    {{ option.label }}
                  </li>
                  <li @click="() => { selectedStatuses = []; applyFilter() }">전체 해제</li>
              </ul>
            </div>
          </div>
        </div>
          <v-btn prepend-icon="mdi-plus"  class="create-btn" @click="goToCreateProject">
            프로젝트 생성하기
          </v-btn>
      </div>

      <div class="project-list">
        <!-- v-for="project in projectList" -->
        
        <!-- paginatedProjects -->
        <ProjectCard
        v-for="project in paginatedProjects"
        :key="project.id"
        :project="project"
          @deleted="removeProjectFromList"/>
      </div>

      <div class="d-flex justify-center mt-4">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          total-visible="7"
          color="#7578ee"
        />
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
  background-color: #7578ee;
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

