<template>
    <div class="container">
        <LoginModal/>
    </div>
</template>

<script setup>
    import LoginModal from '@/components/user/LoginModal.vue'
</script>

<style>
    .container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh; /* 화면 전체 높이 */
        background-color: #f9fafb; /* 배경색 (선택) */
    }
</style>


