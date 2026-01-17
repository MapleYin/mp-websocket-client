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
 * WebSocket 连接成功回调参数
 */
export interface SocketOpenResponse {
  header?: Record<string, any>;
}

/**
 * WebSocket 接收消息回调参数
 */
export interface SocketMessageResponse {
  data: string | ArrayBuffer;
}

/**
 * WebSocket 关闭回调参数
 */
export interface SocketCloseResponse {
  code: number;
  reason: string;
}

/**
 * WebSocket 错误回调参数
 */
export interface SocketErrorResponse {
  errMsg: string;
}

/**
 * WebSocket 事件回调
 */
export interface SocketEventHandlers {
  /** 连接打开时的回调 */
  onOpen?: (res: SocketOpenResponse) => void;
  /** 收到消息时的回调 */
  onMessage?: (res: SocketMessageResponse) => void;
  /** 连接关闭时的回调 */
  onClose?: (res: SocketCloseResponse) => void;
  /** 连接错误时的回调 */
  onError?: (res: SocketErrorResponse) => void;
}

/**
 * 小程序 WebSocket 连接选项
 */
export interface ConnectSocketOptions {
  url: string;
  protocols?: string[];
  success?: () => void;
  fail?: (error: any) => void;
}

/**
 * 小程序 WebSocket 发送消息选项
 */
export interface SendSocketMessageOptions {
  data: string | ArrayBuffer;
  success?: () => void;
  fail?: (error: any) => void;
}

/**
 * 小程序 WebSocket 关闭选项
 */
export interface CloseSocketOptions {
  code?: number;
  reason?: string;
  success?: () => void;
  fail?: (error: any) => void;
}

/**
 * 小程序 WebSocket Task 对象
 */
export interface SocketTask {
  send?: (options: SendSocketMessageOptions) => void;
  close?: (options: CloseSocketOptions) => void;
  onOpen?: (callback: (res: SocketOpenResponse) => void) => void;
  onMessage?: (callback: (res: SocketMessageResponse) => void) => void;
  onError?: (callback: (res: SocketErrorResponse) => void) => void;
  onClose?: (callback: (res: SocketCloseResponse) => void) => void;
}

/**
 * 小程序 WebSocket API 接口定义
 */
export interface MiniProgramWebSocket {
  connectSocket(options: ConnectSocketOptions): SocketTask | void;
  onSocketOpen(callback: (res: SocketOpenResponse) => void): void;
  onSocketMessage(callback: (res: SocketMessageResponse) => void): void;
  onSocketError(callback: (res: SocketErrorResponse) => void): void;
  onSocketClose(callback: (res: SocketCloseResponse) => void): void;
  sendSocketMessage(options: SendSocketMessageOptions): void;
  closeSocket(options?: CloseSocketOptions): void;
}
