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
  grid-template-columns: 7fr 3fr;
  padding: 40px 80px;
  gap : 32px;
}

.template-main {
  min-width: 0;
}

.template-sidebar {
  padding: 0 2%;
  border-left: 1px solid rgba(0, 0, 0, 0.1);
}

/* 추가된 스타일 */
.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 24px;
}

.tab-menu {
  display: flex;
  gap: 24px;
  border-bottom: 1px solid #ddd;
  margin-bottom: 24px;
}

.tab-button {
  background: none;
  border: none;
  font-size: 15px;
  padding-bottom: 8px;
  cursor: pointer;
  color: #444;
  text-decoration: none;
}

.tab-button.active {
  font-weight: bold;
  color: #000;
  border-bottom: 2px solid #000;
}
</style>
