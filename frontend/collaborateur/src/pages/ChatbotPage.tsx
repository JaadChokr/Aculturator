import { Fragment, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MessageCircleQuestion,
  SendHorizontal,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import type { ChatReply } from '@acculturator/contracts'
import { api } from '@acculturator/shared/api'
import { Mascot, PageHeader } from '@acculturator/shared/components'
import { Avatar, Button, Card } from '@acculturator/shared/ui'
import { spring } from '@acculturator/shared/motion'
import { useAuth } from '@acculturator/shared/auth'
import { collabPath } from '../paths'
import { useProgress } from '../store/progress'

interface Message {
  id: number
  role: 'user' | 'bot'
  text: string
  links?: ChatReply['links']
  feedback?: 'up' | 'down'
}

/** Rendu minimal : **gras** et retours à la ligne. */
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line
            .split(/(\*\*[^*]+\*\*)/g)
            .map((part, j) =>
              part.startsWith('**') ? (
                <strong key={j}>{part.slice(2, -2)}</strong>
              ) : (
                <Fragment key={j}>{part}</Fragment>
              ),
            )}
        </Fragment>
      ))}
    </>
  )
}

const WELCOME: Message = {
  id: 0,
  role: 'bot',
  text: 'Bonjour, je suis **Prévi**, votre assistant santé & sécurité.\nPosez-moi vos questions sur les bons gestes, les démarches ou les risques au travail. Je vous oriente aussi vers les bonnes ressources.',
}

/** Carrousel d'idées de questions, au-dessus du champ de saisie. */
function PromptCarousel({
  ideas,
  disabled,
  onPick,
}: {
  ideas: string[]
  disabled: boolean
  onPick: (q: string) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ start: true, end: true })

  const update = () => {
    const el = ref.current
    if (!el) return
    setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    })
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ideas.length])

  const scroll = (dir: 1 | -1) =>
    ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: 'smooth' })

  return (
    <div className="mx-auto flex w-full max-w-5xl items-center gap-1.5">
      <MessageCircleQuestion
        aria-hidden
        className="hidden size-4 shrink-0 text-muted-foreground sm:block"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="hidden shrink-0 sm:inline-flex"
        onClick={() => scroll(-1)}
        disabled={edges.start}
        aria-label="Idées précédentes"
      >
        <ChevronLeft />
      </Button>
      <div className="relative min-w-0 flex-1">
        <div
          ref={ref}
          onScroll={update}
          role="list"
          aria-label="Idées de questions"
          className="flex snap-x gap-2 overflow-x-auto scroll-smooth py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {ideas.map((q) => (
            <div role="listitem" key={q} className="shrink-0 snap-start">
              <button
                type="button"
                disabled={disabled}
                onClick={() => onPick(q)}
                className="rounded-full border border-primary/25 bg-card px-3.5 py-1.5 text-sm whitespace-nowrap text-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary disabled:opacity-50"
              >
                {q}
              </button>
            </div>
          ))}
        </div>
        {/* Fondus indiquant qu'il reste des idées à faire défiler */}
        {!edges.start && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-card to-transparent"
          />
        )}
        {!edges.end && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-card to-transparent"
          />
        )}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="hidden shrink-0 sm:inline-flex"
        onClick={() => scroll(1)}
        disabled={edges.end}
        aria-label="Idées suivantes"
      >
        <ChevronRight />
      </Button>
    </div>
  )
}

