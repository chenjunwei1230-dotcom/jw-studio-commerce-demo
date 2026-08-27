import { useEffect, useRef, useState, type FormEvent } from 'react'

import { askAssistant, type AssistantResponse } from './assistantApi'
import './Assistant.css'

type AssistantMessage = {
  id: number
  question: string
  status: 'loading' | 'success' | 'error'
  response?: AssistantResponse
}

const suggestedQuestions = [
  'What is Jia Wei’s creative journey?',
  'Which product is good for a study setup?',
]

function AssistantAnswerText({ answer }: { answer: string }) {
  const parts = answer.split(/(\*\*[^*]+\*\*)/g)

  return (
    <span className="assistant-message__answer-text">
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>
        }

        return <span key={`${part}-${index}`}>{part}</span>
      })}
    </span>
  )
}

function AssistantAnswer({ response }: { response: AssistantResponse }) {
  return (
    <div className="assistant-message__answer" aria-live="polite">
      <p><AssistantAnswerText answer={response.answer} /></p>
      {response.fallback ? (
        <p className="assistant-message__note">
          The shopping flow remains available without this optional helper.
        </p>
      ) : null}
      {response.grounded && response.sources.length > 0 ? (
        <details className="assistant-sources">
          <summary>View approved learning sources</summary>
          <ul>
            {response.sources.map((source) => (
              <li key={source.source_id}>{source.title}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  )
}

function AssistantMessageView({ message }: { message: AssistantMessage }) {
  return (
    <li className="assistant-message">
      <div className="assistant-message__question">
        <span className="assistant-message__label">You asked</span>
        <p>{message.question}</p>
      </div>
      <div className="assistant-message__response">
        <span className="assistant-message__label">Studio guide</span>
        {message.status === 'loading' ? (
          <p className="assistant-message__loading" role="status" aria-live="polite">
            Reading the approved learning notes…
          </p>
        ) : null}
        {message.status === 'error' ? (
          <div className="assistant-message__error" role="alert">
            <p>The assistant could not connect right now.</p>
            <p>You can continue browsing the collection while it takes another take.</p>
          </div>
        ) : null}
        {message.status === 'success' && message.response ? (
          <AssistantAnswer response={message.response} />
        ) : null}
      </div>
    </li>
  )
}

export function AssistantPanel() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputError, setInputError] = useState<string | null>(null)
  const requestController = useRef<AbortController | null>(null)
  const messageSequence = useRef(0)

  useEffect(() => {
    return () => requestController.current?.abort()
  }, [])

  async function submitQuestion(nextQuestion: string) {
    const trimmedQuestion = nextQuestion.trim()
    if (!trimmedQuestion) {
      setInputError('Write a question before sending it to the studio guide.')
      return
    }

    if (trimmedQuestion.length > 500) {
      setInputError('Keep your question under 500 characters.')
      return
    }

    setInputError(null)
    setQuestion('')
    setIsLoading(true)
    requestController.current?.abort()
    const controller = new AbortController()
    requestController.current = controller
    const messageId = messageSequence.current
    messageSequence.current += 1
    setMessages((currentMessages) => [
      ...currentMessages,
      { id: messageId, question: trimmedQuestion, status: 'loading' },
    ])

    try {
      const response = await askAssistant(trimmedQuestion, controller.signal)
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === messageId ? { ...message, status: 'success', response } : message,
        ),
      )
    } catch {
      if (controller.signal.aborted) return
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === messageId ? { ...message, status: 'error' } : message,
        ),
      )
    } finally {
      if (requestController.current === controller) {
        requestController.current = null
        setIsLoading(false)
      }
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void submitQuestion(question)
  }

  return (
    <section className="assistant-section" aria-labelledby="assistant-title">
      <div className="page-container">
        <div className="assistant-panel">
          <div className="assistant-panel__intro">
            <p className="eyebrow">OPTIONAL AI HELPER / FRAME GUIDE</p>
            <h2 id="assistant-title">Ask about the story behind the collection.</h2>
            <p>
              This AI helper can explain Jia Wei&apos;s synthetic learning story, brand belief, and
              approved product notes. It is a guide, not Jia Wei, and it cannot decide prices,
              totals, stock, payments, or orders.
            </p>
          </div>

          <form className="assistant-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="assistant-question">Your question</label>
            <textarea
              id="assistant-question"
              name="question"
              value={question}
              onChange={(event) => {
                setQuestion(event.target.value)
                if (inputError) setInputError(null)
              }}
              placeholder="Try: Which piece suits a creative study setup?"
              maxLength={500}
              rows={3}
              aria-describedby={inputError ? 'assistant-help assistant-error' : 'assistant-help'}
              aria-invalid={inputError ? 'true' : 'false'}
              enterKeyHint="send"
              disabled={isLoading}
            />
            <div className="assistant-form__meta" id="assistant-help">
              <span>English questions only · {question.length}/500</span>
              <button className="button button--primary" type="submit" disabled={isLoading}>
                {isLoading ? 'Thinking…' : 'Ask the guide'}
                <span aria-hidden="true">↗</span>
              </button>
            </div>
            {inputError ? (
              <p className="assistant-form__error" id="assistant-error" role="alert">
                {inputError}
              </p>
            ) : null}
          </form>

          <div className="assistant-suggestions" aria-label="Suggested questions">
            <span>Try a frame:</span>
            {suggestedQuestions.map((suggestion) => (
              <button
                className="assistant-suggestion"
                type="button"
                key={suggestion}
                onClick={() => {
                  setQuestion(suggestion)
                  setInputError(null)
                }}
                disabled={isLoading}
              >
                {suggestion}
              </button>
            ))}
          </div>

          {messages.length > 0 ? (
            <ol className="assistant-messages" aria-label="Assistant conversation">
              {messages.map((message) => (
                <AssistantMessageView key={message.id} message={message} />
              ))}
            </ol>
          ) : (
            <p className="assistant-empty">
              No question yet. The collection remains fully usable without this optional helper.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
