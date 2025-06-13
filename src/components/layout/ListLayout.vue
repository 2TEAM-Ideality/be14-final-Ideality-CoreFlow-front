<script setup>
defineProps({
  title: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="list-layout">
    
    <h1 class="page-title">{{ title }}</h1>

    <v-divider class="my-6" />
    <div class="content-box">
        <slot>
            <router-view />
        </slot>
    </div>

  </div>
</template>



<style scoped>
.list-layout {
  padding: 40px 200px;
  min-height: 100vh;
}
.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
}

</style>