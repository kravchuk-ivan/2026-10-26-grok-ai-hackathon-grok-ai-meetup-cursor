import { useEffect, useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { pickTribe, questions, tribes, type Tribe, type TribeId } from './data'
import { playTribeTone } from './sound'

type Screen = 'home' | 'intro' | 'quiz' | 'beacon' | 'pact' | 'host'

type Intro = {
  name: string
  look: string
  help: string
  need: string
}

const LIVE_URL =
  'https://kravchuk-ivan.github.io/2026-10-26-grok-ai-hackathon-grok-ai-meetup-cursor/'

function appUrl() {
  const host = window.location.hostname
  if (host === 'localhost' || host === '127.0.0.1') return LIVE_URL
  return new URL('.', window.location.href).href
}

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
  const hostMode =
    window.location.pathname.replace(/\/$/, '').endsWith('/host') ||
    window.location.hash === '#host'
  const [screen, setScreen] = useState<Screen>(hostMode ? 'host' : 'home')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<TribeId[]>([])
  const [intro, setIntro] = useState<Intro>(() => {
    try {
      const saved = sessionStorage.getItem('raise-intro')
      if (saved) return JSON.parse(saved) as Intro
    } catch {
      /* ignore */
    }
    return { name: '', look: '', help: '', need: '' }
  })

  useEffect(() => {
    sessionStorage.setItem('raise-intro', JSON.stringify(intro))
  }, [intro])

  const tribe = useMemo(() => {
    if (answers.length < questions.length) return null
    return tribes[pickTribe(answers)]
  }, [answers])

  useWakeLock(screen === 'beacon')

  useEffect(() => {
    if (screen === 'beacon' && tribe) {
      setThemeColor(tribe.color)
      navigator.vibrate?.([30, 40, 30, 40, 80])
      playTribeTone(tribe.id)
      void document.documentElement.requestFullscreen?.().catch(() => undefined)
    } else {
      setThemeColor('#0b0b0c')
      if (document.fullscreenElement) void document.exitFullscreen?.().catch(() => undefined)
    }
  }, [screen, tribe])

  const restart = () => {
    setAnswers([])
    setStep(0)
    setIntro({ name: '', look: '', help: '', need: '' })
    setScreen('home')
  }

  if (screen === 'host') return <Host />
  if (screen === 'intro') {
    return (
      <IntroForm
        value={intro}
        onChange={setIntro}
        onNext={() => setScreen('quiz')}
        onBack={() => setScreen('home')}
      />
    )
  }
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
          if (step === 0) setScreen('intro')
          else setStep(step - 1)
        }}
      />
    )
  }
  if (screen === 'beacon' && tribe) {
    return (
      <Beacon
        tribe={tribe}
        name={intro.name}
        look={intro.look}
        onFound={() => setScreen('pact')}
        onRetake={restart}
      />
    )
  }
  if (screen === 'pact' && tribe) {
    return (
      <Pact
        tribe={tribe}
        intro={intro}
        onBeacon={() => setScreen('beacon')}
        onRetake={restart}
      />
    )
  }
  return <Home onStart={() => setScreen('intro')} onHost={() => setScreen('host')} />
}

function ColorRail() {
  return (
    <div className="rail" aria-hidden="true">
      {Object.values(tribes).map((tribe) => (
        <span key={tribe.id} style={{ background: tribe.color }} />
      ))}
    </div>
  )
}

