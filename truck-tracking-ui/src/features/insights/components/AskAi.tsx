import { Bot, Send, Sparkles, User } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { answerFor, CANNED_QA } from '@/features/insights/qa'
import { cn } from '@/utils/cn'

interface ChatMessage {
  role: 'user' | 'ai'
  text: string
}

const GREETING: ChatMessage = {
  role: 'ai',
  text: 'Hi! Ask me about bottlenecks, bay performance, yard congestion or predicted TAT.',
}

/** Demo "Ask AI" box — matches questions to pre-written answers (no real API). */
export function AskAi() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING])
  const [input, setInput] = useState('')

  const ask = (question: string) => {
    const q = question.trim()
    if (!q) return
    setMessages((m) => [...m, { role: 'user', text: q }, { role: 'ai', text: answerFor(q) }])
    setInput('')
  }

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn('flex gap-2', msg.role === 'user' && 'flex-row-reverse')}
          >
            <div
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                msg.role === 'ai' ? 'bg-brand-50 text-brand-600' : 'bg-slate-100 text-slate-500',
              )}
            >
              {msg.role === 'ai' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </div>
            <div
              className={cn(
                'max-w-[80%] rounded-xl px-3 py-2 text-sm',
                msg.role === 'ai'
                  ? 'rounded-tl-none bg-slate-100 text-ink'
                  : 'rounded-tr-none bg-brand-600 text-white',
              )}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {CANNED_QA.map((qa) => (
          <button
            key={qa.question}
            type="button"
            onClick={() => ask(qa.question)}
            className="flex items-center gap-1 rounded-full border border-line bg-panel px-2.5 py-1 text-xs text-slate-600 transition-colors hover:border-brand-300 hover:text-brand-700"
          >
            <Sparkles className="h-3 w-3 text-brand-500" />
            {qa.question}
          </button>
        ))}
      </div>

      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          ask(input)
        }}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
        />
        <Button type="submit" leftIcon={<Send className="h-4 w-4" />} disabled={!input.trim()}>
          Ask
        </Button>
      </form>
    </div>
  )
}
