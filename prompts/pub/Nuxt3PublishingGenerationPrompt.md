🎯 목적:
Nuxt3 기반의 웹사이트 기획서 입력 페이지를 퍼블리싱 형태로 생성해주세요.
이 페이지는 Forgeline의 클라이언트가 웹사이트 제작 요청 정보를 입력하는 “기획서 입력 폼”입니다.

---

🧱 기술 스택

- Framework: Nuxt3 (Composition API)
- Styling: TailwindCSS
- Language: HTML + Vue SFC template syntax
- Output: 1개 단일 파일 — `<template>`, `<script setup>`, `<style>` 구조

---

🎨 디자인 요구사항

1️⃣ 페이지 구조

- 전체 화면 중앙 정렬된 단일 페이지 폼
- 최대 너비: `max-w-2xl`, 양쪽 여백: `mx-auto`, 패딩: `py-10 px-6`
- 배경: 흰색, 글꼴: sans-serif (Tailwind 기본)

2️⃣ 헤더

- 상단 좌측 상단 텍스트 로고: **Forgeline**
  - 색상: `text-blue-600`, 폰트 굵기: `font-bold`, 크기: `text-lg`
- 중앙 정렬 제목: `웹사이트 기획서 입력`
  - 폰트: `font-semibold text-2xl`
  - 아래 설명문: `고객의 웹사이트 제작 요청 정보를 아래 폼에 입력하세요.`
  - 제목 아래 얇은 마젠타색 라인(`bg-pink-500 h-0.5 w-16 mx-auto my-2`)

3️⃣ 입력 폼 필드
모든 입력 항목은 `rounded-md border border-gray-300 p-3 w-full mb-4` 스타일 적용.

| 항목명              | 타입                         | placeholder                           | 비고          |
| ------------------- | ---------------------------- | ------------------------------------- | ------------- |
| 고객사명            | text                         | 회사명을 입력하세요                   | \*필수        |
| 담당자명            | text                         | 담당자 이름을 입력하세요              | \*필수        |
| 이메일              | email                        | example@company.com                   | \*필수        |
| 사이트 목적         | select                       | 기업소개 / 쇼핑몰 / 랜딩              | \*필수        |
| 메인 컬러           | color + text input 병렬 구성 | #2563EB                               | \*필수        |
| 페이지 구성         | checkbox group               | 메인 / 회사소개 / 제품소개 / 문의하기 | 다중선택 가능 |
| 밴치마킹 사이트 URL | text                         | https://example.com                   | 선택 입력     |
| 파일 첨부           | file                         | (파일 선택)                           | 선택 입력     |

각 항목 위에는 라벨을 `text-sm font-semibold text-gray-700` 스타일로 표시해주세요.

4️⃣ 전송 버튼

- 위치: 폼 맨 아래 중앙 정렬 (`flex justify-center mt-8`)
- 버튼 스타일:
