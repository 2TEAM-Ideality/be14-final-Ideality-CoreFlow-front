<template>
  <v-container fluid class="container">
    <v-row class="three-column" no-gutters align="stretch">
      
      <!-- ✅ 왼쪽 영역: 토글 -->
      <v-col v-if="showLeft" cols="2">
        <div class="col-content bg-light">

          <slot name="left" />
        </div>
      </v-col>

      <!-- 중앙 영역 -->
      <v-col :cols="showLeft ? 8 : 10" class="center-col">
        <div class="col-content" :class="{ 'expanded-padding': !showLeft }">
          <v-btn
            size="small"
            icon
            @click="showLeft = !showLeft"
            class="toggle-btn"
            variant="text"
          >
            <v-icon>{{ showLeft ? 'mdi-chevron-left' : 'mdi-chevron-right' }}</v-icon>
          </v-btn>
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


<script setup>
import { ref } from 'vue'

const showLeft = ref(true) // 왼쪽 보임 여부


</script>
<style scoped>
.container {
  padding: 0;
  height: 100vh; /* 뷰포트 기준 전체 높이 */
}

.three-column {
  height: 100%;
}
.col-content.expanded-padding {
  padding-left: 40px; 
  padding-right: 20px;
}
.col-content {
  height: 100%;
  padding: 10px;
  padding-top:50px;
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
.toggle-btn {
  position: absolute;
  top: 60px;
  left: 8px;
  z-index: 20;
  background-color: transparent !important;
  border: none;
  padding: 4px;
  color: #555;
}

.toggle-btn:hover {
  background-color: #f0f0f0;
  border-radius: 50%;
}

</style>
