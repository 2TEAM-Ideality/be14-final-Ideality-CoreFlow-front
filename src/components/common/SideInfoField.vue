<template>
  <div class="sidebar-field">
    <div class="sidebar-section-label">{{ label }}</div>
    <input
      type="text"
      class="sidebar-input"
      :value="value"
      :readonly="readonly"
    />
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: String,
  readonly: {
    type: Boolean,
    default: true
  }
});
</script>

<style scoped>
.sidebar-field {
  margin-bottom: 12px;
}
.sidebar-section {
  display:flex;
  flex-direction : column;
  gap: 30px;
  border-radius: 20px;
}

.sidebar-section-label {
  font-weight: 500;
  font-size: 15px;
  margin-bottom : 10px;
}

.sidebar-input {
  width: 100%;
  padding: 12px 16px;
  height : 40px;
  font-size: 14px;
  font-family: 'Inter';
  border: 1px solid #D9D9D9;
  border-radius: 8px;
  background-color: #FFFFFF;
  color: #1E1E1E;
}

</style>
