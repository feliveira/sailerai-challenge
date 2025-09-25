import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useWebSocketChat } from '../../composables/useWebSocketChat'

class MockWebSocket {
  static instances: MockWebSocket[] = []

  readyState = 0
  onopen: (() => void) | null = null
  onclose: ((event: { wasClean: boolean; code: number }) => void) | null = null
  onerror: ((error: any) => void) | null = null
  url: string

  constructor(url: string) {
    this.url = url
    MockWebSocket.instances.push(this)
    setTimeout(() => {
      this.readyState = 1 // OPEN
      this.onopen?.()
    }, 10)
  }

  close(code = 1000, reason?: string) {
    this.readyState = 3 // CLOSED
    setTimeout(() => {
      this.onclose?.({ wasClean: code === 1000, code })
    }, 10)
  }
}

vi.stubGlobal('WebSocket', MockWebSocket)

describe('useWebSocketChat', () => {
  let wsChat: ReturnType<typeof useWebSocketChat>

  beforeEach(() => {
    vi.useFakeTimers() // Use fake timers
    wsChat = useWebSocketChat()
    MockWebSocket.instances = []
  })

  afterEach(() => {
    wsChat.disconnectAll()
    vi.useRealTimers() // Restore real timers
  })

  it('connects and sets status to connected', async () => {
    const promise = wsChat.connect('chat1')
    vi.advanceTimersByTime(20) // trigger onopen
    const socket = await promise
    expect(socket).toBeInstanceOf(MockWebSocket)
    expect(wsChat.getConnectionStatus('chat1')).toBe('connected')
    expect(wsChat.isConnected('chat1')).toBe(true)
  })

  it('disconnect closes the socket and updates status', async () => {
    const promise = wsChat.connect('chat1')
    vi.advanceTimersByTime(20)
    await promise

    wsChat.disconnect('chat1')
    expect(wsChat.getConnectionStatus('chat1')).toBe('disconnected')
    expect(wsChat.getConnection('chat1')).toBeUndefined()
  })

  it('disconnectAll closes all sockets', async () => {
    const p1 = wsChat.connect('chat1')
    const p2 = wsChat.connect('chat2')
    vi.advanceTimersByTime(20)
    await Promise.all([p1, p2])

    wsChat.disconnectAll()
    expect(wsChat.getConnectionStatus('chat1')).toBe('disconnected')
    expect(wsChat.getConnectionStatus('chat2')).toBe('disconnected')
  })

  it('handles websocket error and rejects', async () => {
    const failingWS = vi.fn().mockImplementation(() => {
      return {
        onopen: null,
        onclose: null,
        onerror: null,
        close: vi.fn(),
        readyState: 0,
      }
    })
    vi.stubGlobal('WebSocket', failingWS)

    const { connect } = useWebSocketChat()
    const promise = connect('chat1')

    // Simulate error
    setTimeout(() => {
      const wsInstance = failingWS.mock.results[0]?.value;
      if (wsInstance && wsInstance.onerror) {
        wsInstance.onerror(new Error('fail'));
      }
    }, 0)
    vi.advanceTimersByTime(1)

    await expect(promise).rejects.toThrow('fail')
  })
})
