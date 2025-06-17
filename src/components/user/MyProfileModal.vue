<template>
    <div class="modal-overlay">
        <div class="modal">
            <h1>마이프로필</h1>
            {{userStore.name}}


            <div class="modal-actions">
                <button class="option-btn change-btn">변경</button>
                <button class="option-btn cancel-btn" @click="close">취소</button>
            </div>
        </div>

    </div>
</template>


<script setup>
import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore(); 


  const emit = defineEmits(['close'])

  function close() {
        emit('close')
    }
</script>

<style scoped>
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    .modal {
        position: relative;
        width: 500px;
        min-height: 500px;
        display: flex;
        align-items: center;
        flex-direction: column;
        border-radius: 20px;
        background-color: white;
    }
</style>