# Repository Push & Optional Deploy Prompt

## 목적
- `c:\github\forgeline` 로컬 저장소의 변경 사항을 지정한 브랜치로 안전하게 커밋하고 푸시합니다.
- 필요 시 GitHub Actions 배포 워크플로 실행 여부를 프롬프트에서 선택할 수 있도록 합니다.

## 입력 파라미터
- `targetBranch`: `main` -> 푸시할 Git 브랜치명 (예: `main`, `develop`).
- `runDeployment`: `false` -> GitHub Actions 배포 워크플로 실행 여부 (예: `true`/`false`).

## 절차 개요
1. **테스트 실행** → 시스템 실행 시 에러가 없는지 확인.
2. **원격 동기화** → `git pull`로 최신 변경 사항 반영.
3. **스테이징 및 커밋** → `git add`, `git commit`.
4. **푸시** → `git push origin {targetBranch}`.
5. **선택적 배포** → `runDeployment`가 `true`이면 GitHub Actions 워크플로 실행.
6. **산출물 기록** → `doc/deploy/log.md`에 날짜별 배포 로그 작성.
7. **보고** → 각 단계 완료 및 특이사항을 사용자에게 보고.

## 세부 지침

### 0. 사전 보고
- 전체 계획과 사용할 `targetBranch`, `runDeployment` 값을 먼저 사용자에게 요약 보고합니다.
- 모든 단계는 **"테스트 → pull → add → commit → push (→ deploy)"** 순으로 진행하며, 단계별 진행 전후로 사용자에게 상태를 공유합니다.

### 1. 테스트 단계
- `pnpm install` 후 `pnpm lint`, `pnpm test`를 순차 실행합니다.
- 실패 시: 에러 메시지를 정리해 사용자에게 설명하고, 가능한 해결 방안을 제시합니다.
- 사용자가 해결 방안 승인을 내리면 수정 적용 후 테스트를 재실행합니다.

### 2. git pull 단계
- 명령: `git pull origin {targetBranch}`.
- 컨플릭트 발생 시:
  - 충돌 파일과 오류 내용을 사용자에게 보고합니다.
  - 가능한 해결 방법(예: 특정 파일 우선 적용, 수동 병합 절차)을 제안합니다.
  - 사용자 확인 후 병합을 수행하고 다시 `git pull`을 반복합니다.
- 충돌 해결 과정을 병합 완료까지 상세히 기록합니다.

### 3. git add → commit 단계
- `git status --short`로 변경 파일 확인 후 사용자에게 간단 보고합니다.
- 필요한 파일만 `git add`로 스테이징합니다.
- 커밋 메시지는 `feat: 설명`, `fix: 설명` 등 팀 규칙에 맞게 작성합니다.
- 에러 발생 시:
  - 구체적인 오류 메시지와 원인을 사용자에게 공유합니다.
  - 해결 방안을 제시하고, 승인 후 수정 및 재실행합니다.

### 4. git push 단계
- 명령: `git push origin {targetBranch}`.
- 푸시 실패 시 (예: 권한, 원격 충돌):
  - 오류 내용을 보고하고, 해결 전략(예: rebase, 토큰 갱신)을 제안합니다.
  - 승인 후 필요한 조치를 수행하고 다시 푸시합니다.

### 5. GitHub Actions 배포 (옵션)
- `runDeployment === true`일 때만 실행합니다.
- 워크플로 ID와 파라미터:
  ```json
  {
    "owner": "moony01",
    "repo": "forgeline",
    "workflow_id": "deploy-prod.yml",
    "ref": "{targetBranch}"
  }
  ```
- 실행 후 `github.actions.getWorkflowRuns`로 상태를 모니터링합니다.
- 실패 시:
  - 실패 로그 요약, 원인 추정, 재시도/수정 방안을 사용자에게 보고합니다.
  - 사용자 승인 후 조치합니다.

### 6. 산출물 기록
- 푸시 및 배포가 완료되면 `doc/deploy/log.md`에 날짜별 로그를 추가합니다.
- 로그 항목 예시:
  ```
  ## 2025-10-08
  - 커밋 해시: {latestCommit}
  - 브랜치: {targetBranch}
  - 테스트 결과: 성공/실패 요약
  - GitHub Actions: 실행 ID 및 상태 (실행하지 않았다면 사유 기재)
  - 배포 확인 링크: URL 또는 "미실행"
  ```
- 기존 기록은 유지하고, 최신 날짜 섹션을 맨 아래에 append합니다.

### 7. 단계별 보고
- 각 단계 시작 전 계획, 진행 중 발생한 특이사항, 완료 후 결과를 모두 한국어로 사용자에게 공유합니다.
- 문제 발생 시 항상 **“문제 설명 → 해결 방안 제안 → 사용자 승인 → 해결 적용 → 단계 재시도”** 플로우를 따릅니다.

## 산출물
- 성공적으로 푸시된 최신 커밋 해시.
- (선택) 배포 워크플로 실행 ID와 로그 URL (`runDeployment === true`인 경우).
- 테스트, pull, add/commit, push, deploy 단계별 수행 결과 요약.
- `doc/deploy/log.md`에 날짜별로 추가된 배포 로그.
