export interface WebSocketEvent {
  event: 'message_received' | 'presence_updated' | 'chat_read'
  data: any
}

export interface WebSocketMessage {
  id: string
  user_id: string
  type: string
  content: string
  timestamp: string
}

export interface WebSocketPresence {
  user_id: string
  status: 'online' | 'offline' | 'typing'
  last_seen: string
}

export interface WebSocketChatRead {
  chat_id: string
  user_id: string
  last_read_message_id: string
}

export const useWebSocketChat = () => {
  const connections = ref<Map<string, WebSocket>>(new Map())
  const connectionStatus = ref<Map<string, 'connecting' | 'connected' | 'disconnected'>>(new Map())
  const reconnectAttempts = ref<Map<string, number>>(new Map())
  const maxReconnectAttempts = 5
  const baseReconnectDelay = 1000 // Start with 1 second


  const connect = (chatId: string): Promise<WebSocket> => {
    return new Promise((resolve, reject) => {
      
      // Clean up existing connection
      disconnect(chatId)

      const wsUrl = `ws://localhost:8000/ws/${chatId}`
      
      const socket = new WebSocket(wsUrl)
      
      connectionStatus.value.set(chatId, 'connecting')

      // Set a connection timeout
      const connectionTimeout = setTimeout(() => {
        socket.close()
        connectionStatus.value.set(chatId, 'disconnected')
        reject(new Error('WebSocket connection timeout'))
      }, 10000)

      socket.onopen = (event) => {
        clearTimeout(connectionTimeout)
        
        connectionStatus.value.set(chatId, 'connected')
        connections.value.set(chatId, socket)
        reconnectAttempts.value.set(chatId, 0) // Reset reconnect attempts
        
        resolve(socket)
      }

      socket.onerror = (error) => {
        clearTimeout(connectionTimeout)
        connectionStatus.value.set(chatId, 'disconnected')
        reject(error)
      }

      socket.onclose = (event) => {
        clearTimeout(connectionTimeout)
        
        const closeInfo = {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          readyState: socket.readyState
        }
        
        
        
        connectionStatus.value.set(chatId, 'disconnected')
        connections.value.delete(chatId)
        
        // Reconnection logic
        if (!event.wasClean && event.code !== 1000) {
          const currentAttempts = reconnectAttempts.value.get(chatId) || 0
          
          if (currentAttempts < maxReconnectAttempts) {
            const delay = baseReconnectDelay * Math.pow(2, currentAttempts) // Exponential backoff
            reconnectAttempts.value.set(chatId, currentAttempts + 1)
            
            
            setTimeout(() => {
              connect(chatId).catch(error => {
              })
            }, delay)
          } else {
            reconnectAttempts.value.delete(chatId)
          }
        } else {
          reconnectAttempts.value.delete(chatId)
        }
      }

      // Check state periodically during connection
      const stateCheckInterval = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CLOSED) {
          clearInterval(stateCheckInterval)
        }
      }, 500)
    })
  }

  const disconnect = (chatId: string) => {
    const socket = connections.value.get(chatId)
    if (socket) {
     
      
      socket.close(1000, 'Intentional disconnect')
      connections.value.delete(chatId)
      connectionStatus.value.delete(chatId)
      reconnectAttempts.value.delete(chatId)
    }
  }

  const disconnectAll = () => {
    
    connections.value.forEach((socket, chatId) => {
      disconnect(chatId)
    })
    
  }

  const getConnection = (chatId: string): WebSocket | undefined => {
    const connection = connections.value.get(chatId)
    return connection
  }

  const getConnectionStatus = (chatId: string): string => {
    const status = connectionStatus.value.get(chatId) || 'disconnected'
    return status
  }

  const isConnected = (chatId: string): boolean => {
    const connected = connectionStatus.value.get(chatId) === 'connected'
    return connected
  }

  // Cleanup on unmount
  onUnmounted(() => {
    disconnectAll()
  })

  return {
    connections: readonly(connections),
    connectionStatus: readonly(connectionStatus),
    reconnectAttempts: readonly(reconnectAttempts),
    connect,
    disconnect,
    disconnectAll,
    getConnection,
    getConnectionStatus,
    isConnected,
  }
}