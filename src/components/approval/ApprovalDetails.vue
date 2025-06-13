<template>
    <div>
        {{ props.selectedTab }}
        {{ props.approvalId }}
    </div>
</template>

<script setup>
    const props = defineProps ({
        approvalId: Number,
        selectedTab: String
    })
</script>

<style scoped>

</style>