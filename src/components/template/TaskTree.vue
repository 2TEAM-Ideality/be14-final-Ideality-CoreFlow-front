<template>
  <div class="task-tree">
    <div
      v-for="(node, index) in structuredNodes"
      :key="node.id"
      :style="{ marginLeft: `${node.level * 20}px` }"
      class="task-line"
    >
      <span v-if="index !== 0">↳</span> 
      [{{ node.data.label }}] <strong>{{ node.data.duration }}일</strong>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  nodeList: Array,
  edgeList: Array
})

// 자식 매핑 정보
const childrenMap = {}
props.edgeList.forEach(edge => {
  if (!childrenMap[edge.source]) {
    childrenMap[edge.source] = []
  }
  childrenMap[edge.source].push(edge.target)
})

// 부모 없는 루트 찾기
const rootNodes = props.nodeList.filter(n =>
  !props.edgeList.some(e => e.target === n.id)
)

// 깊이 우선 탐색으로 정렬 + 들여쓰기 레벨 계산
const structuredNodes = []
const visited = new Set()

function dfs(node, level = 0) {
  if (visited.has(node.id)) return
  visited.add(node.id)
  structuredNodes.push({ ...node, level })

  const children = childrenMap[node.id] || []
  children.forEach(childId => {
    const childNode = props.nodeList.find(n => n.id === childId)
    if (childNode) dfs(childNode, level + 1)
  })
}

rootNodes.forEach(root => dfs(root))
</script>

<style scoped>
.task-tree {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 14px;
}
.task-line {
  margin: 6px 0;
}
</style>
