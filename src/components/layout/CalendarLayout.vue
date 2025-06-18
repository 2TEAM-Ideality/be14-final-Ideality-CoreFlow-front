<template>
  <v-container fluid class="container">
    <v-row class="three-column" no-gutters align="stretch">
      <!-- 왼쪽 영역 -->
      <v-col cols="2">
        <div class="col-content bg-light">
          <slot name="left" />
        </div>
      </v-col>

      <!-- 중앙 콘텐츠 영역 -->
      <v-col cols="8">
        <div class="col-content">
          <slot name="center" />
        </div>
      </v-col>

      <!-- 오른쪽 영역 -->
      <v-col cols="2">
        <div class="col-content right-content">
          <slot name="right" />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
<style scoped>
.container {
  padding: 0;
  height: 100vh; /* 뷰포트 기준 전체 높이 */
}

.three-column {
  height: 100%;
}

.col-content {
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.bg-light {
  background-color: #f5f5f5;
}
.right-content {
  border-left: #e6e6e6 solid 1px;
}
</style>
