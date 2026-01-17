# mp-websocket-client

一个针对小程序 WebSocket 原生 API 的封装，支持原生小程序/Taro 等架构的小程序。

## 特性

- ✅ 支持微信小程序原生 API
- ✅ 支持 Taro 框架
- ✅ 自动重连机制
- ✅ 心跳保活
- ✅ TypeScript 支持
- ✅ 完善的错误处理
- ✅ Promise 支持

## 安装

```bash
npm install mp-websocket-client
```

## 快速开始

### 在原生微信小程序中使用

```javascript
import { MPWebSocketClient } from 'mp-websocket-client';

const client = new MPWebSocketClient({
  url: 'ws://your-websocket-server.com',
  autoReconnect: true,
  enableHeartbeat: true
});

client.connect({
  onOpen: (res) => {
    console.log('连接已打开', res);
    client.send('Hello WebSocket!');
  },
  onMessage: (res) => {
    console.log('收到消息', res.data);
  },
  onClose: (res) => {
    console.log('连接已关闭', res);
  },
  onError: (res) => {
    console.error('连接错误', res);
  }
});
```

### 在 Taro 中使用

```javascript
import Taro from '@tarojs/taro';
import { MPWebSocketClient } from 'mp-websocket-client';

const client = new MPWebSocketClient({
  url: 'ws://your-websocket-server.com'
}, Taro); // 传入 Taro 对象

client.connect({
  onOpen: () => {
    console.log('WebSocket 已连接');
  },
  onMessage: (res) => {
    console.log('收到消息:', res.data);
  }
});
```

## API 文档

### 构造函数

```typescript
new MPWebSocketClient(options: SocketOptions, mpApi?: MiniProgramWebSocket)
```

#### SocketOptions

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| url | string | 是 | - | WebSocket 服务器地址 |
| protocols | string[] | 否 | [] | 子协议数组 |
| autoReconnect | boolean | 否 | true | 是否自动重连 |
| reconnectInterval | number | 否 | 3000 | 重连间隔时间（毫秒） |
| maxReconnectAttempts | number | 否 | 0 | 最大重连次数，0 表示无限重连 |
| enableHeartbeat | boolean | 否 | true | 是否启用心跳 |
| heartbeatInterval | number | 否 | 30000 | 心跳间隔时间（毫秒） |
| heartbeatMessage | string \| ArrayBuffer | 否 | 'ping' | 心跳消息内容 |
| timeout | number | 否 | 10000 | 连接超时时间（毫秒） |

### 方法

#### connect(handlers?: SocketEventHandlers): void

连接 WebSocket 服务器。

```javascript
client.connect({
  onOpen: (res) => {},
  onMessage: (res) => {},
  onClose: (res) => {},
  onError: (res) => {}
});
```

#### send(data: string | ArrayBuffer): Promise<void>

发送消息到 WebSocket 服务器。

```javascript
// 发送文本消息
await client.send('Hello');

// 发送二进制数据
const buffer = new ArrayBuffer(8);
await client.send(buffer);
```

#### close(code?: number, reason?: string): void

关闭 WebSocket 连接。

```javascript
client.close(1000, 'Normal closure');
```

#### getState(): SocketState

获取当前连接状态。

```javascript
const state = client.getState();
// SocketState.CONNECTING = 0
// SocketState.OPEN = 1
// SocketState.CLOSING = 2
// SocketState.CLOSED = 3
```

#### isConnected(): boolean

检查是否已连接。

```javascript
if (client.isConnected()) {
  client.send('Message');
}
```

#### setEventHandlers(handlers: SocketEventHandlers): void

设置或更新事件处理器。

```javascript
client.setEventHandlers({
  onMessage: (res) => {
    console.log('新的消息处理器', res.data);
  }
});
```

## 高级用法

### 自定义重连策略

```javascript
const client = new MPWebSocketClient({
  url: 'ws://your-server.com',
  autoReconnect: true,
  reconnectInterval: 5000,      // 5秒后重连
  maxReconnectAttempts: 10      // 最多重连10次
});
```

### 自定义心跳消息

```javascript
const client = new MPWebSocketClient({
  url: 'ws://your-server.com',
  enableHeartbeat: true,
  heartbeatInterval: 15000,     // 每15秒发送一次心跳
  heartbeatMessage: JSON.stringify({ type: 'ping' })
});
```

### 处理二进制数据

```javascript
client.connect({
  onMessage: (res) => {
    if (res.data instanceof ArrayBuffer) {
      // 处理二进制数据
      const uint8Array = new Uint8Array(res.data);
      console.log('收到二进制数据', uint8Array);
    } else {
      // 处理文本数据
      console.log('收到文本数据', res.data);
    }
  }
});
```

### 在小程序页面中使用

```javascript
// pages/index/index.js
import { MPWebSocketClient } from 'mp-websocket-client';

Page({
  data: {
    messages: []
  },
  
  onLoad() {
    this.client = new MPWebSocketClient({
      url: 'ws://your-server.com'
    });
    
    this.client.connect({
      onOpen: () => {
        console.log('连接成功');
      },
      onMessage: (res) => {
        this.setData({
          messages: [...this.data.messages, res.data]
        });
      }
    });
  },
  
  sendMessage(message) {
    this.client.send(message);
  },
  
  onUnload() {
    // 页面卸载时关闭连接
    this.client.close();
  }
});
```

## TypeScript 支持

本库使用 TypeScript 编写，提供完整的类型定义：

```typescript
import { 
  MPWebSocketClient, 
  SocketOptions, 
  SocketEventHandlers,
  SocketState 
} from 'mp-websocket-client';

const options: SocketOptions = {
  url: 'ws://your-server.com',
  autoReconnect: true
};

const handlers: SocketEventHandlers = {
  onOpen: (res) => console.log(res),
  onMessage: (res) => console.log(res.data)
};

const client = new MPWebSocketClient(options);
client.connect(handlers);
```

## 注意事项

1. 微信小程序对 WebSocket 连接有数量限制（通常为5个并发连接）
2. 确保在页面卸载时调用 `close()` 方法关闭连接
3. 建议在 `onOpen` 回调中发送消息，确保连接已建立
4. 心跳消息应与服务器约定好格式

## 兼容性

- 微信小程序基础库 1.0.0+
- Taro 2.x / 3.x

## License

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！