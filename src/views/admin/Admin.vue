<template>
    <div class="con">
        <AdminSideBar class="sidebar"/>
        <div class="main-content">
            <div class="content-wrapper">
                <router-view v-slot="{ Component }">
                    <component
                        v-if="Component && propsReady"
                        :is="Component"
                        v-bind="propsForComponent"
                    />
                </router-view>
            </div>
        </div>
    </div>
</template>

<script setup>
    import AdminSideBar from '@/components/admin/AdminSideBar.vue';
    import { ref, watchEffect } from 'vue'
    import { useRoute } from 'vue-router'
    import api from '@/api'

    const userList = ref([])
    const propsReady = ref(false)
    const propsForComponent = ref({})

    const route = useRoute()

    watchEffect(async () => {
        propsReady.value = false
        
        const meta = route.meta
        propsForComponent.value = {}

        if (meta.title) {
            propsForComponent.value.title = meta.title
        }

        if (meta.needUserList) {
            console.log('필요?', meta.needUserList)
            const userResponse = await api.get('/api/users/find-all')
            userList.value = userResponse.data.data
            console.log("부모에서 list", userList.value)
            propsForComponent.value.list = userList.value
            console.log('propsFor', propsForComponent.value.list)
        }

        propsReady.value = true
    })
</script>

<style scoped>
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