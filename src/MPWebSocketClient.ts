import { 
  SocketState, 
  SocketOptions, 
  SocketEventHandlers, 
  MiniProgramWebSocket,
  SocketOpenResponse,
  SocketMessageResponse,
  SocketCloseResponse,
  SocketErrorResponse,
  ConnectSocketOptions,
  SendSocketMessageOptions,
  CloseSocketOptions,
  SocketTask
} from './types';

/**
 * 小程序 WebSocket 客户端封装
 * 支持原生小程序和 Taro 等架构
 */
export class MPWebSocketClient {
  private options: Required<SocketOptions>;
  private socketTask: SocketTask | null = null;
  private state: SocketState = SocketState.CLOSED;
  private reconnectAttempts = 0;
  private reconnectTimer: any = null;
  private heartbeatTimer: any = null;
  private mpApi: MiniProgramWebSocket;
  private eventHandlers: SocketEventHandlers = {};
  private shouldReconnect = true;
  
  /**
   * 创建 WebSocket 客户端实例
   * @param options 配置选项
   * @param mpApi 小程序 WebSocket API，默认使用全局 wx 对象
   */
  constructor(options: SocketOptions, mpApi?: MiniProgramWebSocket) {
    this.options = {
      url: options.url,
      protocols: options.protocols || [],
      autoReconnect: options.autoReconnect !== false,
      reconnectInterval: options.reconnectInterval || 3000,
      maxReconnectAttempts: options.maxReconnectAttempts || 0,
      enableHeartbeat: options.enableHeartbeat !== false,
      heartbeatInterval: options.heartbeatInterval || 30000,
      heartbeatMessage: options.heartbeatMessage || 'ping',
      timeout: options.timeout || 10000
    };
    
    // 自动检测小程序环境
    this.mpApi = mpApi || this.detectMiniProgramAPI();
  }
  
  /**
   * 自动检测小程序 API
   */
  private detectMiniProgramAPI(): MiniProgramWebSocket {
    // 检测是否在小程序环境
    if (typeof wx !== 'undefined') {
      return wx as any;
    }
    
    // 检测是否在 Taro 环境
    if (typeof Taro !== 'undefined') {
      return Taro as any;
    }
    
    throw new Error('未检测到小程序环境，请确保在微信小程序或 Taro 环境中使用');
  }
  
  /**
   * 连接 WebSocket
   */
  public connect(handlers?: SocketEventHandlers): void {
    if (this.state === SocketState.CONNECTING || this.state === SocketState.OPEN) {
      console.warn('WebSocket 已连接或正在连接中');
      return;
    }
    
    if (handlers) {
      this.eventHandlers = handlers;
    }
    
    this.state = SocketState.CONNECTING;
    
    try {
      const connectOptions: ConnectSocketOptions = {
        url: this.options.url,
        success: () => {
          console.log('WebSocket 连接请求发送成功');
        },
        fail: (err: any) => {
          console.error('WebSocket 连接请求失败', err);
          this.handleError({ errMsg: err.errMsg || '连接失败' });
        }
      };
      
      if (this.options.protocols && this.options.protocols.length > 0) {
        connectOptions.protocols = this.options.protocols;
      }
      
      this.socketTask = this.mpApi.connectSocket(connectOptions) as SocketTask || null;
      
      // 绑定事件监听
      this.bindEvents();
    } catch (error: any) {
      console.error('WebSocket 连接异常', error);
      this.handleError({ errMsg: error.message || '连接异常' });
    }
  }
  
  /**
   * 绑定 WebSocket 事件
   * 注意：如果使用全局事件监听（旧版本 API），多个实例会共享事件监听器。
   * 建议使用支持 socketTask 的新版本 API。
   */
  private bindEvents(): void {
    if (!this.socketTask) {
      // 使用全局事件监听（兼容旧版本小程序 API）
      // 注意：此模式下多个 WebSocket 实例会共享事件监听器
      this.mpApi.onSocketOpen(this.handleOpen.bind(this));
      this.mpApi.onSocketMessage(this.handleMessage.bind(this));
      this.mpApi.onSocketError(this.handleError.bind(this));
      this.mpApi.onSocketClose(this.handleClose.bind(this));
    } else {
      // 使用 socketTask 事件监听（推荐）
      this.socketTask.onOpen?.(this.handleOpen.bind(this));
      this.socketTask.onMessage?.(this.handleMessage.bind(this));
      this.socketTask.onError?.(this.handleError.bind(this));
      this.socketTask.onClose?.(this.handleClose.bind(this));
    }
  }
  
