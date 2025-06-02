<template>
  Home
  <br />
  <button @click="goToPipe">파이프 페이지로 이동</button>
</template>

<script setup>
    import { useRouter } from 'vue-router'; 

    const router = useRouter(); 

    const goToPipe = () => {
        router.push("/test/pipe")
    }
</script>

<style scoped>
</style>