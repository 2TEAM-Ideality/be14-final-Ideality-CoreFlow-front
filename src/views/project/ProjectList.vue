<template>
    <ListLayout title="프로젝트 목록" />
    <div class="content-box">
    프로젝트 리스트 내용
    </div>

</template>

<script setup>
import ListLayout from '@/components/layout/ListLayout.vue';

</script>

<style scoped>
.content-box {
  background-color: #ddd;
  min-height: 600px;
  border-radius: 8px;
  padding: 20px;
}
</style>

