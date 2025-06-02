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
    <div class="breadcrumb">프로젝트 &gt; {{ title }}</div>

    <h1 class="page-title">{{ title }}</h1>

    <v-divider class="my-6" />


  </div>
</template>



<style scoped>
.list-layout {
  padding: 40px 60px;
}
.breadcrumb {
  font-size: 14px;
  color: #888;
  margin-bottom: 16px;
  text-align: left;
}
.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
}

</style>