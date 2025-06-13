<template>
    <div>
        <h2>✅ Task Info Tab Loaded</h2>
        <p>taskId: {{ taskId }}</p>
        </div>
    </template>
    
<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const taskId = route.params.taskId
</script>