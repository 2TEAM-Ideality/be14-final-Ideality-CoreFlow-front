<!-- src/components/layout/ThreeColumnLayout.vue -->
<template>
  <v-container fluid class="container">
    <v-row class="three-column" no-gutters align="stretch">
      <!-- 왼쪽 영역 -->
      <v-col cols="2">
        <slot name="left" />
      </v-col>

      <!-- 중앙 콘텐츠 영역 -->
      <v-col cols="8" >
        <slot name="center" />
      </v-col>

      <!-- 오른쪽 영역 -->
      <v-col cols="2">
        <slot name="right" />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.container {
  padding: 0;
  height: 100vh;
}
.three-column {
    gap: 0;
}
</style>