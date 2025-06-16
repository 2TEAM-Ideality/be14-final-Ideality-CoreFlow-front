<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api.js'
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

}

onMounted(fetchTemplate)

const handleTemplateUpdate = async ({ nodeList, edgeList, duration, taskCount }) => {
  const payload = {
    name: templateInfo.value.name,
    description: templateInfo.value.description,
    updatedBy: userStore.id, // createdBy → updatedBy로 수정 필요
    duration,
    taskCount,
    nodeList,
    edgeList
  }

  console.log('📝 템플릿 수정 요청:', payload)

  try {
    await api.put(`/api/template/${templateId.value}`, payload)
    console.log("템플릿 수정 성공")
    router.push(`/template/detail/${templateId.value}`)
  } catch (err) {
    console.error('❌ 템플릿 수정 실패:', err)
    alert('템플릿 수정 중 오류가 발생했습니다.')
  }
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
