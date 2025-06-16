<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api.js'
import PipePage from '@/views/test/PipePage.vue'
import { useUserStore } from '@/stores/userStore'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const templateId = ref(route.params.id)
const templateName = ref('') 
const templateInfo = ref(null)
const nodeList = ref([])
const edgeList = ref([])
const userId = computed(() => userStore.id)



const handleTemplateSave = async ({ nodeList, edgeList, duration, taskCount }) => {
    const payload = {
        name: templateName.value,
        description: '...',
        createdBy: userStore.id, 
        duration,
        taskCount,
        nodeList,
        edgeList
    }

    try {
        await api.post('/api/template', payload)
        alert('템플릿이 저장되었습니다.')
        router.push('/template')
    } catch (e) {
        console.error(e)
        alert('템플릿 저장 중 오류가 발생했습니다.')
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
            v-model:templateName="templateName"
            :nodes="nodeList"
            :edges="edgeList"
            @save="handleTemplateSave"
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