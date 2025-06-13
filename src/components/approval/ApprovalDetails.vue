<template>
    <div>
        <div class="header">
            <h3 class="sub-title">
                {{ props.selectedTab === 'received' ? '수신' : '발신'}}
            </h3>
            <button @click="$emit('close')" class="close-btn">X</button>
        </div>
        <div class="divide"/>
        <div class="main-content">
            <div class="approval-info">
                <div>
                    정보들
                </div>
                <div>
                    기안자와 참조자
                </div>
            </div>
            <div class="content">
                상세 내용 스크롤
            </div>
        </div>
    </div>
</template>

<script setup>
    const props = defineProps ({
        approvalId: Number,
        selectedTab: String
    })
</script>

<style scoped>
    .header {
        display: flex;
        justify-content: space-between;
    }
    .close-btn {
        font-size: 20px;
        color: gray;
        background: none;
        border: none;
        cursor: pointer;
    }
    .divide {
        display: flex;
        border: 1px solid black;
        margin-top: 6px;
        margin-bottom: 6px;
    }
    .main-content {
        padding: 12px;
        height: 100vh;
        border: 1px solid black;
    }
    .approval-info {
        display: flex;
    }
</style>