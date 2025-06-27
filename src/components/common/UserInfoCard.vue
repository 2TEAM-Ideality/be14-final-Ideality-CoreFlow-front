<template>
    <div class="user-info">
        <v-avatar size="24" class="user-avatar">
            <template v-if="profileImage">
                <img :src="profileImage" alt="프로필 이미지" class="avatar-image">
            </template>
            <template v-else>
                <v-icon size="24">mdi-account</v-icon>
            </template>
        </v-avatar>
        <div class="user-text">
            <div class="user-name">{{ name }}</div>
                -
            <div class="user-meta">{{ dept }}/{{ role }}</div>
        </div>
    </div>
    
</template>

<script setup>

defineProps({
    name: String,
    dept: String,
    role: String,
    profileImage: String
})
</script>

<style scoped>
.user-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.user-avatar {
    background-color: #eee6ff;
}

.user-text {
    font-size: 12px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

.user-name {
    font-weight: 700;
    font-size: 13px;
    color: #444;
}

.user-meta {
    font-size: 13px;
    color: #999;
}

.avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%; /* 원형 유지 */
}
</style>