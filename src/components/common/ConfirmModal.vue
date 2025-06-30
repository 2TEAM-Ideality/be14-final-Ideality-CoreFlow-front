<!-- ConfirmModal.vue -->
<template>
    <div class="modal-overlay">
        <div class="modal-content">
            <h2 class="modal-title">{{ title }}</h2>
            <p class="modal-message">{{ message }}</p>
        <div class="modal-buttons">
            <button class="btn cancel" @click="$emit('cancel')">취소</button>
            <button class="btn confirm" @click="$emit('confirm')">확인</button>
        </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
title: String,
message: String,
});
</script>

<style scoped>
.modal-overlay {
position: fixed;
top: 0; left: 0; right: 0; bottom: 0;
background: rgba(0, 0, 0, 0.3);
display: flex;
justify-content: center;
align-items: center;
z-index: 9999;
}

.modal-content {
background-color: #fff;
border-radius: 16px;
padding: 32px;
min-width: 320px;
max-width: 400px;
box-shadow: 0 8px 24px rgba(0,0,0,0.15);
text-align: center;
}

.modal-title {
font-size: 20px;
font-weight: 700;
margin-bottom: 16px;
}

.modal-message {
font-size: 15px;
color: #555;
margin-bottom: 24px;
}

.modal-buttons {
display: flex;
justify-content: center;
gap: 16px;
}

.btn {
padding: 10px 24px;
font-size: 14px;
font-weight: 600;
border-radius: 10px;
cursor: pointer;
min-width: 72px;
transition: 0.2s all;
}

.btn.cancel {
background: transparent;
color: #7578ee;
border: none;
}

.btn.confirm {
background: #7578ee;
color: white;
border: none;
}
</style>