export default function ChatbotPage() {
  const { data: suggestions = [] } = useQuery({
    queryKey: ['chat', 'suggestions'],
    queryFn: api.chat.getSuggestions,
    staleTime: Infinity,
  })
  const { user } = useAuth()
  const recordChat = useProgress((s) => s.recordChat)
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, typing])

  const send = async (text: string) => {
    const q = text.trim()
    if (!q || typing) return
    setInput('')
    setMessages((m) => [...m, { id: Date.now(), role: 'user', text: q }])
    setTyping(true)
    recordChat()
    try {
      const reply = await api.chat.ask(q)
      setMessages((m) => [
        ...m,
        { id: Date.now() + 1, role: 'bot', text: reply.text, links: reply.links },
      ])
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: Date.now() + 1,
          role: 'bot',
          text: 'Oups, je n’ai pas pu répondre. Réessayez dans un instant.',
        },
      ])
    } finally {
      setTyping(false)
      inputRef.current?.focus()
    }
  }

  // Idées de questions proposées dans le fil : on retire celles déjà posées
  const asked = new Set(messages.filter((m) => m.role === 'user').map((m) => m.text))
  const remaining = suggestions.filter((q) => !asked.has(q))

  const rate = (id: number, feedback: 'up' | 'down') =>
    setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, feedback } : msg)))

  return (
    <div>
      <PageHeader
        eyebrow="Assistant"
        title="Une question ? Demandez à Prévi"
        description="Réponses courtes et sourcées sur la santé et la sécurité au travail, disponibles à tout moment."
        className="mb-5"
      />
      <div>
        <Card className="flex h-[calc(100dvh-22rem)] min-h-[420px] flex-col overflow-hidden lg:h-[calc(100dvh-15rem)]">
          <div className="flex items-center gap-3 border-b bg-card px-5 py-3">
            <Mascot className="size-11" />
            <div>
              <div className="font-bold">Prévi</div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-2 shrink-0 rounded-full bg-success" /> En ligne · assistant
                SST
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-muted/30 p-4 sm:p-6" aria-live="polite">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
              {messages.map((m) =>
                m.role === 'user' ? (
                  <motion.div
                    key={m.id}
                    className="flex justify-end gap-2"
                    initial={{ opacity: 0, x: 24, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={spring}
                    style={{ originX: 1 }}
                  >
                    <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-sm">
                      {m.text}
                    </div>
                    <Avatar
                      name={`${user.firstName} ${user.lastName}`}
                      className="size-8 text-xs"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key={m.id}
                    className="flex gap-2"
                    initial={{ opacity: 0, x: -24, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={spring}
                    style={{ originX: 0 }}
                  >
                    <Mascot className="size-9 shrink-0" />
                    <div className="max-w-[85%]">
                      <div className="rounded-2xl rounded-bl-md border bg-card px-4 py-3 text-sm leading-relaxed shadow-sm">
                        <RichText text={m.text} />
                      </div>
                      {m.links && m.links.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {m.links.map((l) => (
                            <Link
                              key={l.to}
                              to={collabPath(l.to)}
                              className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/10"
                            >
                              {l.label} <ArrowRight className="size-3" />
                            </Link>
                          ))}
                        </div>
                      )}
                      {m.id !== 0 && (
                        <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                          {m.feedback ? (
                            <span>Merci pour votre retour !</span>
                          ) : (
                            <>
                              <span>Utile ?</span>
                              <button
                                onClick={() => rate(m.id, 'up')}
                                className="rounded p-1 hover:bg-muted"
                                aria-label="Réponse utile"
                              >
                                <ThumbsUp className="size-3.5" />
                              </button>
                              <button
                                onClick={() => rate(m.id, 'down')}
                                className="rounded p-1 hover:bg-muted"
                                aria-label="Réponse pas utile"
                              >
                                <ThumbsDown className="size-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ),
              )}
              {typing && (
                <div className="flex gap-2">
                  <Mascot mood="thinking" className="size-9 shrink-0" />
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border bg-card px-4 py-3">
                    {[0, 0.15, 0.3].map((d) => (
                      <motion.span
                        key={d}
                        className="size-2 rounded-full bg-muted-foreground/60"
                        animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: d }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="flex flex-col gap-2 border-t bg-card px-4 py-3 sm:px-6"
          >
            {remaining.length > 0 && (
              <PromptCarousel ideas={remaining} disabled={typing} onPick={send} />
            )}
            <div className="mx-auto flex w-full max-w-5xl items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    send(input)
                  }
                }}
                rows={1}
                placeholder="Écrivez votre question…"
                className="max-h-32 min-h-10 flex-1 resize-none rounded-md border border-input bg-background px-3 py-2.5 text-sm focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
                aria-label="Votre question"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || typing}
                aria-label="Envoyer"
              >
                <SendHorizontal />
              </Button>
            </div>
            <p className="mx-auto w-full max-w-5xl px-1 text-[11px] text-muted-foreground">
              Prévi donne des repères généraux validés par l’équipe QHSE. Il ne remplace ni votre
              référent SST, ni le médecin du travail, ni les secours.
            </p>
          </form>
        </Card>
      </div>
    </div>
  )
}
