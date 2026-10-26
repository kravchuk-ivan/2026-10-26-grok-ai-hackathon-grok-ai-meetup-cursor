import { useEffect, useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { pickTribe, questions, tribes, type Tribe, type TribeId } from './data'

type Screen = 'home' | 'quiz' | 'beacon' | 'pact' | 'host'

function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    let lock: WakeLockSentinel | undefined
    const request = async () => {
      try {
        lock = await navigator.wakeLock?.request('screen')
      } catch {
        /* browsers may deny this; the color still works */
      }
    }
    void request()
    const onVisible = () => {
      if (document.visibilityState === 'visible') void request()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      void lock?.release()
    }
  }, [active])
}

function setThemeColor(color: string) {
  let meta = document.querySelector('meta[name="theme-color"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'theme-color')
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', color)
}

export default function App() {
  const hostMode = window.location.pathname.replace(/\/$/, '') === '/host'
  const [screen, setScreen] = useState<Screen>(hostMode ? 'host' : 'home')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<TribeId[]>([])

  const tribe = useMemo(() => {
    if (answers.length < questions.length) return null
    return tribes[pickTribe(answers)]
  }, [answers])

  useWakeLock(screen === 'beacon')

  useEffect(() => {
    if (screen === 'beacon' && tribe) {
      setThemeColor(tribe.color)
      navigator.vibrate?.([30, 40, 30, 40, 80])
    } else {
      setThemeColor('#0b0b0c')
    }
  }, [screen, tribe])

  const restart = () => {
    setAnswers([])
    setStep(0)
    setScreen('home')
  }

  if (screen === 'host') return <Host />
  if (screen === 'quiz') {
    return (
      <Quiz
        step={step}
        onPick={(tribeId) => {
          const next = [...answers.slice(0, step), tribeId]
          setAnswers(next)
          if (step + 1 >= questions.length) setScreen('beacon')
          else setStep(step + 1)
        }}
        onBack={() => {
          if (step === 0) setScreen('home')
          else setStep(step - 1)
        }}
      />
    )
  }
  if (screen === 'beacon' && tribe) {
    return (
      <Beacon
        tribe={tribe}
        onFound={() => setScreen('pact')}
        onRetake={restart}
      />
    )
  }
  if (screen === 'pact' && tribe) {
    return <Pact tribe={tribe} onBeacon={() => setScreen('beacon')} onRetake={restart} />
  }
  return <Home onStart={() => setScreen('quiz')} onHost={() => setScreen('host')} />
}

function Home({ onStart, onHost }: { onStart: () => void; onHost: () => void }) {
  return (
    <main className="page home">
      <p className="eyebrow">Toronto · Grok Hackathon · 400 people</p>
      <h1>
        Working from home
        <em> gets lonely.</em>
      </h1>
      <p className="lede">
        Every human here is unique. Most of us are immigrants. The activity itself
        does not have to mean anything — a run, a walk, a potluck, a half-built app.
        Community is what makes it matter.
      </p>
      <ol className="steps">
        <li>Answer 5 questions.</li>
        <li>Get a color.</li>
        <li>Raise your phone. Find your people.</li>
        <li>Lock a 7-day pact so tonight does not evaporate.</li>
      </ol>
      <button className="primary" onClick={onStart}>
        Find your color
      </button>
      <button className="ghost" onClick={onHost}>
        Host screen / QR
      </button>
    </main>
  )
}

function Quiz({
  step,
  onPick,
  onBack,
}: {
  step: number
  onPick: (tribe: TribeId) => void
  onBack: () => void
}) {
  const question = questions[step]
  const progress = ((step + 1) / questions.length) * 100

  return (
    <main className="page quiz">
      <div className="quiz-top">
        <button className="back" onClick={onBack}>
          Back
        </button>
        <span>
          {step + 1} / {questions.length}
        </span>
      </div>
      <div className="bar">
        <div className="bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <h2>{question.prompt}</h2>
      <div className="choices">
        {question.choices.map((choice) => (
          <button key={choice.label} className="choice" onClick={() => onPick(choice.tribe)}>
            <span className="swatch" style={{ background: tribes[choice.tribe].color }} />
            {choice.label}
          </button>
        ))}
      </div>
    </main>
  )
}

function Beacon({
  tribe,
  onFound,
  onRetake,
}: {
  tribe: Tribe
  onFound: () => void
  onRetake: () => void
}) {
  return (
    <main className="beacon" style={{ background: tribe.color, color: tribe.ink }}>
      <p className="beacon-kicker">Look up. Find this color.</p>
      <h1 className="beacon-name">{tribe.name}</h1>
      <p className="beacon-call">{tribe.call}</p>
      <p className="beacon-meaning">{tribe.meaning}</p>
      <div className="beacon-actions">
        <button className="on-color" onClick={onFound}>
          We found each other
        </button>
        <button className="on-color-ghost" onClick={onRetake}>
          Retake
        </button>
      </div>
    </main>
  )
}

function Pact({
  tribe,
  onBeacon,
  onRetake,
}: {
  tribe: Tribe
  onBeacon: () => void
  onRetake: () => void
}) {
  return (
    <main className="page pact">
      <p className="eyebrow" style={{ color: tribe.color }}>
        {tribe.name} circle
      </p>
      <h1>The color is how you find each other. The pact is why you stay.</h1>
      <p className="lede">{tribe.nonsense}</p>

      <section className="card">
        <h3>Tonight, in this huddle</h3>
        <ol>
          <li>First names, neighborhood, how long you have been here.</li>
          <li>Ask this: <strong>{tribe.question}</strong></li>
          <li>Pick one hang in the next 7 days: {tribe.hang}</li>
          <li>Invite one person who is <em>not</em> your color next time. Cliques are how cities stay lonely.</li>
        </ol>
      </section>

      <section className="card">
        <h3>7-day pact</h3>
        <p>{tribe.pact}</p>
      </section>

      <div className="row">
        <button className="primary" style={{ background: tribe.color, color: tribe.ink }} onClick={onBeacon}>
          Raise {tribe.name} again
        </button>
        <button className="ghost" onClick={onRetake}>
          Start over
        </button>
      </div>
    </main>
  )
}

function Host() {
  const url = `${window.location.origin}/`
  const tribeList = Object.values(tribes)

  return (
    <main className="page host">
      <div className="host-grid">
        <div>
          <p className="eyebrow">Scan to join</p>
          <h1>RAISE</h1>
          <p className="lede">
            Five questions. One color. Raise your phone. The people with your color
            are your first community in this room.
          </p>
          <div className="qr-wrap">
            <QRCodeSVG value={url} size={220} bgColor="#f4efe6" fgColor="#0b0b0c" />
          </div>
          <p className="url">{url}</p>
        </div>
        <ul className="legend">
          {tribeList.map((tribe) => (
            <li key={tribe.id} style={{ background: tribe.color, color: tribe.ink }}>
              <strong>{tribe.name}</strong>
              <span>{tribe.meaning}</span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
