<template>
  <v-container fluid class="container">
    <v-row class="three-column" no-gutters>
      <!-- 왼쪽 영역 -->
      <v-col class="col-left">
        <slot name="left" />
      </v-col>

      <!-- 중앙 콘텐츠 영역 -->
      <v-col class="col-center">
        <slot name="center" />
      </v-col>

      <!-- 오른쪽 영역 -->
      <v-col class="col-right">
        <slot name="right" />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.container {
  padding: 0;
  height: 100%;
  min-height: 100vh;
}
.three-column {
  gap: 0;
  display: flex;
}
.col-left {
  flex: 1.8;
}
.col-center {
  flex: 8.4;
}
.col-right {
  flex: 1.8;
}
</style>
