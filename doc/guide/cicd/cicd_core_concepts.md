# GitHub Actions 핵심 개념 심화 가이드

## 1. 개요

이 문서는 GitHub Actions 워크플로우의 가장 근본적인 세 가지 핵심 개념인 **러너(Runner)**, **액션(Action)**, 그리고 **컨텍스트/outputs**에 대해 깊이 있게 설명합니다.

### 이런 분들이 읽으면 좋아요

- **CI/CD 파이프라인을 직접 수정하거나 관리**해야 하는 코어 개발자
- GitHub Actions의 **동작 원리를 근본적으로 이해**하고 싶은 분
- 배포 과정에서 발생하는 **문제를 해결(Troubleshooting)**해야 하는 분

이 개념들을 이해하면 워크플로우가 "어떻게" 동작하는지 명확하게 파악하고, 향후 CI/CD 파이프라인을 직접 수정하거나 트러블슈팅하는 데 큰 도움이 됩니다.

---

## 2. 가상 컴퓨터: 러너(Runner)

GitHub Actions의 모든 작업(Job)은 GitHub가 제공하는 일회용 가상 컴퓨터에서 실행되며, 이 가상 컴퓨터를 **러너(Runner)**라고 부릅니다.

- **`runs-on: ubuntu-latest`의 의미:** "이 Job을 실행할 러너의 OS로 최신 버전의 우분투 리눅스를 사용하겠다"는 선언입니다.
- **실행 환경:** Job이 시작될 때마다 깨끗하게 포맷된 새로운 러너가 할당됩니다. 이 러너는 OS와 일부 기본 도구만 설치된 텅 빈 상태이며, 우리 프로젝트 코드는 아직 존재하지 않습니다.
- **표준 환경:** 대부분의 웹 개발 CI/CD는 실제 서버 환경과 유사하고 호환성이 높은 리눅스 러너를 표준으로 사용합니다.

---

## 3. 외부 도구: 마켓플레이스 액션(Action)

워크플로우에서 `uses: actions/checkout@v4`와 같이 `uses` 키워드로 참조되는 부분은 우리 저장소에 없는 코드입니다. 이것은 GitHub 마켓플레이스에 공개된 **재사용 가능한 외부 프로그램(Action)**을 가져와 사용하는 것입니다.

- **동작 원리:**
  1.  러너는 `uses:` 구문을 만나면, 마켓플레이스에서 해당 주소(`actions/checkout`)의 액션을 찾습니다.
  2.  해당 액션의 소스 코드를 러너(가상 컴퓨터) 안으로 **실시간으로 다운로드**합니다.
  3.  다운로드한 액션(프로그램)을 러너 위에서 실행합니다.

- **`actions/checkout@v4`의 역할:** 우리 프로젝트 저장소의 코드를 러너 안으로 복사해오는 역할을 수행하는 가장 기본적인 액션입니다.
- **`dorny/paths-filter@v2`의 역할:** 러너에 복사된 코드 중 어떤 파일/폴더가 변경되었는지 분석하는 역할을 수행하는 외부 액션입니다.

이 방식은 마치 `npm install` 명령으로 외부 라이브러리를 `node_modules`에 다운로드하여 사용하는 것과 매우 유사합니다.

---

## 4. 메모리 데이터: 컨텍스트와 `outputs`

`outputs`, `steps`, `needs`, `github` 등 워크플로우에서 `${{...}}` 구문으로 접근하는 데이터들은 파일이나 폴더가 아닌, **러너의 메모리(RAM)에 존재하는 데이터 구조(Context)**입니다.

### 4.1. `outputs`의 두 종류

`outputs`는 범위와 목적에 따라 두 종류로 나뉩니다.

- **1. 스텝(Step)의 `outputs` (Job 내부용):**
  - **정의:** 한 `step`이 실행된 후, `::set-output` 같은 특별한 명령을 통해 생성하는 **"중간 결과물"**입니다.
  - **범위:** 오직 **같은 Job 내의 다른 `step`들만** 이 `outputs`을 `steps.<ID>.outputs.<이름>` 형태로 참조할 수 있습니다.
  - **비유:** 한 부서 내에서 A직원이 B직원에게 전달하는 **내부 메모**.

