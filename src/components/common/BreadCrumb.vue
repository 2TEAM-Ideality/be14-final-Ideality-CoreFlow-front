<template>
  <v-breadcrumbs :items="formattedItems" style="font-size: 14px;">
    <template #title="{ item }">
      <router-link
        v-if="item.to"
        :to="item.to"
        class="v-link"
      >
        {{ item.text }}
      </router-link>
      <span v-else>{{ item.text }}</span>
    </template>
  </v-breadcrumbs>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true
  }
})

// Vuetify expects { text: '', to: '' } 형태
const formattedItems = computed(() => {
  return props.items.map(item => ({
    text: item.text,
    to: item.to || undefined
  }))
})
</script>

<style scoped>
.v-link {
  text-decoration: none;
  color: inherit;
}
.v-link:hover {
  text-decoration: underline;
}
</style>
