<template>
  <v-container class="text-center py-10" style="display: flex; flex-direction: column; justify-content: center;">
    <div style="background-color: #eee; width: fit-content; border-radius: 50%; padding: 3%; margin: 0 auto;">
      <v-icon :size="iconSize" color="grey">{{ icon }}</v-icon>
    </div>
    <div class="text-h6 mt-4">{{ message }}</div>
    <div class="text-caption text-grey mb-4">
      {{ subMessage }}
    </div>
    <v-btn
      v-if="buttonText && buttonLink"
      :to="buttonLink"
      variant="text"
      color="#7578ee"
      append-icon="mdi-arrow-right"
    >
      {{ buttonText }}
    </v-btn>
  </v-container>
</template>

<script setup>

import { useRoute } from 'vue-router'
const route = useRoute()


defineProps({
  icon: {
    type: String,
    default: 'mdi-folder-outline'
  },
  iconSize: {
    type: [Number, String],
    default: 80
  },
  message: {
    type: String,
    default: '검색 결과가 없습니다.'
  },
  subMessage: {
    type: String,
    default: '조건을 조정해 다시 시도해 주세요.'
  },
  buttonText: {
    type: String,
    default: ''
  },
  buttonLink: {
    type: [String, Object],
    default: ''
  }
})
</script>
