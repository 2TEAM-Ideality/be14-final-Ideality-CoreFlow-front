<template>
    <div class="dept-tree">
        <!-- 부서 목록 -->
        <li v-for="dept in tree" :key="dept.id">
            <div @click="toggle(dept.id), $emit('click-dept', dept.id)" class="node">
                ㄴ{{ dept.name }}
                <span v-if="dept.children?.length"></span>
            </div>

            <!-- 하위 부서 트리 -->
            <DeptTree
                v-if="expandedIds.includes(dept.id)"
                :tree="dept.children"
                :expanded-ids="expandedIds"
                @toggle="$emit('toggle', $event)"
                @click-dept="$emit('click-dept', $event)"
            />
        </li>
    </div>
</template>

<script setup>
    import { defineProps, defineEmits } from 'vue'

    const props = defineProps({
        tree: Array,
        expandedIds: Array
    })

    const emit = defineEmits(['toggle'])

    function toggle(id) {
        emit('toggle', id)
    }
</script>

<style>
    .dept-tree {
        list-style: none;
        padding-left: 16px;
    }

    .node {
        cursor: pointer;
        padding: 4px 0;
    }
</style>