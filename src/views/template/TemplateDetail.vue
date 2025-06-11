<template>
  <BasicLayout>
    <template #main>
      <h2 class="page-title">📁 {{ templateInfo?.name }}</h2>

      <p>{{ templateInfo?.description }}</p>
      
      <p><strong>작성자:</strong> {{ templateInfo?.createdBy }}</p>
      <p><strong>소요 기간:</strong> {{ templateInfo?.duration }}일</p>
      <p><strong>사용 중인 프로젝트:</strong> {{ templateInfo?.usingProjects }}</p>
      <p><strong>참여 부서:</strong> 
        {{ templateInfo?.deptList.map(dept => dept.name).join(', ') }}
      </p>
    </template>

    <template #sidebar>
        오른쪽 영역
    </template>
  </BasicLayout>
</template>

<script setup>
import BasicLayout from '@/components/layout/BasicLayout.vue';
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/util/api.js'
const route = useRoute()
const templateId = ref(route.params.id)

const templateInfo = ref(null)
const nodeList = ref([])
const edgeList = ref([])

const fetchTemplate = async () => {
  const res = await api.get(`/api/template/${templateId.value}`)
  const data = res.data.data
  templateInfo.value = data.templateInfo
  nodeList.value = data.templateData.nodeList
  edgeList.value = data.templateData.edgeList
}

onMounted(fetchTemplate)

watch(() => route.params.id, async (newId) => {
  templateId.value = newId
  await fetchTemplate()
})
</script>


<style scoped>
.page-title {
  font-size: 18px;
  font-weight: bold;

}
</style>

