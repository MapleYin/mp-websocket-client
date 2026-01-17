/**
 * 原生微信小程序示例
 */

// 在实际的微信小程序中使用
import { MPWebSocketClient, SocketState } from 'mp-websocket-client';

// 创建 WebSocket 客户端实例
const client = new MPWebSocketClient({
  url: 'wss://echo.websocket.org',
  autoReconnect: true,
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
  enableHeartbeat: true,
  heartbeatInterval: 30000,
  heartbeatMessage: 'ping'
});

// 连接 WebSocket
client.connect({
  onOpen: (res) => {
    console.log('WebSocket 连接已打开', res);
    
    // 发送消息
    client.send('Hello WebSocket!')
      .then(() => {
        console.log('消息发送成功');
      })
      .catch((err) => {
        console.error('消息发送失败', err);
      });
  },
  
  onMessage: (res) => {
    console.log('收到消息:', res.data);
  },
  
  onClose: (res) => {
    console.log('WebSocket 连接已关闭', res);
  },
  
  onError: (res) => {
    console.error('WebSocket 连接错误', res);
  }
});

// 检查连接状态
if (client.isConnected()) {
  client.send('Another message');
}

// 获取当前状态
const state = client.getState();
console.log('当前状态:', state);

// 手动关闭连接
// client.close(1000, 'Normal closure');
