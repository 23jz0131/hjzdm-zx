import { useEffect, useRef } from 'react';

interface WebSocketServiceProps {
  onMessage?: (message: {type: string, data: any, userId?: number}) => void;
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (error: Event) => void;
  onNotification?: (notification: {type: string, message: string, userId?: number, timestamp: string}) => void; // 新增通知回调
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private listeners: Map<string, Set<any>> = new Map(); // 修改类型定义以适应不同类型的事件

  connect(userId?: number) {
    // 构建WebSocket连接URL
    // 使用当前页面的hostname，但指定后端端口，避免跨域问题
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const backendHost = window.location.hostname; // 使用当前页面的主机名
    const backendPort = 9090; // 后端WebSocket服务端口
    const wsUrl = `${protocol}//${backendHost}:${backendPort}/ws`;
    
    console.log('Attempting to connect to WebSocket:', wsUrl);

    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = (event) => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0; // 重置重连计数
        
        // 发送用户ID（如果可用）
        if (userId) {
          this.send(JSON.stringify({ 
            type: 'register', 
            userId: userId,
            message: 'User registration for notifications'
          }));
        }
        
        // 触发打开监听器
        if (this.listeners.has('open')) {
          this.listeners.get('open')?.forEach((callback: (data: any) => void) => callback(event));
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyListeners(data.type, data);
          
          // 触发通用消息监听器
          if (this.listeners.has('message')) {
            this.listeners.get('message')?.forEach((callback: (data: {type: string, data: any, userId?: number}) => void) => callback(data));
          }
          
          // 特别处理通知消息
          if (data.type === 'notification') {
            if (this.listeners.has('notification')) {
              this.listeners.get('notification')?.forEach((callback: (data: any) => void) => callback(data));
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          // 如果不是JSON格式，则触发通用消息监听器
          if (this.listeners.has('message')) {
            this.listeners.get('message')?.forEach((callback: (data: {type: string, data: any, userId?: number}) => void) => callback(event.data));
          }
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event);
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          console.log(`Attempting to reconnect (${++this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          setTimeout(() => this.connect(userId), this.reconnectInterval);
        } else {
          console.error('Max reconnection attempts reached');
        }
        
        // 触发关闭监听器
        if (this.listeners.has('close')) {
          this.listeners.get('close')?.forEach((callback: (data: any) => void) => callback(event));
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        
        // 触发错误监听器
        if (this.listeners.has('error')) {
          this.listeners.get('error')?.forEach((callback: (data: any) => void) => callback(error));
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }

  send(message: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      console.warn('WebSocket is not open. ReadyState:', this.ws?.readyState);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  addEventListener(type: string, callback: any) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)?.add(callback);
  }

  removeEventListener(type: string, callback: any) {
    if (this.listeners.has(type)) {
      this.listeners.get(type)?.delete(callback);
    }
  }

  private notifyListeners(type: string, data: {type: string, data: any, userId?: number}) {
    if (this.listeners.has(type)) {
      this.listeners.get(type)?.forEach((callback: (data: {type: string, data: any, userId?: number}) => void) => callback(data));
    }
  }

  getStatus() {
    if (!this.ws) return 'disconnected';
    const readyStates = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
    return readyStates[this.ws.readyState];
  }
}

// 创建全局单例
const websocketService = new WebSocketService();

export default websocketService;

// React Hook for easy integration
export const useWebSocket = ({ onMessage, onOpen, onClose, onError, onNotification }: WebSocketServiceProps) => {
  const wsRef = useRef(websocketService);

  useEffect(() => {
    const currentWs = wsRef.current;
    
    if (onMessage) {
      currentWs.addEventListener('message', onMessage);
    }
    if (onOpen) {
      currentWs.addEventListener('open', onOpen);
    }
    if (onClose) {
      currentWs.addEventListener('close', onClose);
    }
    if (onError) {
      currentWs.addEventListener('error', onError);
    }
    if (onNotification) {
      currentWs.addEventListener('notification', onNotification);
    }

    // 清理函数
    return () => {
      if (onMessage) {
        currentWs.removeEventListener('message', onMessage);
      }
      if (onOpen) {
        currentWs.removeEventListener('open', onOpen);
      }
      if (onClose) {
        currentWs.removeEventListener('close', onClose);
      }
      if (onError) {
        currentWs.removeEventListener('error', onError);
      }
      if (onNotification) {
        currentWs.removeEventListener('notification', onNotification);
      }
    };
  }, [onMessage, onOpen, onClose, onError, onNotification]);

  return wsRef.current;
};