# Repository Push & Conditional Deploy Prompt

## 목적

- `c:\github\forgeline` 로컬 저장소의 변경 사항을 지정한 브랜치로 안전하게 커밋하고 푸시합니다.
- 자동 배포를 실행할지, 특정 대상에 수동 배포할지, 또는 배포를 건너뛸지 프롬프트에서 선택할 수 있도록 합니다.

## 입력 파라미터

- `targetBranch`: `main` -> 푸시할 Git 브랜치명 (예: `main`, `develop`).
- `deploymentTarget`: `forgeline-app`, `forgeline-brief` -> 배포 실행 방식을 지정합니다.
  - `'auto'`: 커밋 메시지에 별도 태그를 추가하지 않습니다. CI/CD는 변경된 파일을 감지하여 **자동으로 배포**합니다.
  - `'none'`: 커밋 메시지에 `[no-deploy]` 태그를 추가합니다. CI/CD는 **배포를 실행하지 않습니다.**
  - `'forgeline-app'`, `'forgeline-brief'`, `'all'` 등: 커밋 메시지에 `[deploy:타겟]` 태그를 추가하여 **수동으로 배포를 강제**합니다. 여러 대상을 지정하려면 쉼표로 구분합니다 (예: `'forgeline-app,forgeline-brief'`).

## 절차 개요

1. **린트 실행** → 코드 스타일 및 잠재적 오류가 없는지 확인.
2. **원격 동기화** → `git pull`로 최신 변경 사항 반영.
3. **스테이징 및 로그 생성** → `git add`로 변경 사항을 스테이징하고, 성공을 가정한 로그를 `doc/deploy/log.md`에 작성 및 스테이징.
4. **통합 커밋** → 코드 변경 사항과 로그 파일을 단일 커밋으로 생성. **이때 `deploymentTarget` 값에 따라 적절한 배포 태그를 커밋 메시지에 포함**합니다.
5. **푸시** → `git push origin {targetBranch}`.
6. **배포** → 푸시된 커밋의 태그와 내용에 따라 GitHub Actions 워크플로가 배포를 자동으로 처리합니다.
7. **실패 시 로그 수정** → 푸시 또는 배포 실패 시, 이전 커밋을 수정(`amend`)하여 로그 내용을 '실패'로 업데이트.
8. **보고** → 각 단계 완료 및 특이사항을 사용자에게 보고.

## 세부 지침

### 0. 사전 보고

- 전체 계획과 사용할 `targetBranch`, `deploymentTarget` 값을 먼저 사용자에게 요약 보고합니다.

### 1. 린트 단계 (Lint Phase)

- `pnpm lint`를 실행하여 코드 품질과 스타일을 검증합니다.

### 2. git pull 단계

- `git pull origin {targetBranch}`를 실행합니다.

### 3. git add → commit 단계

- `git status --short`로 변경 파일 확인 후 사용자에게 간단 보고합니다.
- 필요한 파일만 `git add`로 스테이징합니다.
- 커밋 메시지는 **'영문 타입: 한글 설명'** 형식으로 작성합니다.
- `deploymentTarget` 값에 따라 커밋 메시지 끝에 다음 태그 중 하나를 추가합니다:
  - `deploymentTarget` == `'none'`: `[no-deploy]` 태그를 추가합니다.
  - `deploymentTarget` == `'auto'`: 아무 태그도 추가하지 않습니다.
  - `deploymentTarget`이 그 외의 값 (예: `'forgeline-app'`): `[deploy:{deploymentTarget}]` 태그를 추가합니다.
- 위 규칙에 따라 생성된 커밋 메시지로 **코드 변경 사항만 먼저 커밋**합니다.

### 4. 산출물 기록 및 커밋 수정

- `git rev-parse HEAD`로 방금 생성된 커밋의 해시를 가져옵니다.
- 이 해시를 사용하여, 푸시 및 배포가 성공할 것을 가정하고 **성공 로그를 생성**합니다.
  ```
  ## {YYYY-MM-DD hh:mm}
  - 커밋 해시: {latestCommitHash}
  - 브랜치: {targetBranch}
  - 테스트 결과: 성공/실패 요약
  - GitHub Actions ({deploymentTarget}): 대기 중 / 실행 안 함
  - 배포 확인 링크: 대기 중 / 미실행
  ```
- 생성된 로그를 `doc/deploy/log.md` 파일의 **맨 위에 추가**하고, `git add`로 스테이징합니다.
- `git commit --amend --no-edit` 명령을 사용해, **별도의 커밋을 만들지 않고 이전 커밋에 로그 파일을 추가**합니다.

### 5. git push 단계

- `git push origin {targetBranch}`를 실행합니다.

### 6. GitHub Actions 배포

- 실제 배포 로직은 GitHub Actions에 의해 커밋 메시지 태그에 따라 자동으로 처리됩니다.
- 에이전트는 배포의 성공/실패 여부를 확인하고 로그를 업데이트하는 역할만 수행합니다.

### 7. 단계별 보고

- 각 단계 시작 전 계획, 진행 중 발생한 특이사항, 완료 후 결과를 모두 한국어로 사용자에게 공유합니다.
- 문제 발생 시 항상 **“문제 설명 → 해결 방안 제안 → 사용자 승인 → 해결 적용 → 단계 재시도”** 플로우를 따릅니다.

## 산출물

- 성공적으로 푸시된 최신 커밋 해시.
- (선택) 배포 워크플로 실행 ID와 로그 URL.
- 테스트, pull, add/commit, push, deploy 단계별 수행 결과 요약.
- `doc/deploy/log.md`에 날짜별로 추가된 배포 로그.
