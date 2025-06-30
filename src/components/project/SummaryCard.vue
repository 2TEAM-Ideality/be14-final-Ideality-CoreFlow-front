<template>
    <div class="card" :class="{ warning }">
        <!-- 상단: 정보 제목 -->
        <div class="card-title">{{ title }}</div>

        <!-- 하단: 아이콘+값 -->
        <div class="card-content">
            <div class="icon-wrapper" :style="{ backgroundColor: iconBgColor }">
                <v-icon size="20" :color="iconColor">{{ icon }}</v-icon>
            </div>
            <span class="card-value">{{ value }}</span>
        </div>
    </div>
</template>

<script setup>
import {computed} from 'vue'

const props = defineProps({
    title: String,
    icon: String,
    value: String,
    warning: Boolean,
    iconColor: String
})

const iconBgColor = computed(() => {
    if (!props.iconColor || !props.iconColor.startsWith('#')) return 'rgba(0, 0, 0, 0.05)'
    const hex = props.iconColor.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, 0.15)` // 배경은 약간 더 연하게
})
</script>

<style>
.card{
    background: white;
    border: 1px solid #DEDEDE;
    border-radius: 8px;
    padding: 20px;
    flex:1;
    min-width: 160px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 120px;
}
.card.warning {
    border: 2px solid rgb(235, 165, 165);
    background: rgb(255, 227, 227);
}
.card-title{
    font-size: 20px;
    font-weight: 600;
    color: #555;
    margin-bottom: auto;
    text-align: left;
}
.card-content{
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
}
.card-value{
    font-size: 25px;
    color: #555;
    font-weight: bold;
}
.icon-wrapper{
    height: 30px;
    width: 30px;
    /* background-color: pink; */
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>