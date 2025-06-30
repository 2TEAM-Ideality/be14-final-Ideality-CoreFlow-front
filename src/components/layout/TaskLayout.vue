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
  height: calc(100vh - 65px); /* 전체 고정 높이 */
  padding: 0;
  box-sizing: border-box;
  overflow: hidden; /* 바깥쪽 스크롤 방지 */
}

.template-main {
  height: 100%;
  overflow-y: auto;
  /* padding: 32px 0; */
  box-sizing: border-box;
}

.template-sidebar {
  height: calc(100vh - 65px);/* ✅ 여기 고정! */
  overflow-y: auto;
  /* padding: 32px 2%; */
  border-left: 1px solid rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  background-color: white;
}

/* 스크롤바 숨김 - Chrome, Edge, Safari */
.template-main::-webkit-scrollbar,
.template-sidebar::-webkit-scrollbar {
  display: none;
}

/* 스크롤바 숨김 - Firefox 등 */
.template-main,
.template-sidebar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
</style>
