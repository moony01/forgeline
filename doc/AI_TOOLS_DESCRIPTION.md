# 🤖 AI 에이전트 및 도구 설명 가이드

이 문서는 현재 개발 환경(Windows)에서 확인된 다양한 AI 관련 도구, 설정 폴더, 그리고 실행 파일들의 역할과 용도를 설명합니다.

---

## 1. 사용자 홈 디렉토리 (`C:\Users\mhhan`) 내 설정 폴더
이 폴더들은 주로 각 AI 도구의 **설정(Config), 인증 토큰(Token), 캐시(Cache), 로그(Log)** 등을 저장하는 숨김 폴더입니다. 프로그램이 실행될 때 자동으로 생성되거나 참조됩니다.

| 폴더명 | 역할 및 설명 | 비고 |
| :--- | :--- | :--- |
| **`.antigravity`** | **Google Antigravity 에이전트**<br>현재 사용 중인 AI 에이전트의 '두뇌'에 해당합니다. 대화 기록, 작업 컨텍스트, 단기/장기 기억 데이터가 저장됩니다. | **핵심 폴더** (삭제 시 기억 소실) |
| **`.gemini`** | **Google Gemini CLI**<br>터미널에서 사용하는 `gemini` 명령어 도구의 설정 및 인증 정보가 저장되는 곳입니다. | |
| **`.cursor`** | **Cursor AI 에디터**<br>VS Code를 포크하여 만든 AI 전용 코드 에디터인 'Cursor'의 로컬 설정 및 데이터 폴더입니다. | |
| **`.claude`** | **Anthropic Claude**<br>Claude AI 관련 도구(CLI 또는 데스크탑 앱)가 사용하는 설정 폴더입니다. | |
| **`.codex`** | **OpenAI Codex**<br>OpenAI의 Codex 모델을 사용하는 도구(주로 구형 VS Code Extension 등)의 데이터 폴더입니다. | 현재 미사용 시 삭제 가능 |

---

## 2. NPM Global 패키지 (`AppData\Roaming\npm`) 내 실행 파일
이 파일들은 시스템 전역(Global)에 설치되어, 터미널(CMD, PowerShell) 어디서든 명령어로 실행할 수 있는 **도구(Executable)**들입니다.

| 실행 파일명 | 역할 및 설명 | 사용 예시 |
| :--- | :--- | :--- |
| **`gemini`** | **Gemini CLI 도구**<br>터미널에서 직접 Gemini AI에게 질문하거나 코드를 요청할 수 있게 해주는 명령어 도구입니다. | `gemini chat`<br>`gemini "코드 설명해줘"` |
| **`mcp-server-github`** | **MCP (Model Context Protocol) 서버**<br>AI 에이전트가 외부 시스템(여기서는 GitHub)과 소통하기 위한 표준 프로토콜 서버입니다. AI가 GitHub의 이슈, PR, 코드 등을 읽을 수 있게 해줍니다. | (주로 에이전트가 내부적으로 호출함) |
| **`pnpm` / `pnpx`** | **패키지 매니저**<br>AI 도구는 아니지만, Forjex 프로젝트의 모든 의존성(라이브러리)을 설치하고 관리하는 핵심 도구입니다. | `pnpm install`<br>`pnpm run dev` |
| **`tsx`** | **TypeScript 실행기**<br>TypeScript 파일(.ts)을 컴파일 없이 즉시 실행할 수 있게 해주는 도구입니다. | `tsx script.ts` |

---

## 💡 요약
- **홈 디렉토리의 `.` 폴더들**: AI들의 **"기억 저장소"** (지우면 설정/로그가 날아감)
- **npm 폴더의 파일들**: AI들의 **"실행 도구"** (지우면 명령어가 안 먹힘)

> **참고:** Forjex 포터블 설치 시 `npm` 폴더의 도구들은 자동으로 세팅되지만, 홈 디렉토리의 설정 폴더들은 각 도구를 처음 실행할 때 생성됩니다.
