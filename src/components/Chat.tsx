import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BriefcaseBusiness,
  CodeXml,
  MessageCircle,
  RotateCcw,
  Sparkles,
  Square,
  UserRound,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { sendChatMessage, trimHistory } from "../services/chat";
import type { HistoryMessage } from "../services/chat";
import type { ChatMessage } from "../types";
import { SectionLabel } from "./ui";

const suggestions = [
  {
    label: "Conheça minha trajetória",
    question: "Como foi a trajetória de Bruno até se tornar desenvolvedor?",
    icon: BriefcaseBusiness,
  },
  {
    label: "Explore minhas habilidades",
    question: "Quais tecnologias Bruno utiliza e em quais projetos?",
    icon: CodeXml,
  },
  {
    label: "Descubra meus projetos",
    question: "Quais projetos Bruno desenvolveu e explique cada um deles",
    icon: MessageCircle,
  },
];
const MAX_LENGTH = 2000;

export function Chat({ name }: { name: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [failedQuestion, setFailedQuestion] = useState("");
  const [showLatest, setShowLatest] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const conversation = useRef<HistoryMessage[]>([]);
  const transcript = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const followMessages = useRef(true);
  const wasSending = useRef(false);
  const chatWindow = useRef<HTMLDivElement>(null);

  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (wasSending.current && !sending)
      input.current?.focus({ preventScroll: true });
    wasSending.current = sending;
  }, [sending]);
  useEffect(() => {
    if (followMessages.current && transcript.current)
      transcript.current.scrollTop = transcript.current.scrollHeight;
  }, [messages, sending, error]);

  const send = async (question: string, retry = false) => {
    // Somente turnos concluídos entram no contexto; falhas e retries não o duplicam.
    const text = question.trim();
    if (!text || text.length > MAX_LENGTH || controller.current) return;
    const request = new AbortController();
    controller.current = request;
    setSending(true);
    setError("");
    setFailedQuestion("");
    followMessages.current = true;
    setShowLatest(false);
    if (!retry) {
      setMessages((previous) => [
        ...previous,
        { id: crypto.randomUUID(), role: "user", text },
      ]);
      setDraft("");
    }
    try {
      const answer = await sendChatMessage(text, request.signal, conversation.current);
      if (!request.signal.aborted) {
        conversation.current = trimHistory([
          ...conversation.current,
          { role: "user", content: text },
          { role: "assistant", content: answer.slice(0, 4000) },
        ]);
        setMessages((previous) => [
          ...previous,
          { id: crypto.randomUUID(), role: "assistant", text: answer },
        ]);
      }
    } catch (failure) {
      if (!request.signal.aborted) {
        setError(
          failure instanceof Error
            ? failure.message
            : "Não foi possível conversar com o assistente agora.",
        );
        setFailedQuestion(text);
      }
    } finally {
      if (controller.current === request) {
        controller.current = null;
        setSending(false);
      }
    }
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    void send(draft);
  };
  const stop = () => {
    controller.current?.abort();
    controller.current = null;
    setSending(false);
    setError("Consulta interrompida. Você pode enviar uma nova pergunta.");
  };

  return (
    <section
      id="assistente"
      className="chat-section"
      aria-labelledby="chat-title"
    >
      <div className="container chat-layout">
        <div className="chat-copy" data-reveal>
          <SectionLabel number="02">
            UM JEITO DIFERENTE DE ME CONHECER
          </SectionLabel>
          <h2 id="chat-title">
            O portfólio
            <br />
            também <span>conversa.</span>
          </h2>
          <p>
            Tem algo que você gostaria de saber?
            <br />
            Meu assistente de IA ajuda a explorar minha trajetória, minhas
            habilidades e o que já construí.
          </p>
          <div className="chat-suggestions">
            {suggestions.map(({ label, question, icon: Icon }) => (
              <button
                key={label}
                onClick={() => {
                  chatWindow.current?.scrollIntoView({
                    block: "center",
                    behavior: window.matchMedia(
                      "(prefers-reduced-motion: reduce)",
                    ).matches
                      ? "instant"
                      : "smooth",
                  });
                  void send(question);
                }}
                disabled={sending}
              >
                <Icon size={18} />
                <span>{label}</span>
                <ArrowRight size={16} />
              </button>
            ))}
          </div>
          <div className="ai-note">
            <span>
              <Sparkles size={16} />
            </span>
            <p>
              Uma IA especializada em mim.
              <br />
              <strong>Uma conversa que começa com a sua curiosidade.</strong>
            </p>
          </div>
        </div>
        <div
          className="chat-window"
          ref={chatWindow}
          data-reveal
          data-reveal-delay="120"
        >
          <div className="chat-window-header">
            <span className="assistant-avatar">
              <Sparkles size={20} />
            </span>
            <div>
              <strong>
                Conheça {name}
                <span className="ai-badge">IA</span>
              </strong>
              <span>Assistente do portfólio</span>
            </div>
            <button
              className="icon-button"
              aria-label="Limpar conversa"
              title="Limpar conversa"
              disabled={sending || !messages.length}
              onClick={() => {
                setMessages([]);
                setError("");
                setFailedQuestion("");
                setShowLatest(false);
                input.current?.focus({ preventScroll: true });
              }}
            >
              <RotateCcw size={16} />
            </button>
          </div>
          <div
            className="chat-transcript"
            ref={transcript}
            role="log"
            aria-label="Conversa com o assistente"
            aria-live="polite"
            aria-relevant="additions text"
            onScroll={() => {
              const el = transcript.current;
              if (!el) return;
              followMessages.current =
                el.scrollHeight - el.scrollTop - el.clientHeight < 70;
              setShowLatest(!followMessages.current);
            }}
          >
            <div className="conversation-date">BOM TER VOCÊ POR AQUI</div>
            <div className="chat-message assistant-message">
              <span className="message-avatar">
                <Sparkles size={14} />
              </span>
              <div>
                <span className="message-author">Assistente de {name}</span>
                <p>
                  Olá! Sou o assistente do portfólio de {name}. 👋
                  <br />
                  <br />
                  Posso ajudar você a conhecer os projetos, as tecnologias e a
                  trajetória dele. O que você gostaria de descobrir?
                </p>
              </div>
            </div>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message ${message.role === "assistant" ? "assistant-message" : "user-message"}`}
              >
                <span className="message-avatar">
                  {message.role === "assistant" ? (
                    <Sparkles size={14} />
                  ) : (
                    <UserRound size={14} />
                  )}
                </span>
                <div>
                  <span className="message-author">
                    {message.role === "assistant"
                      ? `Assistente de ${name}`
                      : "Você"}
                  </span>
                  <p>{message.text}</p>
                </div>
              </div>
            ))}
            {sending && (
              <div className="chat-message assistant-message">
                <span className="message-avatar">
                  <Sparkles size={14} />
                </span>
                <div className="thinking" role="status">
                  <span />
                  <span />
                  <span />
                  <span className="sr-only">
                    Consultando informações para responder...
                  </span>
                </div>
              </div>
            )}
            {error && (
              <div className="chat-error" role="alert">
                <p>{error}</p>
                {failedQuestion && (
                  <button
                    className="text-button"
                    disabled={sending}
                    onClick={() => void send(failedQuestion, true)}
                  >
                    <RotateCcw size={13} /> Tentar novamente
                  </button>
                )}
              </div>
            )}
          </div>
          {showLatest && (
            <button
              className="latest-message"
              onClick={() => {
                const el = transcript.current;
                if (el) el.scrollTop = el.scrollHeight;
                followMessages.current = true;
                setShowLatest(false);
              }}
            >
              Últimas mensagens <ArrowDown size={13} />
            </button>
          )}
          <form className="chat-composer" onSubmit={submit}>
            <label htmlFor="chat-message" className="sr-only">
              Sua pergunta sobre {name}
            </label>
            <textarea
              id="chat-message"
              ref={input}
              placeholder={`O que você quer saber sobre ${name}?`}
              value={draft}
              maxLength={MAX_LENGTH}
              rows={1}
              disabled={sending}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  void send(draft);
                }
              }}
            />
            {sending ? (
              <button
                type="button"
                className="send-button"
                onClick={stop}
                aria-label="Interromper resposta"
              >
                <Square size={15} />
              </button>
            ) : (
              <button
                className="send-button"
                type="submit"
                disabled={!draft.trim()}
                aria-label="Enviar pergunta"
              >
                <ArrowUp size={20} />
              </button>
            )}
          </form>
          <div className="chat-footer">
            <span>
              <Sparkles size={11} /> Respostas com inteligência artificial.
              Podem conter imprecisões.
            </span>
            <span>
              {draft.length > 1600
                ? `${draft.length}/${MAX_LENGTH}`
                : "↵ enviar"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