- **2. 잡(Job)의 `outputs` (Job 외부용):**
  - **정의:** 한 `Job`이 모든 실행을 마친 후, 다른 `Job`에게 전달하기 위해 Job 최상단에 `outputs:` 키로 명시적으로 선언하는 **"최종 보고서"**입니다.
  - **범위:** `needs` 컨텍스트를 통해 **다른 Job에서** `needs.<Job이름>.outputs.<이름>` 형태로 참조할 수 있습니다.
  - **비유:** A부서가 업무를 마친 후 B부서에 전달하는 **공식 보고서**.

### 4.2. 데이터 흐름 예시

우리 워크플로우의 `changes` Job은 이 두 `outputs`를 모두 사용합니다.

```yaml
changes:
  outputs: # (2) Job의 "최종 보고서"를 정의합니다.
    app: ${{ steps.filter.outputs.app }} # (3) 내용은 Step의 "중간 결과물"로 채웁니다.
  steps:
    - uses: dorny/paths-filter@v2
      id: filter
      # (1) 이 스텝이 실행되면 Step의 "중간 결과물"(outputs)이 메모리에 생성됩니다.
```

1.  `dorny/paths-filter` 스텝이 실행되고, 그 결과로 `steps.filter.outputs.app`이라는 **중간 결과물**이 메모리에 생성됩니다.
2.  `changes` Job의 `outputs` 섹션은 이 **중간 결과물**을 참조하여,
3.  다른 Job이 사용할 수 있는 **최종 보고서**를 만듭니다.
4.  이후 `build-and-deploy` Job은 `needs.changes.outputs.app`이라는 주소로 이 "최종 보고서"를 조회하여 사용하는 것입니다.

---

## 5. 통합 배포 워크플로우 분석 (`deploy.yml`)

이제 앞에서 학습한 개념들을 바탕으로 우리 프로젝트의 실제 배포 워크플로우(`.github/workflows/deploy.yml`)를 한 줄씩 분석해 보겠습니다.

```yaml
name: Unified Monorepo Deploy
```

- **`name`**: 워크플로우의 이름입니다. GitHub Actions 탭에서 이 이름으로 표시됩니다.

```yaml
on:
  push:
    branches:
      - main
```

- **`on`**: 어떤 이벤트가 발생했을 때 이 워크플로우를 실행할지 정의합니다.
- **`push` / `branches: - main`**: `main` 브랜치에 `push` 이벤트가 발생할 때마다 워크플로우가 실행됩니다.

```yaml
jobs:
  changes: ...
  build-and-deploy: ...
```

- **`jobs`**: 워크플로우를 구성하는 작업(Job)들의 목록입니다. 우리 워크플로우는 `changes`와 `build-and-deploy`라는 두 개의 Job으로 구성되어 있으며, 이들은 순차적으로 실행됩니다.

### 5.1. `changes` Job: 변경 사항 감지

이 Job의 유일한 목적은 모노레포 내의 어떤 패키지(`forgeline-app` 또는 `forgeline-brief`)에서 변경이 발생했는지 감지하여 그 결과를 "최종 보고서(`outputs`)"로 만드는 것입니다.

```yaml
changes:
  runs-on: ubuntu-latest
  outputs:
    app: ${{ steps.filter.outputs.app }}
    brief: ${{ steps.filter.outputs.brief }}
```

- **`runs-on`**: `ubuntu-latest` 리눅스 환경의 러너에서 이 Job을 실행합니다.
- **`outputs`**: 이 Job의 "최종 보고서"를 정의합니다. `app`과 `brief`라는 두 개의 보고서 항목이 있으며, 각각의 값은 `filter` 스텝의 "중간 결과물"로 채워집니다.

```yaml
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

- **`steps`**: Job이 수행할 단계들의 목록입니다.
- **`uses: actions/checkout@v4`**: 프로젝트 코드를 러너 안으로 내려받습니다.
- **`uses: dorny/paths-filter@v2`**: `paths-filter` 액션을 사용하여 변경된 파일 경로를 확인합니다.
  - `filters`: `packages/forgeline-app/` 또는 `packages/forgeline-brief/` 경로에 변경이 있었는지 검사하도록 필터를 설정합니다.
  - 검사 결과는 `app`, `brief` 라는 이름의 "중간 결과물(`steps.filter.outputs`)"로 메모리에 저장됩니다. (변경된 경우 `true`, 아니면 `false`)

### 5.2. `build-and-deploy` Job: 빌드 및 배포

이 Job은 `changes` Job의 결과를 바탕으로 실제 빌드와 배포를 수행합니다.

```yaml
build-and-deploy:
  needs: changes
