<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/util/api.js'
import BreadCrumb from '@/components/common/BreadCrumb.vue'
import ProjectLayout from '@/components/layout/ProjectLayout.vue'

const route = useRoute()
const projectName = ref('로딩 중...')
const projectId = route.params.id

onMounted(async () => {
  const res = await api.get(`/api/projects/${projectId}`)
  projectName.value = res.data.data.name
})
</script>

<template>
  <BreadCrumb :items="[
    { text: '프로젝트', to: '/' },
    { text: projectName, to: `/project/${projectId}` }
  ]" />
  <ProjectLayout />
</template>
