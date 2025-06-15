
<script setup>
import Breadcrumb from '@/components/common/BreadCrumb.vue';
import ListLayout from '@/components/layout/ListLayout.vue';

import { ref, onMounted } from 'vue';
import api from '@/api';
import ProjectCard from '@/components/project/ProjectCard.vue';

const projectList = ref([])
const searchKeyword = ref('')
const fullProjectList = ref([])

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
          <div>
            <button>
              <v-icon class="filter-icon" size="18">mdi-filter</v-icon>필터
            </button>
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
</style>

