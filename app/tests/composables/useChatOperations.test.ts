import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useChatOperations } from '../../composables/useChatOperations'

// Mock the useApi composable
const mockApi = vi.fn()
vi.mock('../../composables/useApi', () => ({
  useApi: () => mockApi
}))

// Mock console.error to avoid noise in tests
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('useChatOperations', () => {
  const chatOperations = useChatOperations()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    consoleErrorSpy.mockClear()
  })

  describe('createChat', () => {
    it('should create a chat successfully', async () => {
      const mockResponse = { id: 'chat-123', participants: ['user1', 'user2'] }
      mockApi.mockResolvedValueOnce(mockResponse)

      const participants = ['user1', 'user2']
      const result = await chatOperations.createChat(participants)

      expect(mockApi).toHaveBeenCalledWith('/chats', {
        method: 'POST',
        body: { participants }
      })
      expect(result).toEqual(mockResponse)
    })

    it('should handle create chat error', async () => {
      const error = new Error('Failed to create chat')
      mockApi.mockRejectedValueOnce(error)

      const participants = ['user1', 'user2']
      
      await expect(chatOperations.createChat(participants)).rejects.toThrow('Failed to create chat')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating chat:', error)
    })
  })

  describe('sendMessage', () => {
    it('should send a message successfully with default type', async () => {
      const mockResponse = { id: 'msg-123', content: 'Hello world' }
      mockApi.mockResolvedValueOnce(mockResponse)

      const result = await chatOperations.sendMessage('chat-123', 'user-456', 'Hello world')

      expect(mockApi).toHaveBeenCalledWith('/chats/chat-123/messages', {
        method: 'POST',
        body: {
          user_id: 'user-456',
          type: 'text',
          content: 'Hello world'
        }
      })
      expect(result).toEqual(mockResponse)
    })

    it('should send a message successfully with custom type', async () => {
      const mockResponse = { id: 'msg-123', content: 'image.jpg' }
      mockApi.mockResolvedValueOnce(mockResponse)

      const result = await chatOperations.sendMessage('chat-123', 'user-456', 'image.jpg', 'image')

      expect(mockApi).toHaveBeenCalledWith('/chats/chat-123/messages', {
        method: 'POST',
        body: {
          user_id: 'user-456',
          type: 'image',
          content: 'image.jpg'
        }
      })
      expect(result).toEqual(mockResponse)
    })

    it('should handle send message error', async () => {
      const error = new Error('Failed to send message')
      mockApi.mockRejectedValueOnce(error)

      await expect(
        chatOperations.sendMessage('chat-123', 'user-456', 'Hello world')
      ).rejects.toThrow('Failed to send message')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error sending message:', error)
    })
  })

  describe('updatePresence', () => {
    it.each(['online', 'offline', 'typing'] as const)(
      'should update presence to %s successfully',
      async (status) => {
        const mockResponse = { success: true }
        mockApi.mockResolvedValueOnce(mockResponse)

        const result = await chatOperations.updatePresence('chat-123', 'user-456', status)

        expect(mockApi).toHaveBeenCalledWith('/chats/chat-123/presence', {
          method: 'POST',
          body: {
            user_id: 'user-456',
            status
          }
        })
        expect(result).toEqual(mockResponse)
      }
    )

    it('should handle update presence error', async () => {
      const error = new Error('Failed to update presence')
      mockApi.mockRejectedValueOnce(error)

      await expect(
        chatOperations.updatePresence('chat-123', 'user-456', 'online')
      ).rejects.toThrow('Failed to update presence')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating presence:', error)
    })
  })

  describe('markAsRead', () => {
    it('should mark chat as read successfully', async () => {
      const mockResponse = { success: true }
      mockApi.mockResolvedValueOnce(mockResponse)

      const result = await chatOperations.markAsRead('chat-123', 'user-456')

      expect(mockApi).toHaveBeenCalledWith('/chats/chat-123/read', {
        method: 'POST',
        body: {
          user_id: 'user-456'
        }
      })
      expect(result).toEqual(mockResponse)
    })

    it('should handle mark as read error', async () => {
      const error = new Error('Failed to mark as read')
      mockApi.mockRejectedValueOnce(error)

      await expect(
        chatOperations.markAsRead('chat-123', 'user-456')
      ).rejects.toThrow('Failed to mark as read')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error marking chat as read:', error)
    })
  })

  describe('fetchChats', () => {
    it('should fetch chats successfully', async () => {
      const mockResponse = [
        { id: 'chat-1', name: 'Chat 1' },
        { id: 'chat-2', name: 'Chat 2' }
      ]
      mockApi.mockResolvedValueOnce(mockResponse)

      const result = await chatOperations.fetchChats()

      expect(mockApi).toHaveBeenCalledWith('/chats')
      expect(result).toEqual(mockResponse)
    })

    it('should handle fetch chats error', async () => {
      const error = new Error('Failed to fetch chats')
      mockApi.mockRejectedValueOnce(error)

      await expect(chatOperations.fetchChats()).rejects.toThrow('Failed to fetch chats')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching chats:', error)
    })
  })

  describe('fetchMessages', () => {
    it('should fetch messages successfully', async () => {
      const mockResponse = [
        { id: 'msg-1', content: 'Hello' },
        { id: 'msg-2', content: 'World' }
      ]
      mockApi.mockResolvedValueOnce(mockResponse)

      const result = await chatOperations.fetchMessages('chat-123')

      expect(mockApi).toHaveBeenCalledWith('/chats/chat-123/messages')
      expect(result).toEqual(mockResponse)
    })

    it('should handle fetch messages error', async () => {
      const error = new Error('Failed to fetch messages')
      mockApi.mockRejectedValueOnce(error)

      await expect(
        chatOperations.fetchMessages('chat-123')
      ).rejects.toThrow('Failed to fetch messages')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching messages:', error)
    })
  })

  describe('API call validation', () => {
    it('should handle empty participants array', async () => {
      const mockResponse = { id: 'chat-123', participants: [] }
      mockApi.mockResolvedValueOnce(mockResponse)

      const result = await chatOperations.createChat([])

      expect(mockApi).toHaveBeenCalledWith('/chats', {
        method: 'POST',
        body: { participants: [] }
      })
      expect(result).toEqual(mockResponse)
    })

    it('should handle empty message content', async () => {
      const mockResponse = { id: 'msg-123', content: '' }
      mockApi.mockResolvedValueOnce(mockResponse)

      const result = await chatOperations.sendMessage('chat-123', 'user-456', '')

      expect(mockApi).toHaveBeenCalledWith('/chats/chat-123/messages', {
        method: 'POST',
        body: {
          user_id: 'user-456',
          type: 'text',
          content: ''
        }
      })
      expect(result).toEqual(mockResponse)
    })
  })
})