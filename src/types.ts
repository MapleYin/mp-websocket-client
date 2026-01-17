/**
 * WebSocket 连接状态
 */
export enum SocketState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3
}

/**
 * WebSocket 配置选项
 */
export interface SocketOptions {
  /** WebSocket 服务器地址 */
  url: string;
  /** 子协议 */
  protocols?: string[];
  /** 是否自动重连 */
  autoReconnect?: boolean;
  /** 重连间隔时间（毫秒） */
  reconnectInterval?: number;
  /** 最大重连次数，0 表示无限重连 */
  maxReconnectAttempts?: number;
  /** 是否启用心跳 */
  enableHeartbeat?: boolean;
  /** 心跳间隔时间（毫秒） */
  heartbeatInterval?: number;
  /** 心跳消息内容 */
  heartbeatMessage?: string | ArrayBuffer;
  /** 连接超时时间（毫秒） */
  timeout?: number;
}

/**
 * WebSocket 事件回调
 */
export interface SocketEventHandlers {
  /** 连接打开时的回调 */
  onOpen?: (res: any) => void;
  /** 收到消息时的回调 */
  onMessage?: (res: any) => void;
  /** 连接关闭时的回调 */
  onClose?: (res: any) => void;
  /** 连接错误时的回调 */
  onError?: (res: any) => void;
}

/**
 * 小程序 WebSocket API 接口定义
 */
export interface MiniProgramWebSocket {
  connectSocket(options: any): any;
  onSocketOpen(callback: (res: any) => void): void;
  onSocketMessage(callback: (res: any) => void): void;
  onSocketError(callback: (res: any) => void): void;
  onSocketClose(callback: (res: any) => void): void;
  sendSocketMessage(options: any): void;
  closeSocket(options?: any): void;
}
