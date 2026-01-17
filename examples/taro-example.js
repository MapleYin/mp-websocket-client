/**
 * Taro 框架示例
 */

import Taro from '@tarojs/taro';
import { MPWebSocketClient } from 'mp-websocket-client';

// 在 Taro 组件或页面中使用
export default class WebSocketDemo {
  client = null;
  
  componentDidMount() {
    // 创建 WebSocket 客户端实例，传入 Taro 对象
    this.client = new MPWebSocketClient({
      url: 'wss://echo.websocket.org',
      autoReconnect: true,
      enableHeartbeat: true
    }, Taro);
    
    // 连接 WebSocket
    this.client.connect({
      onOpen: () => {
        console.log('WebSocket 已连接');
        this.client.send('Hello from Taro!');
      },
      
      onMessage: (res) => {
        console.log('收到消息:', res.data);
        // 更新组件状态
        this.setState({
          messages: [...this.state.messages, res.data]
        });
      },
      
      onClose: () => {
        console.log('WebSocket 已断开');
      },
      
      onError: (err) => {
        console.error('WebSocket 错误', err);
      }
    });
  }
  
  componentWillUnmount() {
    // 组件卸载时关闭连接
    if (this.client) {
      this.client.close();
    }
  }
  
  sendMessage = (text) => {
    if (this.client && this.client.isConnected()) {
      this.client.send(text)
        .then(() => {
          console.log('发送成功');
        })
        .catch((err) => {
          console.error('发送失败', err);
        });
    }
  }
}
