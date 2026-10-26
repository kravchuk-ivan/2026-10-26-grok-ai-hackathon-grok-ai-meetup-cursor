export type TribeId = 'ember' | 'violet' | 'teal' | 'gold' | 'sky'

export type Tribe = {
  id: TribeId
  name: string
  color: string
  ink: string
  call: string
  meaning: string
  hang: string
  question: string
  pact: string
  nonsense: string
}

export const tribes: Record<TribeId, Tribe> = {
  ember: {
    id: 'ember',
    name: 'Ember',
    color: '#FF4D1C',
    ink: '#1A0A04',
    call: 'Raise Ember',
    meaning: 'The ones who train. A run, a gym, a body that refuses to disappear into a laptop.',
    hang: 'A 5km loop this week. No Strava required. Show up sweaty.',
    question: 'What are you training for that would sound silly if you said it out loud?',
    pact: 'Meet once in 7 days. Move together. Text the group the night before so nobody flakes alone.',
    nonsense:
      'Training for hire, racing nobody, doing another set — it barely makes sense until someone else is doing it with you.',
  },
  violet: {
    id: 'violet',
    name: 'Violet',
    color: '#B14CFF',
    ink: '#14081F',
    call: 'Raise Violet',
    meaning: 'The ones who wander. Night walks, accidental conversations, the city as a living room.',
    hang: 'A no-destination walk. Start at a subway and get lost for 40 minutes.',
    question: 'Where in this city do you feel most like yourself, and where do you still feel like a guest?',
    pact: 'Walk once in 7 days. Phones down except to find each other. End with one true story from "before."',
    nonsense:
      'Walking in circles has no KPI. Do it with a crew and it becomes how you remember you have a life here.',
  },
  teal: {
    id: 'teal',
    name: 'Teal',
    color: '#00D4A8',
    ink: '#04211A',
    call: 'Raise Teal',
    meaning: 'The ones who set the table. Food is the oldest immigration technology.',
    hang: 'A potluck in someone\'s kitchen, or dumplings after this. Nobody hosts alone.',
    question: 'What meal from home have you not cooked here yet because it felt too sad to eat by yourself?',
    pact: 'Eat together once in 7 days. Everyone brings one thing. Phones in a pile in the middle.',
    nonsense:
      'Cooking for one is logistics. Cooking for a table is how a city starts to feel like it belongs to you.',
  },
  gold: {
    id: 'gold',
    name: 'Gold',
    color: '#FFC53D',
    ink: '#231A04',
    call: 'Raise Gold',
    meaning: 'The ones who make. Shipping into the void is how builders get lonely.',
    hang: 'A 90-minute build night. Laptops, sketches, ugly prototypes. Show the work.',
    question: 'What are you building that nobody in your old life would understand?',
    pact: 'Make something in the same room once in 7 days. Demo at the end, even if it barely works.',
    nonsense:
      'A side project with no audience is a hobby. A side project with four witnesses becomes a reason to stay up.',
  },
  sky: {
    id: 'sky',
    name: 'Sky',
    color: '#3D9EFF',
    ink: '#04101F',
    call: 'Raise Sky',
    meaning: 'The ones who bridge. Newcomers, translators, people who remember month one.',
    hang: 'A "how I survived Toronto" hour. Transit hacks, doctors, visas, winter, the unwritten rules.',
    question: 'What did you wish a stranger had told you in your first 30 days here?',
    pact: 'Meet once in 7 days. Each person brings one practical gift for someone newer than them.',
    nonsense:
      'Helping a stranger with a TTC pass is nothing. Doing it on purpose is how a city grows a nervous system.',
  },
}

export type Choice = {
  label: string
  tribe: TribeId
}

export type Question = {
  id: string
  prompt: string
  choices: Choice[]
}

export const questions: Question[] = [
  {
    id: 'after-wfh',
    prompt: 'After a long work-from-home day, you actually feel better if you:',
    choices: [
      { label: 'Move until your brain shuts up', tribe: 'ember' },
      { label: 'Walk the city with no destination', tribe: 'violet' },
      { label: 'Cook, host, or sit at a table', tribe: 'teal' },
      { label: 'Make something with your hands or a laptop', tribe: 'gold' },
      { label: 'Check on someone else who is new here too', tribe: 'sky' },
    ],
  },
  {
    id: 'slope',
    prompt: 'The slippery slope of remote work, for you, is:',
    choices: [
      { label: 'Your body disappearing into the chair', tribe: 'ember' },
      { label: 'Never accidentally meeting anyone', tribe: 'violet' },
      { label: 'Eating alone again', tribe: 'teal' },
      { label: 'Building in a vacuum, nobody to show', tribe: 'gold' },
      { label: 'Forgetting you are allowed to need people', tribe: 'sky' },
    ],
  },
  {
    id: 'meaning',
    prompt: 'An activity that "doesn\'t make sense" gets meaning when a community gives you:',
    choices: [
      { label: 'A reason to train harder', tribe: 'ember' },
      { label: 'A crew for the pointless beautiful walk', tribe: 'violet' },
      { label: 'A table you are expected at', tribe: 'teal' },
      { label: 'People who care that you shipped', tribe: 'gold' },
      { label: 'Proof you are not the only one starting over', tribe: 'sky' },
    ],
  },
  {
    id: 'hang',
    prompt: 'If 12 strangers in this room became your people, the first hang would be:',
    choices: [
      { label: 'A run, a gym, a sweaty thing', tribe: 'ember' },
      { label: 'Night walk + bad coffee', tribe: 'violet' },
      { label: 'Potluck, dumplings, someone\'s kitchen', tribe: 'teal' },
      { label: 'A tiny build night', tribe: 'gold' },
      { label: '"Here is how I survived month one"', tribe: 'sky' },
    ],
  },
  {
    id: 'miss',
    prompt: 'What do you miss most from before you moved?',
    choices: [
      { label: 'A training partner who just appeared', tribe: 'ember' },
      { label: 'Friends who showed up with no plan', tribe: 'violet' },
      { label: 'Sunday lunch energy', tribe: 'teal' },
      { label: 'A garage / studio / crew of makers', tribe: 'gold' },
      { label: 'Being understood without explaining your story', tribe: 'sky' },
    ],
  },
]

export function pickTribe(answers: TribeId[]): TribeId {
  const scores: Record<TribeId, number> = {
    ember: 0,
    violet: 0,
    teal: 0,
    gold: 0,
    sky: 0,
  }

  answers.forEach((tribe, index) => {
    const weight = index === answers.length - 1 ? 1.35 : 1
    scores[tribe] += weight
  })

  return (Object.keys(scores) as TribeId[]).sort((a, b) => {
    if (scores[b] !== scores[a]) return scores[b] - scores[a]
    return answers.lastIndexOf(b) - answers.lastIndexOf(a)
  })[0]
}
