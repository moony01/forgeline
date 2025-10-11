# 🧠 ForgeLine Figma MCP 연동 시스템 개발 가이드

## 1. 최종 목표 및 아키텍처

### 목표

VSCode 환경에서 AI 에이전트(Gemini, Codex 등)가 사용할 수 있는 CLI 도구를 개발하여, 무료 Figma 플랜 사용자를 위해 디자인 생성 자동화 시스템의 핵심 프로토타입을 구축합니다.

### 최종 아키텍처

AI 에이전트는 `forgeline-cli`를 'SDK'처럼 사용하여 `forgeline-mcp-server`와 간접적으로 통신합니다.

```mermaid
graph TD
    subgraph "VSCode"
        A[AI 에이전트] -->|명령어 생성| B[forgeline-cli (손)];
    end
    subgraph "ForgeLine MCP 서버"
        B -->|stdio| C[mcp-host.ts (관제탑)];
        C -->|WebSocket| D[ws-server.ts (항구)];
    end
    subgraph "Figma"
        D -->|WebSocket| E[Figma 플러그인 (작업자)];
        E -->|Figma API| F[Figma Canvas];
    end
```

## 2. Phase 1: forgeline-mcp-server (통신 엔진) 개발

`forgeline-mcp-server`는 Figma 플러그인과 CLI 사이의 통신을 중계하는 핵심 서버입니다.

### 2.1. 디렉터리 구조

```
forgeline-mcp-server/
├── node_modules/
├── plugin/
│   ├── code.ts
│   └── manifest.json
├── src/
│   ├── mcp-host.ts
│   └── ws-server.ts
└── package.json
```

### 2.2. package.json 작성

```json
{
  "name": "forgeline-mcp-server",
  "version": "1.0.0",
  "description": "Figma와 통신하는 MCP 서버 엔진",
  "main": "src/mcp-host.ts",
  "scripts": {
    "start:ws": "bun run src/ws-server.ts"
  },
  "dependencies": {
    "ws": "^8.18.0"
  },
  "devDependencies": {
    "bun-types": "latest",
    "typescript": "^5.0.0",
    "@types/ws": "^8.5.10"
  }
}
```

### 2.3. src/ws-server.ts (웹소켓 항구) 개발

`ws-server.ts`는 Figma 플러그인과 `mcp-host.ts`로부터의 웹소켓 연결을 처리하고 메시지를 중계하는 역할을 합니다.

```ts
import { ServerWebSocket } from 'bun';
import { WebSocketServer } from 'ws';

const figmaPluginServer = Bun.serve<{}>({
  port: 8080,
  fetch(req, server) {
    if (server.upgrade(req)) return;
    return new Response('Upgrade failed', { status: 500 });
  },
  websocket: {
    open(ws) {
      ws.subscribe('figma-commands');
      console.log('✅ [WS-Server] Figma Plugin connected');
    },
    message(ws, message) {
      console.log(`[WS-Server] Relaying message to Figma: ${message}`);
    },
    close(ws) {
      ws.unsubscribe('figma-commands');
      console.log('❌ [WS-Server] Figma Plugin disconnected');
    },
  },
});

const mcpHostServer = new WebSocketServer({ port: 8081 });

mcpHostServer.on('connection', (ws) => {
  console.log('✅ [WS-Server] MCP-Host connected');
  ws.on('message', (message) => {
    console.log(`[WS-Server] Relaying message to Figma: ${message}`);
    figmaPluginServer.publish('figma-commands', message.toString());
  });
});

console.log(`[WS-Server] Figma Plugin server listening on localhost:${figmaPluginServer.port}`);
console.log(`[WS-Server] MCP Host server listening on localhost:${mcpHostServer.port}`);
```

### 2.4. src/mcp-host.ts (관제탑) 개발

`mcp-host.ts`는 `forgeline-cli`로부터 표준 입력을 통해 명령을 받아 `ws-server.ts`로 전달합니다.

```ts
import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:8081');

ws.on('open', () => {
  console.log('[MCP-Host] Connected to WS-Server.');
  process.stdin.on('data', (data) => {
    const messageFromCli = data.toString();
    console.log(`[MCP-Host] Received from CLI: ${messageFromCli}`);
    ws.send(messageFromCli);
  });
});

ws.on('error', (error) => {
  console.error('[MCP-Host] WebSocket error:', error);
});

console.log('[MCP-Host] Started. Waiting for messages from CLI...');
```

### 2.5. plugin/ (Figma 작업자) 개발

Figma 플러그인은 Figma 환경에서 실행되며, `ws-server.ts`와 웹소켓 통신을 통해 명령을 수신하고 Figma Canvas에 작업을 수행합니다.

