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
           템플릿 수정 <br>
           <button @click="goToEditPage">템플릿 편집</button>
        </template>

        <!-- 오른쪽 영역 -->
        <template #sidebar>

            데이터 필요
        </template> 
    </BasicLayout>
</template>