function Home({ onStart, onHost }: { onStart: () => void; onHost: () => void }) {
  return (
    <main className="page home">
      <ColorRail />
      <p className="eyebrow">Grok Hackathon · 400 people</p>
      <h1>
        Working from home
        <em> gets lonely.</em>
      </h1>
      <p className="lede">
        Loneliness is common, and it is not limited to one background. People are
        different. A run, a walk, a meal, or a half-finished project does not need
        a bigger purpose on its own. Doing it with other people is what makes it
        worth continuing, and that helps mental health.
      </p>
      <ol className="steps">
        <li>Say your first name and how people can find you in the room. No login.</li>
        <li>Answer 5 questions. Get a color.</li>
        <li>Hold up your phone. Stand with people who have the same color.</li>
        <li>Trade what you can help with. Agree to meet once this week.</li>
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

function IntroForm({
  value,
  onChange,
  onNext,
  onBack,
}: {
  value: Intro
  onChange: (next: Intro) => void
  onNext: () => void
  onBack: () => void
}) {
  const set = (key: keyof Intro) => (event: { target: { value: string } }) =>
    onChange({ ...value, [key]: event.target.value })

  return (
    <main className="page quiz">
      <div className="quiz-top">
        <button className="back" onClick={onBack}>
          Back
        </button>
        <span>Before the questions</span>
      </div>
      <h2>First, how should people find you?</h2>
      <p className="lede">Stays on this phone. No account.</p>
      <form
        className="intro-form"
        onSubmit={(event) => {
          event.preventDefault()
          if (value.name.trim()) onNext()
        }}
      >
      <label className="field">
        First name
        <input
          autoComplete="given-name"
          autoFocus
          placeholder="First name is enough"
          value={value.name}
          onChange={set('name')}
        />
      </label>
      <label className="field">
        How can people find you in this room?
        <input
          placeholder="Black hoodie, near the window, table 4"
          value={value.look}
          onChange={set('look')}
        />
      </label>
      <label className="field">
        What can you help someone with?
        <input
          placeholder="Python, a run plan, cooking, listening"
          value={value.help}
          onChange={set('help')}
        />
      </label>
      <label className="field">
        What do you need help with?
        <input
          placeholder="A training partner, a meal, someone to show work to"
          value={value.need}
          onChange={set('need')}
        />
      </label>
      <button className="primary" type="submit" disabled={!value.name.trim()}>
        Continue
      </button>
      </form>
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
  name,
  look,
  onFound,
  onRetake,
}: {
  tribe: Tribe
  name: string
  look: string
  onFound: () => void
  onRetake: () => void
}) {
  return (
    <main className="beacon" style={{ background: tribe.color, color: tribe.ink }}>
      <div className="beacon-glow" />
      <p className="beacon-kicker">Hold up your phone. Find this color in the room.</p>
      <h1 className="beacon-name">{tribe.name}</h1>
      <p className="beacon-person">{name}</p>
      {look ? <p className="beacon-look">{look}</p> : null}
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
  intro,
  onBeacon,
  onRetake,
}: {
  tribe: Tribe
  intro: Intro
  onBeacon: () => void
  onRetake: () => void
}) {
  return (
    <main className="page pact">
      <p className="eyebrow" style={{ color: tribe.color }}>
        {tribe.name} group · {intro.name}
      </p>
      <h1>Use the color to find each other. Then agree to meet again this week.</h1>
      <p className="lede">{tribe.why}</p>

      <section className="card">
        <h3>Read this out</h3>
        <p>
          I am {intro.name}
          {intro.look ? `, ${intro.look}` : ''}.
        </p>
        {intro.help ? <p>I can help with {intro.help}.</p> : null}
        {intro.need ? <p>I need help with {intro.need}.</p> : null}
      </section>

      <section className="card">
        <h3>Tonight</h3>
        <ol>
          <li>
            Ask this: <strong>{tribe.question}</strong>
          </li>
          <li>Pick a time to meet in the next 7 days: {tribe.hang}</li>
          <li>
            Next time, invite one person who is <em>not</em> this color. If you only
            talk to your group, everyone else stays left out.
          </li>
        </ol>
      </section>

      <section className="card">
        <h3>7-day plan</h3>
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
  const url = appUrl()
  const tribeList = Object.values(tribes)

  return (
    <main className="host-wall">
      <div className="host-stripes">
        {tribeList.map((tribe) => (
          <div key={tribe.id} className="stripe" style={{ background: tribe.color, color: tribe.ink }}>
            <strong>{tribe.name}</strong>
            <span>{tribe.meaning}</span>
          </div>
        ))}
      </div>
      <div className="host-card">
        <p className="eyebrow">Scan this on your phone</p>
        <h1>RAISE</h1>
        <p>No login. First name, a color, then hold up your phone.</p>
        <div className="qr-wrap">
          <QRCodeSVG value={url} size={200} bgColor="#f4efe6" fgColor="#0b0b0c" />
        </div>
        <p className="url">{url}</p>
      </div>
    </main>
  )
}