  /**
   * 处理连接打开事件
   */
  private handleOpen(res: SocketOpenResponse): void {
    console.log('WebSocket 连接已打开', res);
    this.state = SocketState.OPEN;
    this.reconnectAttempts = 0;
    
    // 启动心跳
    if (this.options.enableHeartbeat) {
      this.startHeartbeat();
    }
    
    // 触发用户回调
    this.eventHandlers.onOpen?.(res);
  }
  
  /**
   * 处理接收消息事件
   */
  private handleMessage(res: SocketMessageResponse): void {
    // 触发用户回调
    this.eventHandlers.onMessage?.(res);
  }
  
  /**
   * 处理连接关闭事件
   */
  private handleClose(res: SocketCloseResponse): void {
    console.log('WebSocket 连接已关闭', res);
    this.state = SocketState.CLOSED;
    
    // 停止心跳
    this.stopHeartbeat();
    
    // 触发用户回调
    this.eventHandlers.onClose?.(res);
    
    // 尝试重连
    if (this.options.autoReconnect && this.shouldReconnect) {
      this.tryReconnect();
    }
  }
  
  /**
   * 处理连接错误事件
   */
  private handleError(res: SocketErrorResponse): void {
    console.error('WebSocket 连接错误', res);
    
    // 触发用户回调
    this.eventHandlers.onError?.(res);
  }
  
  /**
   * 发送消息
   */
  public send(data: string | ArrayBuffer): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.state !== SocketState.OPEN) {
        reject(new Error('WebSocket 未连接'));
        return;
      }
      
      const sendOptions: SendSocketMessageOptions = {
        data,
        success: () => {
          resolve();
        },
        fail: (err: any) => {
          reject(err);
        }
      };
      
      if (this.socketTask && this.socketTask.send) {
        this.socketTask.send(sendOptions);
      } else {
        this.mpApi.sendSocketMessage(sendOptions);
      }
    });
  }
  
  /**
   * 关闭连接
   */
  public close(code?: number, reason?: string): void {
    if (this.state === SocketState.CLOSED || this.state === SocketState.CLOSING) {
      return;
    }
    
    this.state = SocketState.CLOSING;
    this.shouldReconnect = false; // 主动关闭时禁用自动重连
    
    // 停止心跳和重连定时器
    this.stopHeartbeat();
    this.stopReconnect();
    
    const closeOptions: CloseSocketOptions = {
      code: code || 1000,
      reason: reason || 'Normal closure',
      success: () => {
        console.log('WebSocket 关闭成功');
      },
      fail: (err: any) => {
        console.error('WebSocket 关闭失败', err);
      }
    };
    
    if (this.socketTask && this.socketTask.close) {
      this.socketTask.close(closeOptions);
    } else {
      this.mpApi.closeSocket(closeOptions);
    }
  }
  
  /**
   * 尝试重连
   */
  private tryReconnect(): void {
    if (!this.options.autoReconnect || !this.shouldReconnect) {
      return;
    }
    
    if (this.options.maxReconnectAttempts > 0 && 
        this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      console.log('已达到最大重连次数，停止重连');
      return;
    }
    
    this.reconnectAttempts++;
    console.log(`尝试第 ${this.reconnectAttempts} 次重连...`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.options.reconnectInterval);
  }
  
  /**
   * 停止重连
   */
  private stopReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
  
  /**
   * 启动心跳
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      if (this.state === SocketState.OPEN) {
        this.send(this.options.heartbeatMessage).catch(err => {
          console.error('发送心跳失败', err);
        });
      }
    }, this.options.heartbeatInterval);
  }
  
  /**
   * 停止心跳
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
  
  /**
   * 获取当前连接状态
   */
  public getState(): SocketState {
    return this.state;
  }
  
  /**
   * 检查是否已连接
   */
  public isConnected(): boolean {
    return this.state === SocketState.OPEN;
  }
  
  /**
   * 设置事件处理器
   */
  public setEventHandlers(handlers: SocketEventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }
}
