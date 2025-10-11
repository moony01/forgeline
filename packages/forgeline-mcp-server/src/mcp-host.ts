import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:3054');

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