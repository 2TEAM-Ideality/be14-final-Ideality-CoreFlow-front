<template>
  <div style="display: flex; justify-content: center; align-items: center; height: 100%;">
    <l-zoomies
      size="80"
      stroke="5"
      bg-opacity="0.1"
      speed="1.75"
      color="#7578ee"
    />
  </div>
</template>

<script setup>
import { zoomies } from 'ldrs/zoomies'
zoomies.register()
</script>