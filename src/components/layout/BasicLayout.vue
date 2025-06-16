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
  grid-template-columns: 9fr 3fr; 
  padding-left: 15%;
  padding-right: 15%;
  padding-top : 5%;
  padding-bottom: 5%;
}

.template-main {
  min-width: 0;
  padding-right: 8%;
}

.template-sidebar {
  padding-left: 15%;
  border-left: 1px solid rgba(0, 0, 0, 0.1);
}
</style>
