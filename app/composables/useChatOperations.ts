import { useApi } from './useApi'

export const useChatOperations = () => {
  const api = useApi()

  const createChat = async (participants: string[]) => {
    try {
      const response = await api('/chats', {
        method: 'POST',
        body: { participants }
      })
      return response
    } catch (error) {
      console.error('Error creating chat:', error)
      throw error
    }
  }

  const sendMessage = async (chatId: string, userId: string, content: string, type: string = 'text') => {
    try {
      const response = await api(`/chats/${chatId}/messages`, {
        method: 'POST',
        body: {
          user_id: userId,
          type,
          content
        }
      })
      return response
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  const updatePresence = async (chatId: string, userId: string, status: 'online' | 'offline' | 'typing') => {
    try {
      const response = await api(`/chats/${chatId}/presence`, {
        method: 'POST',
        body: {
          user_id: userId,
          status
        }
      })
      return response
    } catch (error) {
      console.error('Error updating presence:', error)
      throw error
    }
  }

  const markAsRead = async (chatId: string, userId: string) => {
    try {
      const response = await api(`/chats/${chatId}/read`, {
        method: 'POST',
        body: {
          user_id: userId
        }
      })
      return response
    } catch (error) {
      console.error('Error marking chat as read:', error)
      throw error
    }
  }

  const fetchChats = async () => {
    try {
      const response = await api('/chats')
      return response
    } catch (error) {
      console.error('Error fetching chats:', error)
      throw error
    }
  }

  const fetchMessages = async (chatId: string) => {
    try {
      const response = await api(`/chats/${chatId}/messages`)
      return response
    } catch (error) {
      console.error('Error fetching messages:', error)
      throw error
    }
  }

  return {
    createChat,
    sendMessage,
    updatePresence,
    markAsRead,
    fetchChats,
    fetchMessages
  }
}