<template>
    <div class="sideBar">
        <nav class="sideNav">
            <div class="admin-home">관리자</div>
            <router-link to="/admin/org">조직 관리</router-link>
            <router-link to="/admin/user">사용자 관리</router-link>
        </nav>
    </div>
</template>

<script setup>
    import { RouterLink } from 'vue-router';
</script>

<style>
    .admin-home {
        font-size: 24px;
        font-weight: bold;
    }

    .sideNav {
        padding-top: 30px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 24px;
    }

    .sideNav a {
        text-decoration: none;
        color: #444;
    }

    .sideNav a.router-link-active {
        font-weight: bold;
        color: #2b6cb0;
    }
</style>