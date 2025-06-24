<template>
  <v-container fluid class="container">
    <v-row class="two-column" no-gutters align="stretch">
      
      <!-- 왼쪽 영역 -->
      <v-col cols="2">
        <div class="col-content bg-light">
          <slot name="left" />
        </div>
      </v-col>

      <!-- 중앙 영역 -->
      <v-col cols="10">
        <div class="col-content">
          <slot name="center" />
        </div>
      </v-col>

    </v-row>
  </v-container>
</template>

<script setup>
// 특별한 로직 없음
</script>

<style scoped>
.container {
  padding: 0;
  height: 100vh;
}

.two-column {
  height: 100%;
}

.col-content {
  height: 100%;
  padding: 10px;
  padding-top: 50px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.bg-light {
  background-color: #F5F5F5;
}
</style>
