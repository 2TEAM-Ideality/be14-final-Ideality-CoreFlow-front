<template>
  <div class="text-grey text-body-2 mb-4" style="text-align: left;">
        템플릿 &gt; 템플릿 생성 &gt; 템플릿 편집
  </div>
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
  padding: 80px 60px;
}

.template-main {
  min-width: 0;
  padding: 40px 60px;
}

.template-sidebar {
  padding: 40px 60px;
  border-left: 1px solid rgba(0, 0, 0, 0.1);
}
</style>
