import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type ChatRole = 'user' | 'jarvis'

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  createdAt: number
}

type JarvisSessionContextValue = {
  messages: ChatMessage[]
  appendMessage: (role: ChatRole, content: string) => void
  clearMessages: () => void
}

const JarvisSessionContext = createContext<JarvisSessionContextValue | null>(
  null,
)

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function JarvisSessionProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: createId(),
      role: 'jarvis',
      content:
        'Systems online. Neural interface standing by. Awaiting your directive, sir.',
      createdAt: Date.now() - 60_000,
    },
  ])

  const appendMessage = useCallback((role: ChatRole, content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: createId(), role, content, createdAt: Date.now() },
    ])
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  const value = useMemo(
    () => ({ messages, appendMessage, clearMessages }),
    [appendMessage, clearMessages, messages],
  )

  return (
    <JarvisSessionContext.Provider value={value}>
      {children}
    </JarvisSessionContext.Provider>
  )
}

export function useJarvisSession() {
  const ctx = useContext(JarvisSessionContext)
  if (!ctx) {
    throw new Error('useJarvisSession must be used within JarvisSessionProvider')
  }
  return ctx
}
