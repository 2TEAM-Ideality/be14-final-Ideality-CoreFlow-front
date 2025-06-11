
<script setup>
import Breadcrumb from '@/components/common/BreadCrumb.vue';
import ListLayout from '@/components/layout/ListLayout.vue';
import { useUserStore } from '@/stores/userStore.js'

const userStore = useUserStore()
const token = userStore.accessToken


const downloadPdf = async () => {
  try {
    const response = await api.get('/api/project/report/2');
    // const response = await fetch('/api/project/report/2', {
    //   method: 'GET',
    //   headers: {
    //     'Accept': 'application/pdf',
    //     'Authorization': `Bearer ${token}`
    //   }
    // });

    if (!response.ok) {
      throw new Error('PDF 생성 실패');
    }

    // ✅ 서버에서 전달한 Content-Disposition에서 파일명 추출
    const disposition = response.headers.get('Content-Disposition');
    let filename = 'report.pdf'; // 기본값

    const match = disposition?.match(/filename\*?=UTF-8''(.+)/);
    if (match && match[1]) {
      filename = decodeURIComponent(match[1]);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;  // ✅ 이제 실제 서버 전달 이름으로 저장!
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('PDF 다운로드 오류:', error);
    alert('PDF 생성에 실패했습니다.');
  }
};




</script>

<template>


    <ListLayout title="프로젝트 목록" >

        프로젝트 목록

        <button @click="downloadPdf">PDF 다운로드</button>
    </ListLayout>


</template>



<style scoped>
.content-box {
  background-color: #ddd;
  min-height: 600px;
  border-radius: 8px;
  padding: 20px;
}
</style>

