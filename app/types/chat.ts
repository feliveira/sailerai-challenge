export interface Message {
  id: string
  user_id: string
  type: string
  content: string
  timestamp: string
  time?: string,
  isoTime?: string
  fullTime?: string
}

export type ChatStatus = 'online' | 'offline' | 'typing'

export interface Chat {
  chat_id: string,
  name?: string
  lastMessage?: string
  time?: string
  isoTime?: string
  fullTime?: string
  status?: ChatStatus
  statusText?: string
  unreadCount?: number
  messages?: Message[]
}