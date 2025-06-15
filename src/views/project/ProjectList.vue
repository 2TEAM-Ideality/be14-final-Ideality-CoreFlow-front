
<script setup>
import Breadcrumb from '@/components/common/BreadCrumb.vue';
import ListLayout from '@/components/layout/ListLayout.vue';

import { ref, onMounted } from 'vue';
import api from '@/api';
import ProjectCard from '@/components/project/ProjectCard.vue';

const projectList = ref([])
onMounted(async () => {
  try {
    const res = await api.get('/api/projects/list');
    projectList.value = res.data.data;
  } catch(err){
    console.error('프로젝트 목록 조회 실패', err);
  }
})

</script>

<template>


    <ListLayout title="프로젝트 목록" >
      <div class="search-bar">
        <input type="text" placeholder="프로젝트 검색"/>
        <button>filter</button>
        <button class="create-btn">+ 프로젝트 생성하기</button>
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
.content-box {
  background-color: #ddd;
  min-height: 600px;
  border-radius: 8px;
  padding: 20px;
}
.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
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
</style>

