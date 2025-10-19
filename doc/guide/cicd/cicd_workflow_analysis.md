# CI/CD 워크플로우 분석: deploy.yml

## 1. 개요

이 문서는 `.github/workflows/deploy.yml` 파일의 구조와 각 단계의 역할을 기술적으로 분석하는 개발자용 가이드입니다.

### 이런 분들이 읽으면 좋아요

- **프로젝트에 참여하는 모든 개발자**
- CI/CD 파이프라인의 코드 레벨 동작 방식이 궁금한 분
- 배포 과정에서 문제가 발생했을 때 원인을 파악하고 싶은 분

> **워크플로우의 핵심 개념이 궁금하신가요?**
> 러너(Runner), 액션(Action), `outputs` 등 GitHub Actions의 근본적인 동작 원리는 `cicd_core_concepts.md` 문서를 먼저 참고하시면 이해에 큰 도움이 됩니다.

---

## 2. 코드 상세 분석

### 2.1. 워크플로우 트리거

```yaml
name: Unified Monorepo Deploy

on:
  push:
    branches:
      - main
```

- `name`: GitHub Actions UI에 표시될 워크플로우의 이름입니다.
- `on.push.branches`: `main` 브랜치에 `push` 이벤트가 발생할 때만 이 워크플로우를 실행합니다.

### 2.2. `changes` Job: 변경 사항 감지

이 Job의 목적은 푸시된 커밋에서 어떤 패키지(`forgeline-app` 또는 `forgeline-brief`)의 파일이 변경되었는지 감지하고, 그 결과를 `outputs`으로 생성하여 다음 Job에 전달하는 것입니다.

```yaml
changes:
  runs-on: ubuntu-latest
  outputs:
    app: ${{ steps.filter.outputs.app }}
    brief: ${{ steps.filter.outputs.brief }}
  steps:
    - uses: actions/checkout@v4
    - uses: dorny/paths-filter@v2
      id: filter
      with:
        filters: |
          app:
            - 'packages/forgeline-app/**'
          brief:
            - 'packages/forgeline-brief/**'
```

- `outputs`: `build-and-deploy` Job에서 사용할 `app`과 `brief`라는 출력 변수를 정의합니다. 이 값은 `filter` 스텝의 출력값으로 채워집니다.
- `uses: dorny/paths-filter@v2`: 파일 경로 변경을 감지하는 외부 액션입니다. `filters`에 정의된 경로 패턴에 따라 `outputs.app`과 `outputs.brief`의 값을 `'true'` 또는 `'false'`로 설정합니다.
- `id: filter`: 이 스텝의 고유 ID를 `filter`로 지정하여, `steps.filter` 구문으로 이 스텝의 결과에 접근할 수 있도록 합니다.

### 2.3. `build-and-deploy` Job: 빌드 및 배포

실제 빌드와 배포를 담당하는 메인 Job입니다.

```yaml
build-and-deploy:
  needs: changes
  if: |
    !contains(github.event.head_commit.message, '[no-deploy]') &&
    (needs.changes.outputs.app == 'true' || needs.changes.outputs.brief == 'true' || contains(github.event.head_commit.message, '[deploy:'))
```

- `needs: changes`: `changes` Job이 완료되기를 기다리며, 해당 Job의 `outputs`을 `needs.changes.outputs` 컨텍스트로 참조할 수 있게 됩니다.
- `if`: Job의 실행 조건입니다. 커밋 메시지에 `[no-deploy]`가 없고, `changes` Job의 결과 변경 사항이 있거나(`app` 또는 `brief`가 `true`), 커밋 메시지에 강제 배포 태그(`[deploy:`)가 있을 때만 실행됩니다.

#### 2.3.1. 빌드 환경 설정

```yaml
steps:
  - name: Checkout
    uses: actions/checkout@v4
  # ... pnpm, node.js 설치 ...
  - name: Install Build Dependencies
    run: sudo apt-get update && sudo apt-get install -y build-essential python3 python-is-python3
  - name: 의존성 설치
    run: pnpm install
```

- Nuxt 앱 빌드에 필요한 pnpm, Node.js, 네이티브 모듈 컴파일용 `build-essential` 및 `python3`를 설치하고, `pnpm install`로 모든 의존성을 설치합니다.

#### 2.3.2. 빌드 및 결과물 통합

```yaml
- name: 최종 배포물을 담을 staging 디렉터리 생성
  run: mkdir -p staging

# forgeline-brief 빌드 및 복사
- name: Build forgeline-brief
  if: needs.changes.outputs.brief == 'true' || contains(github.event.head_commit.message, '[deploy:brief')
  run: pnpm --filter forgeline-brief generate
- name: Copy brief to staging
  # ...
  run: mkdir -p staging/forgeline-brief && cp -r packages/forgeline-brief/.output/public/* staging/forgeline-brief/
```

- `staging` 디렉터리를 생성하여 최종 배포 결과물을 모을 준비를 합니다.
- 각 앱(`forgeline-brief`, `forgeline-app`)에 대해 조건부로 빌드를 수행합니다. `if` 조건은 해당 앱의 파일이 변경되었거나 강제 배포 태그가 있을 때 참이 됩니다.
- `pnpm --filter <앱이름> generate`: pnpm 워크스페이스 환경에서 특정 앱만 타겟하여 빌드합니다.
- 빌드된 결과물(`.output/public`)을 `staging` 폴더 아래 각 앱의 이름에 맞는 하위 디렉터리로 복사하여 통합합니다.

#### 2.3.3. GitHub Pages 배포

```yaml
- name: 통합된 staging 디렉터리를 아티팩트로 업로드
  uses: actions/upload-pages-artifact@v3
  with:
    path: 'staging'

- name: GitHub Pages에 배포
  uses: actions/deploy-pages@v2
```

- `upload-pages-artifact`: 통합된 `staging` 폴더 전체를 GitHub Pages 배포 전용 아티팩트로 업로드합니다.
- `deploy-pages`: 이 아티팩트를 사용하여 GitHub Pages에 최종적으로 배포합니다. 이 액션은 GitHub 내장 배포 워크플로우를 트리거합니다. (아래 부록 참고)

---

## 3. 부록: `pages build and deployment` Job의 정체

`uses: actions/deploy-pages@v2` 액션이 실행되면, GitHub Actions 로그에 우리가 직접 정의하지 않은 `pages build and deployment`라는 Job이 나타납니다. 이것은 GitHub가 Pages 배포를 위해 제공하는 내장 워크플로우이며, `build`, `report-build-status`, `deploy`의 세부 Job으로 구성되어 배포의 마지막 단계를 안정적으로 처리합니다.
