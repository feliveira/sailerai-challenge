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

export const useWebSocketChat = () => {
  const connections = new Map<string, WebSocket>()
  const connectionStatus = new Map<string, 'connecting' | 'connected' | 'disconnected'>()
  const reconnectAttempts = new Map<string, number>()

  const maxReconnectAttempts = 5
  const baseReconnectDelay = 1000 // Start with 1 second

  const connect = (chatId: string): Promise<WebSocket> => {
    return new Promise((resolve, reject) => {
      // Clean up existing connection
      disconnect(chatId)

      const wsUrl = `ws://localhost:8000/ws/${chatId}`
      const socket = new WebSocket(wsUrl)

      connectionStatus.set(chatId, 'connecting')

      // Set a connection timeout
      const connectionTimeout = setTimeout(() => {
        socket.close()
        connectionStatus.set(chatId, 'disconnected')
        reject(new Error('WebSocket connection timeout'))
      }, 10000)

      socket.onopen = () => {
        clearTimeout(connectionTimeout)

        connectionStatus.set(chatId, 'connected')
        connections.set(chatId, socket)
        reconnectAttempts.set(chatId, 0) // Reset reconnect attempts

        resolve(socket)
      }

      socket.onerror = (error) => {
        clearTimeout(connectionTimeout)
        connectionStatus.set(chatId, 'disconnected')
        reject(error)
      }

      socket.onclose = (event) => {
        clearTimeout(connectionTimeout)

        connectionStatus.set(chatId, 'disconnected')
        connections.delete(chatId)

        // Reconnection logic
        if (!event.wasClean && event.code !== 1000) {
          const currentAttempts = reconnectAttempts.get(chatId) || 0

          if (currentAttempts < maxReconnectAttempts) {
            const delay = baseReconnectDelay * Math.pow(2, currentAttempts) // Exponential backoff
            reconnectAttempts.set(chatId, currentAttempts + 1)

            setTimeout(() => {
              connect(chatId).catch(() => {
                /* ignore errors during reconnect */
              })
            }, delay)
          } else {
            reconnectAttempts.delete(chatId)
          }
        } else {
          reconnectAttempts.delete(chatId)
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
    const socket = connections.get(chatId)
    if (socket) {
      socket.close(1000, 'Intentional disconnect')
      connections.delete(chatId)
      connectionStatus.delete(chatId)
      reconnectAttempts.delete(chatId)
    }
  }

  const disconnectAll = () => {
    connections.forEach((_, chatId) => {
      disconnect(chatId)
    })
  }

  const getConnection = (chatId: string): WebSocket | undefined => {
    return connections.get(chatId)
  }

  const getConnectionStatus = (chatId: string): string => {
    return connectionStatus.get(chatId) || 'disconnected'
  }

  const isConnected = (chatId: string): boolean => {
    return connectionStatus.get(chatId) === 'connected'
  }

  return {
    connections,
    connectionStatus,
    reconnectAttempts,
    connect,
    disconnect,
    disconnectAll,
    getConnection,
    getConnectionStatus,
    isConnected,
  }
}
