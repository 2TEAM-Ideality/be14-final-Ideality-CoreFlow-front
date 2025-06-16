<template>
  <div class="tag">
    {{ categoryName }}
  </div>
</template>

<script setup>
defineProps({
  categoryName: String
})
</script>

<style scoped>
.tag {
  background-color: #EFF1FE;
  color: #372B9A;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 12px;
  width: fit-content;
}
</style>
