<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <h2>{{ taskName }}</h2>
      <p>담당부서: {{ deptName }}</p>
      <p>예상마감일: {{ endExpect }}</p>
      <p>지연일: {{ delayDays }}일</p>
      <p>진척률: {{ progressRate }}%</p>
      <button @click="close">닫기</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    visible: Boolean,
    taskName: String,
    deptName: String,
    endExpect: String,
    delayDays: Number,
    progressRate: Number,
  },
  methods: {
    close() {
      this.$emit('update:visible', false);
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 400px;
}

button {
  margin-top: 20px;
}
</style>
