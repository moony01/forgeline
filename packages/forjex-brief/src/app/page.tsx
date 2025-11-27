"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useMemo, useState } from "react";

type FormData = {
  companyName: string;
  contactName: string;
  email: string;
  sitePurpose: string;
  mainColor: string;
  pages: string[];
  benchmarkUrl: string;
  file: File | null;
};

export default function Home() {
  // 사용자가 입력할 기획서 정보를 관리하는 상태 훅
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    contactName: "",
    email: "",
    sitePurpose: "기업소개",
    mainColor: "#2563EB",
    pages: [],
    benchmarkUrl: "",
    file: null,
  });

  // 체크박스 목록은 렌더마다 새 배열을 만들지 않도록 메모이제이션합니다.
  const pageOptions = useMemo(
    () => ["메인", "회사소개", "제품소개", "문의하기"],
    []
  );

  const handleCheckboxChange = (value: string) => {
    setFormData((prev) => {
      const exists = prev.pages.includes(value);
      const nextPages = exists
        ? prev.pages.filter((page) => page !== value)
        : [...prev.pages, value];
      return { ...prev, pages: nextPages };
    });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setFormData((prev) => ({ ...prev, file }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // 제출 로직은 추후 API 연동 시 대체, 현재는 입력값 확인을 위해 알림/로그를 사용
    // eslint-disable-next-line no-console
    console.log("Form Data:", JSON.parse(JSON.stringify(formData)));
    alert("기획서가 제출되었습니다.");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="mx-auto max-w-2xl px-6 py-10 bg-white">
        {/* 헤더 영역: 안내 문구 및 시각적 구분선 */}
        <header className="mb-10 text-center">
          <div className="flex justify-start">
            <span className="text-lg font-bold text-blue-600">Forjex</span>
          </div>
          <h1 className="mt-4 text-2xl font-semibold">웹사이트 기획서 입력</h1>
          <p className="text-gray-600">
            고객의 웹사이트 제작 요청 정보를 아래 폼에 입력하세요.
          </p>
          <div className="my-2 mx-auto h-0.5 w-16 bg-pink-500" />
        </header>

        <form onSubmit={handleSubmit}>
          {/* 고객사명 */}
          <div>
            <label
              htmlFor="companyName"
              className="text-sm font-semibold text-gray-700"
            >
              고객사명 *
            </label>
            <input
              id="companyName"
              value={formData.companyName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, companyName: e.target.value }))
              }
              type="text"
              placeholder="회사명을 입력하세요"
              className="mt-1 mb-4 w-full rounded-md border border-gray-300 p-3"
              required
            />
          </div>

          {/* 담당자명 */}
          <div>
            <label
              htmlFor="contactName"
              className="text-sm font-semibold text-gray-700"
            >
              담당자명 *
            </label>
            <input
              id="contactName"
              value={formData.contactName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, contactName: e.target.value }))
              }
              type="text"
              placeholder="담당자 이름을 입력하세요"
              className="mt-1 mb-4 w-full rounded-md border border-gray-300 p-3"
              required
            />
          </div>

          {/* 이메일 */}
          <div>
            <label
              htmlFor="email"
              className="text-sm font-semibold text-gray-700"
            >
              이메일 *
            </label>
            <input
              id="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              type="email"
              placeholder="example@company.com"
              className="mt-1 mb-4 w-full rounded-md border border-gray-300 p-3"
              required
            />
          </div>

          {/* 사이트 목적 */}
          <div>
            <label
              htmlFor="sitePurpose"
              className="text-sm font-semibold text-gray-700"
            >
              사이트 목적 *
            </label>
            <select
              id="sitePurpose"
              value={formData.sitePurpose}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, sitePurpose: e.target.value }))
              }
              className="mt-1 mb-4 w-full rounded-md border border-gray-300 p-3"
              required
            >
              <option>기업소개</option>
              <option>쇼핑몰</option>
              <option>랜딩</option>
            </select>
          </div>

          {/* 메인 컬러 */}
          <div>
            <label
              htmlFor="mainColor"
              className="text-sm font-semibold text-gray-700"
            >
              메인 컬러 *
            </label>
            <div className="mt-1 mb-4 flex items-center gap-2">
              <input
                value={formData.mainColor}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, mainColor: e.target.value }))
                }
                type="color"
                className="h-12 w-12 rounded-md border border-gray-300 p-1"
              />
              <input
                id="mainColor"
                value={formData.mainColor}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, mainColor: e.target.value }))
                }
                type="text"
                placeholder="#2563EB"
                className="w-full rounded-md border border-gray-300 p-3"
                required
              />
            </div>
          </div>

          {/* 페이지 구성 */}
          <div>
            <span className="text-sm font-semibold text-gray-700">
              페이지 구성
            </span>
            <div className="mt-2 mb-4 grid grid-cols-2 gap-2">
              {pageOptions.map((page) => {
                const checked = formData.pages.includes(page);
                return (
                  <label
                    key={page}
                    className="flex items-center space-x-2 rounded-md border border-gray-200 p-2"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleCheckboxChange(page)}
                      className="rounded"
                    />
                    <span>{page}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 밴치마킹 사이트 URL */}
          <div>
            <label
              htmlFor="benchmarkUrl"
              className="text-sm font-semibold text-gray-700"
            >
              밴치마킹 사이트 URL
            </label>
            <input
              id="benchmarkUrl"
              value={formData.benchmarkUrl}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  benchmarkUrl: e.target.value,
                }))
              }
              type="text"
              placeholder="https://example.com"
              className="mt-1 mb-4 w-full rounded-md border border-gray-300 p-3"
            />
          </div>

          {/* 파일 첨부 */}
          <div>
            <label
              htmlFor="fileAttachment"
              className="text-sm font-semibold text-gray-700"
            >
              파일 첨부
            </label>
            <input
              id="fileAttachment"
              type="file"
              onChange={handleFileChange}
              className="mt-1 mb-4 w-full rounded-md border border-gray-300 p-3"
            />
          </div>

          {/* 전송 버튼 */}
          <div className="mt-8 flex justify-center">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-8 py-3 font-bold text-white transition-colors hover:bg-blue-700"
            >
              제출하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
