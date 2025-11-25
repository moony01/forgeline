<template>
  <div class="bg-white font-sans">
    <div class="max-w-2xl mx-auto py-10 px-6">
      <!-- Header -->
      <header class="text-center mb-10">
        <div class="flex justify-start">
          <span class="text-blue-600 font-bold text-lg">Forjex</span>
        </div>
        <h1 class="font-semibold text-2xl mt-4">웹사이트 기획서 입력</h1>
        <p class="text-gray-600">고객의 웹사이트 제작 요청 정보를 아래 폼에 입력하세요.</p>
        <div class="bg-pink-500 h-0.5 w-16 mx-auto my-2"></div>
      </header>

      <!-- Form -->
      <form @submit.prevent="submitForm">
        <!-- 고객사명 -->
        <div>
          <label for="companyName" class="text-sm font-semibold text-gray-700">고객사명 *</label>
          <input
            id="companyName"
            v-model="formData.companyName"
            type="text"
            placeholder="회사명을 입력하세요"
            class="rounded-md border border-gray-300 p-3 w-full mt-1 mb-4"
            required
          />
        </div>

        <!-- 담당자명 -->
        <div>
          <label for="contactName" class="text-sm font-semibold text-gray-700">담당자명 *</label>
          <input
            id="contactName"
            v-model="formData.contactName"
            type="text"
            placeholder="담당자 이름을 입력하세요"
            class="rounded-md border border-gray-300 p-3 w-full mt-1 mb-4"
            required
          />
        </div>

        <!-- 이메일 -->
        <div>
          <label for="email" class="text-sm font-semibold text-gray-700">이메일 *</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="example@company.com"
            class="rounded-md border border-gray-300 p-3 w-full mt-1 mb-4"
            required
          />
        </div>

        <!-- 사이트 목적 -->
        <div>
          <label for="sitePurpose" class="text-sm font-semibold text-gray-700">사이트 목적 *</label>
          <select
            id="sitePurpose"
            v-model="formData.sitePurpose"
            class="rounded-md border border-gray-300 p-3 w-full mt-1 mb-4"
            required
          >
            <option>기업소개</option>
            <option>쇼핑몰</option>
            <option>랜딩</option>
          </select>
        </div>

        <!-- 메인 컬러 -->
        <div>
          <label for="mainColor" class="text-sm font-semibold text-gray-700">메인 컬러 *</label>
          <div class="flex items-center gap-2 mt-1 mb-4">
            <input
              v-model="formData.mainColor"
              type="color"
              class="h-12 w-12 p-1 border border-gray-300 rounded-md"
            />
            <input
              id="mainColor"
              v-model="formData.mainColor"
              type="text"
              placeholder="#2563EB"
              class="rounded-md border border-gray-300 p-3 w-full"
              required
            />
          </div>
        </div>

        <!-- 페이지 구성 -->
        <div>
          <label class="text-sm font-semibold text-gray-700">페이지 구성</label>
          <div class="grid grid-cols-2 gap-2 mt-2 mb-4">
            <label
              v-for="page in pageOptions"
              :key="page"
              class="flex items-center space-x-2 p-2 border border-gray-200 rounded-md"
            >
              <input v-model="formData.pages" type="checkbox" :value="page" class="rounded" />
              <span>{{ page }}</span>
            </label>
          </div>
        </div>

        <!-- 밴치마킹 사이트 URL -->
        <div>
          <label for="benchmarkUrl" class="text-sm font-semibold text-gray-700"
            >밴치마킹 사이트 URL</label
          >
          <input
            id="benchmarkUrl"
            v-model="formData.benchmarkUrl"
            type="text"
            placeholder="https://example.com"
            class="rounded-md border border-gray-300 p-3 w-full mt-1 mb-4"
          />
        </div>

        <!-- 파일 첨부 -->
        <div>
          <label for="fileAttachment" class="text-sm font-semibold text-gray-700">파일 첨부</label>
          <input
            id="fileAttachment"
            type="file"
            class="rounded-md border border-gray-300 p-3 w-full mt-1 mb-4"
            @change="handleFileUpload"
          />
        </div>

        <!-- 전송 버튼 -->
        <div class="flex justify-center mt-8">
          <button
            type="submit"
            class="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors"
          >
            제출하기
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive } from 'vue';

  const pageOptions = ref(['메인', '회사소개', '제품소개', '문의하기']);

  const formData = reactive({
    companyName: '',
    contactName: '',
    email: '',
    sitePurpose: '기업소개',
    mainColor: '#2563EB',
    pages: [],
    benchmarkUrl: '',
    file: null,
  });

  function handleFileUpload(event) {
    formData.file = event.target.files[0];
  }

  function submitForm() {
    // Form submission logic will go here
    console.log('Form Data:', JSON.parse(JSON.stringify(formData)));
    alert('기획서가 제출되었습니다.');
  }
</script>

<style>
  /* Global styles if needed, but Tailwind covers most */
  body {
    background-color: #f7fafc;
  }
</style>
