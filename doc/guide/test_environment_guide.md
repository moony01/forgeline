# 테스트 환경 가이드

이 문서는 프로젝트의 린팅(Linting) 및 테스트(Testing) 환경 설정에 대한 가이드입니다. 코드 품질을 유지하고 일관된 개발 스타일을 적용하며, 기능의 정확성을 검증하기 위해 다음과 같은 도구들이 설정되었습니다.

## 1. 설정된 도구

- **ESLint**: JavaScript/TypeScript 코드의 정적 분석을 통해 잠재적인 오류를 찾고 코드 스타일을 강제합니다.
- **Prettier**: 코드 포맷터로, 일관된 코드 스타일을 자동으로 유지합니다.
- **Vitest**: 빠르고 현대적인 단위 테스트 프레임워크입니다.
- **TypeScript**: 정적 타입 검사를 통해 코드의 안정성과 유지보수성을 높입니다.

## 2. 린팅 및 테스트 실행 방법

프로젝트 루트 디렉토리에서 다음 명령어를 사용하여 린팅 및 테스트를 실행할 수 있습니다.

```bash
pnpm lint
pnpm test
```

- `pnpm lint`: ESLint와 Prettier를 실행하여 코드 스타일 및 잠재적 오류를 검사하고 자동으로 수정 가능한 부분을 수정합니다. 또한 TypeScript 타입 검사(`tsc --noEmit`)를 수행합니다.
- `pnpm test`: Vitest를 실행하여 프로젝트의 단위 테스트를 수행합니다.

## 3. 루트 `package.json` 스크립트

루트 `package.json` 파일에는 다음과 같은 스크립트가 정의되어 있습니다.

```json
"scripts": {
  "lint": "eslint . --ext .ts,.tsx,.js,.jsx,.vue --fix && prettier --write . && tsc --noEmit",
  "test": "vitest"
}
```

## 4. 주요 설정 파일

- `.eslintrc.cjs`: ESLint의 규칙 및 환경 설정이 정의되어 있습니다. TypeScript, Vue, Vitest 환경에 맞게 구성되었습니다.
- `prettier.config.cjs`: Prettier의 코드 포맷팅 규칙이 정의되어 있습니다.
- `tsconfig.json`: 모노레포 환경에서 TypeScript 프로젝트 간의 참조를 관리합니다.
- `vitest.config.ts`: Vitest의 테스트 환경 설정(예: `jsdom` 환경)이 정의되어 있습니다.

## 5. 현재 린팅 오류 해결 가이드

현재 `pnpm lint` 실행 시 `packages/forgeline-mcp-server/plugin/code.js` 파일에서 다음과 같은 린팅 오류가 발생하고 있습니다.

- **`@typescript-eslint/no-unused-vars`**: 사용되지 않는 변수들은 코드에서 제거하거나, 필요한 경우 `// eslint-disable-next-line @typescript-eslint/no-unused-vars` 주석을 사용하여 특정 라인에서 규칙을 비활성화할 수 있습니다.
- **`no-fallthrough`**: `switch` 문에서 `case` 블록이 다음 `case` 블록으로 이어지는 경우 `break` 문을 추가하거나, 의도적인 경우 `// eslint-disable-next-line no-fallthrough` 주석을 추가해야 합니다.
- **`no-undef`**: `'createStar'`, `'startNodeId'`, `'endNodeId'`와 같은 전역 변수 또는 함수가 정의되지 않았다는 오류입니다. 이들이 Figma 플러그인 환경의 전역 변수라면 `.eslintrc.cjs`의 `overrides` 섹션에 `globals`로 추가하여 ESLint가 인식하도록 설정해야 합니다.
- **`no-inner-declarations`**: 함수 선언이 다른 함수 내부에 있는 경우 발생합니다. 함수를 최상위 스코프로 이동하거나, 의도적인 패턴인 경우 규칙을 비활성화하는 것을 고려할 수 있습니다.
- **`no-useless-escape`**: 불필요한 이스케이프 문자를 수정해야 합니다.

이러한 오류들은 코드의 가독성과 안정성을 위해 수정하는 것이 권장됩니다.
