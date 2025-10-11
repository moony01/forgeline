import { WebSocketServer, WebSocket } from 'ws';

// Server for Figma Plugin
const figmaPluginServer = new WebSocketServer({ port: 3055 });
let figmaPluginSocket: WebSocket | null = null;

figmaPluginServer.on('connection', ws => {
  console.log("✅ [WS-Server] Figma Plugin connected");
  figmaPluginSocket = ws;

  ws.on('message', message => {
    console.log(`[WS-Server] Message from Figma: ${message}`);
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'join' && data.channel) {
        console.log(`[WS-Server] Figma plugin joined channel: ${data.channel}`);
        // Send confirmation back to the plugin
        ws.send(JSON.stringify({
          type: 'system',
          channel: data.channel,
          message: {
            result: 'success',
            message: `Successfully joined channel ${data.channel}`
          }
        }));
      }
    } catch (e) {
      console.error('[WS-Server] Error parsing message from Figma:', e);
    }
  });

  ws.on('close', () => {
    console.log("❌ [WS-Server] Figma Plugin disconnected");
    figmaPluginSocket = null;
  });
});

// Server for MCP-Host
const mcpHostServer = new WebSocketServer({ port: 3054 });

mcpHostServer.on('connection', ws => {
  console.log('✅ [WS-Server] MCP-Host connected');
  ws.on('message', message => {
    if (figmaPluginSocket && figmaPluginSocket.readyState === WebSocket.OPEN) {
      console.log(`[WS-Server] Relaying message to Figma: ${message}`);
      figmaPluginSocket.send(message.toString());
    } else {
      console.log('[WS-Server] Figma plugin not connected. Cannot relay message.');
    }
  });
});

console.log(`[WS-Server] Figma Plugin server listening on localhost:3055`);
console.log(`[WS-Server] MCP Host server listening on localhost:3054`);