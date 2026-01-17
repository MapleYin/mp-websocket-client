/**
 * TypeScript 使用示例
 */

import { 
  MPWebSocketClient, 
  SocketOptions, 
  SocketEventHandlers,
  SocketState 
} from 'mp-websocket-client';

// 定义配置选项
const options: SocketOptions = {
  url: 'wss://echo.websocket.org',
  autoReconnect: true,
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
  enableHeartbeat: true,
  heartbeatInterval: 30000,
  heartbeatMessage: JSON.stringify({ type: 'ping' })
};

// 定义事件处理器
const handlers: SocketEventHandlers = {
  onOpen: (res) => {
    console.log('连接已打开', res);
  },
  
  onMessage: (res) => {
    console.log('收到消息', res.data);
    
    // 处理不同类型的数据
    if (typeof res.data === 'string') {
      console.log('文本消息:', res.data);
    } else if (res.data instanceof ArrayBuffer) {
      console.log('二进制消息');
    }
  },
  
  onClose: (res) => {
    console.log('连接已关闭', res);
  },
  
  onError: (res) => {
    console.error('连接错误', res);
  }
};

// 创建客户端
const client = new MPWebSocketClient(options);

// 连接
client.connect(handlers);

// 发送消息
async function sendMessage(data: string | ArrayBuffer) {
  try {
    await client.send(data);
    console.log('消息发送成功');
  } catch (error) {
    console.error('消息发送失败', error);
  }
}

// 检查连接状态
function checkConnection() {
  const state: SocketState = client.getState();
  const isConnected: boolean = client.isConnected();
  
  console.log('连接状态:', state);
  console.log('是否已连接:', isConnected);
}

// 使用示例
setTimeout(() => {
  if (client.isConnected()) {
    sendMessage('Hello TypeScript!');
  }
}, 1000);
