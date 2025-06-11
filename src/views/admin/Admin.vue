<template>
    <div class="con">
        <AdminSideBar class="sidebar"/>
        <div class="main-content">
            <div class="content-wrapper">
                <router-view />
            </div>
        </div>
    </div>
</template>

<script setup>
    import AdminSideBar from '@/components/admin/AdminSideBar.vue';
</script>

<style>
    .con {
        display: flex;
        height: calc(100vh - 50px);
        background-color: #F8F8F7; /* 배경색 (선택) */
    }
    .sidebar {
        width: 140px;
        background-color: white;
        border-right: 1px solid #eee;
        height: calc(100vh - 50px);
    }
    .main-content {
        flex: 1;
    }

    .content-wrapper {
        max-width: 1800px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>