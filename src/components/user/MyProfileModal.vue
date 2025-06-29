<template>
  <div class="modal-overlay">
    <div class="modal">
        <div style="align-self: flex-start ">
            <h2 >마이프로필</h2>
        </div>

      <div style="display: flex; flex-direction: row; gap: 20px; align-items: center; justify-content: flex-start; width:100%;">
        <!-- 프로필 이미지 -->
        <img :src="userStore.profileImage" alt="프로필 이미지" class="profile-img" />

        <div style="display: flex; flex-direction: column; gap: 10px;">
        <p class="name">{{ userStore.name }}</p>
        <div>{{ userStore.deptName }} {{ userStore.jobRankName }} {{ userStore.jobRoleName }}</div>
        </div>
      </div>
    

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
        border-radius: 5px;
        background-color: white;
        padding: 3%;
    }
    .profile-img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    margin: 16px 0;
    border: solid 1px lightgray;
    }
    .name {
        font-size: 24px;
        font-weight: bold;

    }
    
</style>