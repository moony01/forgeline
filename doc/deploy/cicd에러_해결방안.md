좋아 친구야 👇 이 CI/CD 에러를 단계별로 분석해보면 이렇게 정리할 수 있어.

---

## 🧩 에러 핵심 요약

```
Cannot find native binding. npm has a bug related to optional dependencies (https://github.com/npm/cli/issues/4828).
Please try `npm i` again after removing both package-lock.json and node_modules directory.
[cause]: Cannot find module '@oxc-parser/binding-linux-x64-gnu'
```

즉, **`oxc-parser` 패키지의 네이티브 바인딩 파일(`.node`)을 찾지 못해서 Nuxt 준비 단계에서 실패한 것**이야.
CI/CD 환경(리눅스)에서 빌드 중 `postinstall` 스크립트(`nuxt prepare`)가 돌다가 터진 거지.

---

## 🔍 근본 원인 분석

| 구분                                             | 원인                                                                                                             | 설명                                                                    |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **1️⃣ npm optional dependency 버그**              | `oxc-parser`는 OS별로 다른 native 모듈(`parser.linux-x64-gnu.node`)을 optional dependency로 설치함               | npm(특히 v9~v10)에서 optional deps를 무시하거나 잘못 설치하는 버그 존재 |
| **2️⃣ pnpm의 strict 캐싱 구조**                   | pnpm은 패키지 캐시를 심볼릭 링크로 연결하는데, native 모듈이 OS에 따라 빌드돼야 하는 경우 이를 재활용하려다 깨짐 | 특히 CI/CD 환경이 **캐시 재활용**을 할 때 이런 문제가 잘 발생           |
| **3️⃣ Nuxt `prepare` 단계에서 `oxc-parser` 호출** | Nuxt 3.29 이상부터 `@nuxt/kit`이 `oxc-parser`를 내부적으로 lint용으로 호출함                                     | FFI(native binding) 불러올 때 실패하면서 전체 postinstall이 실패        |

---

## ⚙️ 에러 발생 지점

1. `pnpm install --frozen-lockfile`
   - lockfile은 정상.
   - node_modules 설치 중 문제 없음.

2. `packages/forgeline-app postinstall`
   → `nuxt prepare` 실행
   → 내부적으로 `@nuxt/kit` → `oxc-parser` 로딩
   → `Cannot find module '@oxc-parser/binding-linux-x64-gnu'` 발생

즉, **설치는 성공했지만 `postinstall`에서 OS별 네이티브 모듈 로드 실패**야.

---

## 🧰 해결 방안 (우선순위별)

### ✅ 1. CI/CD 환경에서 Native 모듈 재빌드 (권장)

`oxc-parser`는 빌드 시점에 네이티브 바이너리를 다운로드해야 하므로, CI에서 다음 명령을 추가해줘야 해.

```bash
pnpm rebuild oxc-parser
```

즉, CI 스크립트를 다음처럼 수정:

```yaml
# 예: .github/workflows/build.yml
- name: Install dependencies
  run: pnpm install --frozen-lockfile

- name: Rebuild native modules
  run: pnpm rebuild oxc-parser

- name: Prepare Nuxt
  run: pnpm -r exec nuxt prepare
```

---

### ✅ 2. 문제 패키지 캐시 제거 후 재설치

pnpm 캐시가 꼬인 경우도 많아서, 다음 조치를 취해줘.

```bash
pnpm store prune
rm -rf node_modules
pnpm install
```

만약 CI 환경이라면,

```yaml
- name: Clean install
  run: |
    rm -rf node_modules
    rm -f pnpm-lock.yaml
    pnpm install
```

---

### ✅ 3. Nuxt 버전 고정 or 롤백 (임시방편)

`@nuxt/kit@4.1.x`와 `oxc-parser@0.94.x` 조합이 문제를 일으킨 사례가 있음.
`oxc-parser@0.93.0` 혹은 `@nuxt/kit@4.0.x`로 롤백 가능.

```bash
pnpm add oxc-parser@0.93.0 -D
```

---

### ✅ 4. optional dependency 무시 설정 (비추천이지만 응급조치 가능)

CI 환경 변수에 `npm_config_optional=false` 또는 `--ignore-optional`을 넣어도 통과는 됨.
단, 일부 eslint 기능이 비활성화될 수 있어 비추천.

```yaml
- name: Install without optional deps
  run: pnpm install --frozen-lockfile --ignore-optional
```

---

## 🧪 테스트 요약 (로컬에서 재현 체크)

1. 로컬에서 `rm -rf node_modules && pnpm install`
2. 실행: `pnpm -r exec nuxt prepare`
3. 동일 에러 재현되면 `pnpm rebuild oxc-parser` 추가 후 성공 여부 확인

---

## 💡 추가 팁: `oxc-parser`를 완전히 무시해도 되는 케이스

`nuxt prepare`는 빌드 타임 전 linting/meta step이라,
빌드 스텝만 돌릴 거면 이 과정을 스킵할 수도 있음.

```bash
# .npmrc
ignore-scripts=true
```

그런 다음 수동으로 빌드:

```bash
pnpm build
```

---

## ✅ 최종 정리 (CI/CD용 수정 예시)

```yaml
name: Build & Deploy

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Rebuild native bindings
        run: pnpm rebuild oxc-parser
      - name: Prepare Nuxt
        run: pnpm -r exec nuxt prepare
      - name: Build all packages
        run: pnpm -r build
```

---

원인을 요약하면 이렇게야 👇

> **“pnpm이 CI 환경에서 oxc-parser의 OS별 네이티브 바이너리를 제대로 설치하지 못해 Nuxt postinstall이 실패함.”**

`pnpm rebuild oxc-parser` 한 줄만 추가해도 대부분 해결돼.

---

원하면 내가 GitHub Actions용 완전한 `build.yml` 패치본까지 만들어줄게.
그걸 CI에 바로 넣으면 자동으로 정상 빌드되게 할 수 있어.
만들어줄까?
