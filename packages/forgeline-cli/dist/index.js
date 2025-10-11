"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const program = new commander_1.Command();
program
    .command('figma <method>')
    .description('Figma와 상호작용합니다.')
    .option('-p, --prompt <value>', '작업에 대한 자연어 프롬프트')
    .action((method, options) => {
    console.log(`[CLI] Executing: ${method} with prompt: "${options.prompt}"`);
    const mcpHostPath = path_1.default.resolve(__dirname, '../../forgeline-mcp-server/src/mcp-host.ts');
    const mcpHost = (0, child_process_1.spawn)('bun', ['run', mcpHostPath], { stdio: ['pipe', 'pipe', 'inherit'] });
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
