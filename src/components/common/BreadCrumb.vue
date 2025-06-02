<!-- src/components/common/Breadcrumb.vue -->
<template>
  <div class="breadcrumb">
    <template v-for="(item, index) in items" :key="index">
      <!-- 링크 처리 -->
      <router-link
        v-if="item.to"
        :to="item.to"
        class="breadcrumb-item"
      >{{ item.text }}</router-link>

      <span v-else class="breadcrumb-item">{{ item.text }}</span>

      <!-- 구분자 -->
      <span v-if="index < items.length - 1" class="separator"> &gt; </span>
    </template>
  </div>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    required: true
  }
})
</script>

<style scoped>
.breadcrumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  font-size: 14px;
  color: #555;
}
.separator {
  margin: 0 4px;
}
.breadcrumb-item {
  white-space: nowrap;
  text-decoration: none;
  color: #555;
}
.breadcrumb-item:hover {
  color: #2b6cb0;
  text-decoration: underline;
}
</style>