```

- **`needs: changes`**: 이 Job이 `changes` Job에 의존함을 선언합니다. `changes` Job이 성공적으로 끝나야만 이 Job이 실행되며, `needs.changes.outputs`를 통해 `changes` Job의 "최종 보고서"에 접근할 수 있습니다.

```yaml
if: |
  !contains(github.event.head_commit.message, '[no-deploy]') &&
  (needs.changes.outputs.app == 'true' || needs.changes.outputs.brief == 'true' || contains(github.event.head_commit.message, '[deploy:'))
```

- **`if`**: 이 Job의 실행 조건을 정의합니다. 아래 조건들이 모두 참일 때만 실행됩니다.
  1.  커밋 메시지에 `[no-deploy]` 문자열이 **없어야 합니다.**
  2.  `changes` Job의 결과 `app`이 `true`이거나, `brief`가 `true`이거나, 또는 커밋 메시지에 `[deploy:` 문자열이 **포함되어야 합니다.** (수동 배포 트리거)

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

- **`permissions`**: 이 Job이 GitHub API를 사용할 때 필요한 권한을 설정합니다. `pages: write`와 `id-token: write`는 GitHub Pages에 배포하기 위해 필수적인 권한입니다.

```yaml
steps:
  - name: Checkout
    uses: actions/checkout@v4
```

- **`Checkout`**: 다시 한번 코드를 내려받습니다. (각 Job은 독립된 러너에서 실행되므로 코드를 다시 받아야 합니다.)

```yaml
- name: pnpm 설치
  uses: pnpm/action-setup@v3
  with: { version: 8 }

- name: Node.js 설치
  uses: actions/setup-node@v4
  with: { node-version: '18', cache: 'pnpm' }
```

- **`pnpm 설치` 및 `Node.js 설치`**: `pnpm`과 `Node.js`를 러너에 설치합니다. `cache: 'pnpm'` 설정은 다운로드한 의존성을 캐싱하여 다음 실행 시 속도를 향상시킵니다.

```yaml
- name: Install Build Dependencies
  run: sudo apt-get update && sudo apt-get install -y build-essential python3 python-is-python3
```

- **`Install Build Dependencies`**: `pnpm install` 과정에서 네이티브 모듈 컴파일이 필요할 경우를 대비해, `build-essential`(C/C++ 컴파일러 모음)과 `python`을 설치합니다. **(바로 이 부분이 우리가 겪고 있는 에러와 관련이 깊습니다.)**

```yaml
- name: 의존성 설치
  run: pnpm install
```

- **`의존성 설치`**: `pnpm install` 명령으로 프로젝트의 모든 의존성을 설치합니다.

```yaml
- name: 최종 배포물을 담을 staging 디렉터리 생성
  run: mkdir -p staging
- name: 루트 index.html을 staging으로 복사
  run: cp index.html staging/
```

- **`staging` 디렉터리 관련**: 여러 패키지의 빌드 결과물을 한곳에 모아 배포하기 위한 `staging`이라는 임시 폴더를 생성하고, 공통 `index.html` 파일을 복사해둡니다.

```yaml
- name: Build forgeline-brief
  if: needs.changes.outputs.brief == 'true' || contains(github.event.head_commit.message, '[deploy:brief')
  run: pnpm --filter forgeline-brief generate
- name: Copy brief to staging
  if: ...
  run: mkdir -p staging/forgeline-brief && cp -r packages/forgeline-brief/.output/public/* staging/forgeline-brief/
```

- **`forgeline-brief` 빌드 및 복사**: `if` 조건에 따라 `forgeline-brief` 패키지에 변경이 있었거나 수동 배포가 트리거된 경우에만 빌드(`generate`)를 수행하고, 그 결과물을 `staging/forgeline-brief` 폴더로 복사합니다. `forgeline-app`도 동일한 구조로 동작합니다.

```yaml
- name: 통합된 staging 디렉터리를 아티팩트로 업로드
  uses: actions/upload-pages-artifact@v3
  with:
    path: 'staging'
```

- **`아티팩트로 업로드`**: `upload-pages-artifact` 액션을 사용하여 `staging` 디렉터리 전체를 GitHub Pages가 인식할 수 있는 특별한 형태의 압축 파일(아티팩트)로 만듭니다.

```yaml
- name: GitHub Pages에 배포
  uses: actions/deploy-pages@v2
```

- **`GitHub Pages에 배포`**: `deploy-pages` 액션이 이전 단계에서 생성된 아티팩트를 가져와 GitHub Pages 서비스에 최종적으로 배포합니다.
