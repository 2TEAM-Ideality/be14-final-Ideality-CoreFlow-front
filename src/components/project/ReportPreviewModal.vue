<template>
  <v-dialog v-model="visible" max-width="900" persistent>
    <v-card>
      <v-toolbar class="toolbar-linear" dark>
        <v-toolbar-title>📄 프로젝트 분석 리포트</v-toolbar-title>
        <v-spacer />

        <!-- ✅ 다운로드 버튼 추가 -->
        <v-btn
          icon
          :disabled="!blobUrl"
          @click="downloadPdf"
          title="다운로드"
        >
          <v-icon>mdi-download</v-icon>
        </v-btn>

        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text style="height: 80vh; overflow-y: auto;">
        <vue-pdf-embed
          v-if="blobUrl"
          :source="blobUrl"
          style="width: 100%;"
        />
        <div v-else>PDF 로딩 중...</div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import VuePdfEmbed from 'vue-pdf-embed'

const props = defineProps({
  modelValue: Boolean,
  blob: Blob,
  fileName: {
    type: String,
    default: 'project-report.pdf'
  }
})
const emit = defineEmits(['update:modelValue'])

const visible = ref(props.modelValue)
const blobUrl = ref(null)

watch(() => props.modelValue, val => {
  visible.value = val
})

watch(() => visible.value, val => {
  emit('update:modelValue', val)
})

watch(() => props.blob, val => {
  if (val) {
    blobUrl.value = URL.createObjectURL(val)
  }
})

const close = () => {
  visible.value = false
}


// ✅ PDF 다운로드 함수
const downloadPdf = () => {
  if (!props.blob) return

  const link = document.createElement('a')
  link.href = URL.createObjectURL(props.blob)
  link.download = props.fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped>
.toolbar-linear {
  background: linear-gradient(to right, #6b6ee9, #a57aff);
  color: white;
}
</style>