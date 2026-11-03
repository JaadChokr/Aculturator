import { Fragment, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router'
import { ArrowRight, Info, Phone, SendHorizontal, ThumbsDown, ThumbsUp } from 'lucide-react'
import { CHAT_SUGGESTIONS } from '@/shared/content'
import { chatService, type ChatReply } from '@/shared/api/chat'
import { Mascot } from '@/shared/components/Mascot'
import { PageHeader } from '@/shared/components/PageHeader'
import { PillarTags } from '@/shared/components/PillarTag'
import { Avatar, Button, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'
import { spring } from '@/shared/motion'
import { useAuth } from '@/app/auth/AuthProvider'
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

export default function ChatbotPage() {
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
      const reply = await chatService.ask(q)
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

  const rate = (id: number, feedback: 'up' | 'down') =>
    setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, feedback } : msg)))

  return (
    <div>
      <PageHeader
        eyebrow="Assistant"
        title="Une question ? Demandez à Prévi"
        description="Réponses courtes et sourcées sur la santé et la sécurité au travail, disponibles à tout moment."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="flex h-[calc(100dvh-16rem)] min-h-[480px] flex-col overflow-hidden">
          <div className="flex items-center gap-3 border-b bg-card px-5 py-3">
            <Mascot className="size-11" />
            <div>
              <div className="font-bold">Prévi</div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-2 rounded-full bg-success" /> En ligne · assistant SST
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-muted/30 p-4 sm:p-6" aria-live="polite">
            <div className="flex flex-col gap-4">
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

          {messages.length <= 1 && (
            <div className="flex gap-2 overflow-x-auto border-t px-4 py-3">
              {CHAT_SUGGESTIONS.slice(0, 4).map((s) => (
                <motion.button
                  key={s}
                  onClick={() => send(s)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="shrink-0 rounded-full border bg-card px-3 py-1.5 text-xs font-semibold hover:border-primary/50 hover:bg-primary/5"
                >
                  {s}
                </motion.button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="flex items-end gap-2 border-t bg-card p-3"
          >
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
              className="max-h-32 min-h-10 flex-1 resize-none rounded-lg border bg-background px-3 py-2.5 text-sm focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
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
          </form>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="border-destructive/40 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Phone className="size-5" /> Urgence ?
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {[
                ['15', 'SAMU'],
                ['18', 'Pompiers'],
                ['112', 'Europe'],
                ['114', 'Par SMS'],
              ].map(([n, l]) => (
                <a
                  key={n}
                  href={`tel:${n}`}
                  className="rounded-lg border bg-card p-2 text-center hover:border-destructive/50"
                >
                  <div className="text-xl font-bold text-destructive">{n}</div>
                  <div className="text-xs font-semibold text-muted-foreground">{l}</div>
                </a>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Idées de questions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1.5">
              {CHAT_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className={cn(
                    'rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-muted',
                    typing && 'pointer-events-none opacity-50',
                  )}
                >
                  « {s} »
                </button>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-2 rounded-xl border border-dashed p-3 text-xs text-muted-foreground">
            <Info className="size-4 shrink-0" />
            <p>
              Prévi donne des repères généraux validés par l’équipe QHSE. Il ne remplace ni votre
              référent SST, ni le médecin du travail, ni les secours.
            </p>
          </div>
          <PillarTags pillars={['engagement', 'feedback']} />
        </div>
      </div>
    </div>
  )
}
