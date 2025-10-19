# 모노레포(Monorepo) CI/CD 전략 가이드

## 1. 개요

이 문서는 `forgeline` 모노레포 환경에서 여러 애플리케이션(`forgeline-app`, `forgeline-brief`)을 `mydomain.com/forgeline/` 하위 경로에 각각 독립적으로 배포하고 관리하는 CI/CD 파이프라인 전략을 안내합니다.

- **`forgeline-app` 배포 경로:** `mydomain.com/forgeline/forgeline-app/`
- **`forgeline-brief` 배포 경로:** `mydomain.com/forgeline/forgeline-brief/`

이 전략의 핵심은 **하나의 CI/CD Job에서 필요한 모든 애플리케이션을 빌드하고, 최종 결과물을 조립하여 한 번에 배포**하는 '통합 빌드' 방식입니다.

## 2. 핵심 전략: 태그 및 경로 기반 제어

배포는 커밋 메시지 태그와 파일 변경 경로 두 가지 요소에 의해 제어됩니다.

1.  **배포 중지 태그 (가장 높은 우선순위):** `[no-deploy]`
    - 커밋 메시지에 이 태그가 있으면, 파일이 변경되었더라도 모든 배포 프로세스를 **실행하지 않습니다.**

2.  **수동 배포 실행 태그:** `[deploy:앱이름-타겟]`
    - 이 태그가 있으면 파일 변경 여부와 상관없이 해당 앱의 빌드를 **강제로 포함**시킵니다.
    - 예: `[deploy:app-gh-pages]`, `[deploy:brief-gh-pages]`

3.  **자동 감지 (태그 없음, 기본 동작):**
    - 위 태그가 없으면, **변경된 파일 경로를 감지하여** 해당하는 앱의 빌드를 배포에 **자동으로 포함**시킵니다.

## 3. 구현 단계

### 3.1. Nuxt `baseURL` 설정

각 애플리케이션이 자신의 최종 URL 경로를 인지하도록 `nuxt.config.ts`의 `baseURL`을 설정합니다.

- `packages/forgeline-app/nuxt.config.ts`
  ```typescript
  app: {
    baseURL: '/forgeline/forgeline-app/';
  }
  ```
- `packages/forgeline-brief/nuxt.config.ts`
  ```typescript
  app: {
    baseURL: '/forgeline/forgeline-brief/';
  }
  ```

### 3.2. 통합 빌드 워크플로우 (`deploy.yml`)

CI/CD 워크플로우를 단일 `build-and-deploy` Job으로 통합하여, 여러 앱의 빌드 결과물을 조립 후 배포하도록 구성합니다.

```yaml
# .github/workflows/deploy.yml

name: Unified Monorepo Deploy

on:
  push:
    branches:
      - main

jobs:
  changes:
    # ... (기존과 동일: 변경된 패키지 경로 감지)

  build-and-deploy:
    needs: changes
    # [no-deploy] 태그가 없고, 변경된 파일이 있거나 수동 배포 태그가 있을 때 실행
    if: |
      !contains(github.event.head_commit.message, '[no-deploy]') &&
      (needs.changes.outputs.app == 'true' || needs.changes.outputs.brief == 'true' || contains(github.event.head_commit.message, '[deploy:'))
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      # ... (pnpm, node.js 설치)

      - name: Install Build Dependencies
        run: sudo apt-get update && sudo apt-get install -y build-essential python3 python-is-python3

      - name: 의존성 설치
        run: pnpm install

      # 1. 최종 배포물을 담을 staging 디렉터리 생성
      - name: Create staging directory
        run: mkdir -p staging

      # 2. forgeline-brief 빌드 및 복사
      - name: Build forgeline-brief
        if: needs.changes.outputs.brief == 'true' || contains(github.event.head_commit.message, '[deploy:brief')
        run: pnpm --filter forgeline-brief generate
      - name: Copy brief to staging
        if: needs.changes.outputs.brief == 'true' || contains(github.event.head_commit.message, '[deploy:brief')
        run: mkdir -p staging/forgeline-brief && cp -r packages/forgeline-brief/.output/public/* staging/forgeline-brief/

      # 3. forgeline-app 빌드 및 복사 (SSG)
      - name: Build forgeline-app (SSG)
        if: needs.changes.outputs.app == 'true' || contains(github.event.head_commit.message, '[deploy:app')
        run: pnpm --filter forgeline-app build:ssg
      - name: Copy app to staging
        if: needs.changes.outputs.app == 'true' || contains(github.event.head_commit.message, '[deploy:app')
        run: mkdir -p staging/forgeline-app && cp -r packages/forgeline-app/.output/public/* staging/forgeline-app/

      # 4. 통합된 staging 디렉터리를 아티팩트로 업로드
      - name: Upload GitHub Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: 'staging'

      # 5. 아티팩트 배포
      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v2
```

### 3.3. 네이티브 모듈 빌드 환경 설정

리눅스 기반의 CI/CD 실행 환경(예: GitHub Actions의 `ubuntu-latest`)에서 `esbuild`, `@parcel/watcher`와 같이 네이티브 코드를 포함하는 Node.js 모듈을 사용하려면, 해당 코드를 컴파일하기 위한 시스템 수준의 빌드 도구가 필요합니다.

만약 이러한 도구가 없다면 `pnpm install` 과정에서 `Cannot find native binding` 오류가 발생할 수 있습니다.

이를 해결하려면 의존성 설치 전에 `build-essential`(g++, make 등 포함), `python3` 등의 패키지를 설치하는 단계를 워크플로에 명시적으로 추가해야 합니다.

또한, `pnpm` 환경에서 네이티브 의존성 빌드 스크립트가 정상적으로 실행되도록 `package.json`에 다음과 같이 설정을 추가하는 것이 권장됩니다.

```json
// package.json
"pnpm": {
  "onlyBuiltDependencies": [
    "esbuild",
    "@parcel/watcher"
  ]
}
```

## 4. 전체 배포 워크플로우 (End-to-End)

1.  **배포 요청:** 사용자가 AI 에이전트에게 `deploymentTarget` 파라미터(`auto`, `none`, `app-gh-pages` 등)와 함께 배포를 요청합니다.
2.  **커밋 생성:** AI 에이전트가 `deploymentTarget`에 맞는 태그(`[no-deploy]`, `[deploy:...]` 또는 없음)를 포함하여 커밋을 생성하고 푸시합니다.
3.  **CI/CD 트리거:** `main` 브랜치 푸시로 `deploy.yml` 워크플로우가 실행됩니다.
4.  **빌드 및 조립:** `build-and-deploy` Job이 실행되어, 변경되거나 수동 지정된 앱들을 각각 빌드하여 `staging` 디렉터리 아래 각자의 경로(`forgeline-app/`, `forgeline-brief/`)로 조립합니다.
5.  **통합 배포:** 최종적으로 `staging` 디렉터리 전체가 GitHub Pages에 배포되어, 각 앱이 의도한 하위 경로에서 서비스됩니다.
