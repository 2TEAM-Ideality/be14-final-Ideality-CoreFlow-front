<template>
  <v-container fluid class="layout-container">
    <v-row class="no-gutters">
      <!-- 좌측 영역 (4/12) -->
      <v-col cols="5">
        <slot name="left" />
      </v-col>

      <!-- 우측 영역 (8/12) -->
      <v-col cols="7">
        <slot name="right" />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.layout-container {
  padding: 0;
  height: 100%;
  min-height: 100vh;
}
</style>
