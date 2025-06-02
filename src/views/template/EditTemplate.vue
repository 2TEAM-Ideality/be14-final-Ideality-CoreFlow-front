<script setup lang="ts">
import BasicLayout from '@/components/layout/BasicLayout.vue';
import { useRouter } from 'vue-router'

const router = useRouter()

function goToEditPage() {
  router.push('/template/edit/task')
}
</script>

<template>
    <BasicLayout>
        <template #main >
           <div style="height: 100vh">
            <h3>템플릿 이름</h3>
            <button @click="goToEditPage">템플릿 편집</button>
           </div>
           
        </template>

        <!-- 오른쪽 영역 -->
        <template #sidebar>

            데이터 필요
        </template> 
    </BasicLayout>
</template>