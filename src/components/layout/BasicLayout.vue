<template>
  <div class="template-layout">
    <!-- 왼쪽: main -->
    <div class="template-main">
      <slot name="main" />
    </div>

    <!-- 오른쪽: sidebar -->
    <div class="template-sidebar">
      <slot name="sidebar" />
    </div>
  </div>
</template>

<style scoped>
.template-layout {
  display: grid;
  grid-template-columns: 7fr 3fr; /* 7:3 비율 */
  /* gap: 40px; */
  /* padding: 40px 60px; */
}

.template-main {
  min-width: 0;
  background-color: yellow;
}

.template-sidebar {
  padding: 0 2%;
  border-left: 1px solid rgba(0, 0, 0, 0.1);
}
</style>
