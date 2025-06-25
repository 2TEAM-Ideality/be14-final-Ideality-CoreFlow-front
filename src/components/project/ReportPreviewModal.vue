<template>
  <v-dialog v-model="dialogVisible" max-width="850px" persistent>
    <v-card>
      <v-card-title>
        📄 PDF 미리 보기
        <v-spacer />
        <div>{{ currentPage }} / {{ totalPages }}</div>
      </v-card-title>

      <v-card-text class="d-flex justify-center">
        <v-progress-circular v-if="isLoading" indeterminate color="primary" />
        <canvas v-else ref="canvasRef" style="border: 1px solid #ccc;" />
      </v-card-text>

      <v-card-actions>
        <v-btn text :disabled="currentPage <= 1" @click="prevPage">이전</v-btn>
        <v-btn text :disabled="currentPage >= totalPages" @click="nextPage">다음</v-btn>
        <v-spacer />
        <v-btn text @click="emit('update:modelValue', false)">닫기</v-btn>
        <v-btn color="primary" @click="download">다운로드</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'
import workerSrc from 'pdfjs-dist/legacy/build/pdf.worker.min?url'

// ✅ 워커 설정
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

// Props & Emits
const props = defineProps({
  modelValue: Boolean,
  blob: Blob
})
const emit = defineEmits(['update:modelValue'])

// 상태
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const pdfUrl = ref('')
const pdfDoc = ref(null)
const currentPage = ref(1)
const totalPages = ref(0)
const isLoading = ref(true)
const canvasRef = ref(null)

// blob 변경 감지 → PDF 로딩
watch(
  () => props.blob,
  async (blob) => {
    if (!blob) return
    isLoading.value = true

    try {
      pdfUrl.value = URL.createObjectURL(blob)
      const loadingTask = pdfjsLib.getDocument({ url: pdfUrl.value })
      const doc = await loadingTask.promise

      pdfDoc.value = doc
      totalPages.value = doc.numPages
      currentPage.value = 1

      await renderPage()
    } catch (err) {
      console.error('PDF 로드 실패 ❌:', err)
    } finally {
      isLoading.value = false
    }
  },
  { immediate: true }
)

// 페이지 렌더링
const renderPage = async () => {
  try {
    const page = await pdfDoc.value.getPage(currentPage.value)
    const canvas = canvasRef.value
    const context = canvas.getContext('2d')
    const viewport = page.getViewport({ scale: 1.5 })

    canvas.width = viewport.width
    canvas.height = viewport.height

    const renderContext = {
      canvasContext: context,
      viewport
    }

    await page.render(renderContext).promise
  } catch (err) {
    console.error('❌ PDF 렌더링 중 오류 발생:', err)
  }
}

// 페이지 전환
const prevPage = async () => {
  if (currentPage.value > 1) {
    currentPage.value--
    await renderPage()
  }
}

const nextPage = async () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    await renderPage()
  }
}

// 다운로드
const download = () => {
  const a = document.createElement('a')
  a.href = pdfUrl.value
  a.download = '프로젝트_분석_리포트.pdf'
  a.click()
  URL.revokeObjectURL(pdfUrl.value)
}
</script>
