<template>
  <div class="sidebar-field">
    <div class="sidebar-section-label">
      <span class="icon-wrapper" v-if="icon">
        <v-icon size="18">{{ icon }}</v-icon>
      </span>
      <span>{{ label }}</span>
    </div>
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
  icon: String,
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

.sidebar-section-label {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: gray;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  margin-top: 1px; /* 살짝 보정 */
}

.sidebar-input {
  width: 100%;
  padding: 12px 16px;
  height: 40px;
  font-size: 14px;
  font-family: 'Inter';
  border: 1px solid #D9D9D9;
  border-radius: 8px;
  background-color: #FFFFFF;
  color: #1E1E1E;
  margin-bottom: 15px;
}
</style>
