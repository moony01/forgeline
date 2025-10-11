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
    const mcpHost = spawn('pnpm', ['tsx', mcpHostPath], { stdio: ['pipe', 'pipe', 'inherit'], shell: true });
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