**plugin/manifest.json**

```json
{
  "name": "ForgeLine Agent",
  "id": "1234567890123456789",
  "api": "1.0.0",
  "main": "code.js",
  "networkAccess": {
    "allowedDomains": ["http://localhost:8080"]
  }
}
```

**plugin/code.ts**

```ts
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
  figma.notify('✅ ForgeLine Agent connected!');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data as string);
  console.log('Received command:', message);
  figma.notify(`Command received: ${message.method}`);

  if (message.method === 'create_rectangle') {
    const rect = figma.createRectangle();
    rect.name = message.params.prompt || 'New Rectangle';
    figma.currentPage.appendChild(rect);
    figma.viewport.scrollAndZoomIntoView([rect]);
  }
};

ws.onerror = (error) => {
  figma.notify('❌ Connection error. Is the WebSocket server running?');
};
```

## 3. Phase 2: forgeline-cli (AI 조종간) 개발

`forgeline-cli`는 AI 에이전트가 Figma와 상호작용하기 위한 명령줄 인터페이스입니다. `mcp-host.ts`와 통신하여 Figma에 명령을 전달합니다.

### 3.1. 디렉터리 구조

```
forgeline-cli/
├── node_modules/
├── src/
│   └── index.ts
└── package.json
```

### 3.2. package.json 작성

```json
{
  "name": "forgeline-cli",
  "version": "1.0.0",
  "description": "AI 에이전트를 위한 CLI 조종간",
  "main": "dist/index.js",
  "bin": {
    "forgeline": "dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts"
  },
  "dependencies": {
    "commander": "^12.1.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.12.12",
    "tsx": "^4.11.0"
  }
}
```

### 3.3. src/index.ts 개발

```ts
import { Command } from 'commander';
import { spawn } from 'child_process';
import path from 'path';

const program = new Command();

program
  .command('figma <method>')
  .description('Figma와 상호작용합니다.')
  .option('-p, --prompt <value>', '작업에 대한 자연어 프롬프트')
  .action((method, options) => {
    console.log(`[CLI] Executing: ${method} with prompt: "${options.prompt}"`);
    const mcpHostPath = path.resolve(__dirname, '../../forgeline-mcp-server/src/mcp-host.ts');
    // mcp-host.ts를 bun 런타임으로 실행합니다.
    const mcpHost = spawn('bun', ['run', mcpHostPath], { stdio: ['pipe', 'pipe', 'inherit'] });
    const rpcMessage = {
      jsonrpc: '2.0',
      id: 1,
      method: method,
      params: { prompt: options.prompt },
    };
    mcpHost.stdin.write(JSON.stringify(rpcMessage));
    mcpHost.stdin.end();
    mcpHost.stdout.on('data', (data) => {
      console.log(`[CLI] Response from MCP Host: ${data.toString()}`);
    });
    mcpHost.on('close', (code) => {
      console.log(`[CLI] MCP Host process exited with code ${code}`);
    });
  });

program.parse(process.argv);
```

## 4. 최종 실행 및 테스트 가이드

ForgeLine Figma MCP 연동 시스템을 실행하고 테스트하는 방법은 다음과 같습니다.

1.  **프로젝트 의존성 설치**: 프로젝트 루트에서 모든 의존성을 설치합니다.
    ```bash
    pnpm install
    ```
2.  **`forgeline-cli` 빌드**: CLI 도구를 사용하기 위해 빌드합니다.
    ```bash
    pnpm --filter forgeline-cli build
    ```
3.  **MCP 서버 시작**: 별도의 터미널에서 `forgeline-mcp-server`를 시작합니다. 이 서버는 계속 실행되어야 합니다.
    ```bash
    pnpm --filter forgeline-mcp-server start:ws
    ```
4.  **Figma 플러그인 실행**: Figma에서 "ForgeLine Agent" 플러그인을 실행합니다. 플러그인 UI에 "✅ ForgeLine Agent connected!" 메시지가 표시되는지 확인합니다.
5.  **CLI 명령 실행**: 다른 터미널에서 `forgeline-cli`를 사용하여 Figma에 명령을 보냅니다.
    ```bash
    pnpm --filter forgeline-cli dev figma create_rectangle --prompt "My First Box"
    ```

✅ **예상 결과**

- **CLI 터미널**: `[CLI]` 로그가 출력됩니다.
- **MCP 서버 터미널**: `[WS-Server]`, `[MCP-Host]` 로그가 출력됩니다.
- **Figma**: "My First Box"라는 이름의 사각형이 생성되고 중앙에 배치됩니다.
