<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/util/api.js'
import PipePage from '@/views/test/PipePage.vue'
import { useUserStore } from '@/stores/userStore'



const route = useRoute()
const router = useRouter()
const templateId = ref(route.params.id)
const userStore = useUserStore()

const templateInfo = ref(null)
const nodeList = ref([])
const edgeList = ref([])

// 템플릿 데이터 가져오기 
const fetchTemplate = async () => {
    const res = await api.get(`/api/template/${templateId.value}`)
    const data = res.data.data
    console.log(data);

    templateInfo.value = data.templateInfo
    nodeList.value = data.templateData.nodeList
    edgeList.value = data.templateData.edgeList

    // 👉 데이터 로딩 후 변환 함수 호출
    // convertToFlowData()
}

onMounted(fetchTemplate)

const handleTemplateUpdate = async ({ nodeList, edgeList, duration, taskCount }) => {
  const payload = {
    name: templateInfo.value.name,
    description: templateInfo.value.description,
    createdBy: userStore.id,
    duration,
    taskCount,
    nodeList,
    edgeList
  }

  await api.put(`/api/template/${templateId.value}`, payload)
  router.push(`/template/detail/${templateId.value}`)
}

</script>

<template>
  <v-container fluid class="pa-6">
    <div class="text-grey text-body-2 mb-4" style="text-align: left;">
      템플릿 &gt; 템플릿 생성 &gt; 템플릿 편집
    </div>

    <div class="flow-wrapper">
      <!-- 이름 , 노드/엣지 리스트 전달 -->
      <PipePage
        :templateName="templateInfo?.name"
        :nodes="nodeList"
        :edges="edgeList"
        @save="handleTemplateUpdate"
      />
    </div>
  </v-container>
</template>


<style scoped>
.purple--text {
  color: #8b5cf6 !important;
}

.flow-wrapper {
  height: calc(100vh - 300px);
  min-height: 600px;
  width: 100%;
  background-color: #fff;
}
</style>
