# Forgeline

(프로젝트에 대한 간략한 설명을 여기에 추가하세요.)

## 프로젝트 구조

이 워크스페이스는 pnpm을 사용하여 관리되며, 여러 개의 개별 패키지를 포함하고 있습니다.

- `packages/forgeline-app`: Forgeline의 메인 애플리케이션입니다.
- `packages/forgeline-brief`: Forgeline의 브리핑용 애플리케이션입니다.

## 시작하기

### 사전 준비

- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/installation)

### 설치

프로젝트의 모든 종속성을 설치하려면 루트 디렉토리에서 다음 명령어를 실행하세요.

```bash
pnpm install
```

### 개발 서버 실행

각 애플리케이션은 별도의 포트에서 실행할 수 있습니다.

- **Forgeline App 실행:**

  ```bash
  pnpm dev:app
  ```

  애플리케이션은 `http://localhost:3000` 에서 실행됩니다.

- **Forgeline Brief 실행:**
  ```bash
  pnpm dev:brief
  ```
  애플리케이션은 `http://localhost:3001` 에서 실행됩니다.

## 빌드

각 애플리케이션을 프로덕션용으로 빌드하려면 다음 명령어를 사용하세요.

- **Forgeline App 빌드:**

  ```bash
  pnpm build:app
  ```

- **Forgeline Brief 빌드:**
  ```bash
  pnpm build:brief
  ```
