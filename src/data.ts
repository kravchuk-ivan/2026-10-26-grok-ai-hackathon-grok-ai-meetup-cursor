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
  why: string
}

export const tribes: Record<TribeId, Tribe> = {
  ember: {
    id: 'ember',
    name: 'Ember',
    color: '#FF4D1C',
    ink: '#1A0A04',
    call: 'Raise Ember',
    meaning: 'People who train: runs, the gym, anything that gets them off a chair.',
    hang: 'A 5km run this week. Show up. You do not need a tracking app.',
    question: 'What are you training for?',
    pact: 'Meet once in the next 7 days and exercise together. Text the group the night before.',
    why: 'Training alone is easy to skip. Training with other people is easier to keep doing.',
  },
  violet: {
    id: 'violet',
    name: 'Violet',
    color: '#B14CFF',
    ink: '#14081F',
    call: 'Raise Violet',
    meaning: 'People who walk and talk. They meet without a plan.',
    hang: 'A 40-minute walk with no destination.',
    question: 'Where do you feel like yourself, and where do you feel alone?',
    pact: 'Walk together once in the next 7 days. Keep phones away except to meet. Each person says one honest thing about the week.',
    why: 'A walk with no destination looks pointless. Walking with other people gives it a reason.',
  },
  teal: {
    id: 'teal',
    name: 'Teal',
    color: '#00D4A8',
    ink: '#04211A',
    call: 'Raise Teal',
    meaning: 'People who cook and eat with others.',
    hang: 'A shared meal this week. Nobody hosts alone.',
    question: 'What do you cook when someone else is coming that you would not cook for yourself?',
    pact: 'Eat together once in the next 7 days. Everyone brings one thing. Put phones in a pile.',
    why: 'Eating alone is common when you work from home. Eating with other people is better for you.',
  },
  gold: {
    id: 'gold',
    name: 'Gold',
    color: '#FFC53D',
    ink: '#231A04',
    call: 'Raise Gold',
    meaning: 'People who make things and want someone to see the work.',
    hang: 'A 90-minute work session. Bring a laptop or a sketch. Show what you made.',
    question: 'What are you building that you have not told anyone about?',
    pact: 'Work in the same room once in the next 7 days. Show the work at the end, even if it is unfinished.',
    why: 'A project nobody sees is easy to drop. A project other people see is easier to finish.',
  },
  sky: {
    id: 'sky',
    name: 'Sky',
    color: '#3D9EFF',
    ink: '#04101F',
    call: 'Raise Sky',
    meaning: 'People who ask how you are and wait for the answer.',
    hang: 'One hour of talking. Work talk is optional.',
    question: 'When did someone last ask how you were, and you told the truth?',
    pact: 'Meet once in the next 7 days. Each person checks on one other person before the week ends.',
    why: 'A short "you good?" in chat does not help much. Asking in person, and listening, does.',
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
    prompt: 'After a long work-from-home day, you feel better if you:',
    choices: [
      { label: 'Exercise', tribe: 'ember' },
      { label: 'Walk with no destination', tribe: 'violet' },
      { label: 'Cook or eat with someone', tribe: 'teal' },
      { label: 'Make something', tribe: 'gold' },
      { label: 'Check on someone who might also be lonely', tribe: 'sky' },
    ],
  },
  {
    id: 'slope',
    prompt: 'Phones and screens make it easy to get lonely. For you, that looks like:',
    choices: [
      { label: 'Sitting all day and not moving', tribe: 'ember' },
      { label: 'Never meeting anyone in person', tribe: 'violet' },
      { label: 'Eating with a screen instead of a person', tribe: 'teal' },
      { label: 'Making things with nobody to show', tribe: 'gold' },
      { label: 'Chatting a lot and still feeling alone', tribe: 'sky' },
    ],
  },
  {
    id: 'meaning',
    prompt: 'A hobby gets meaning when a group gives you:',
    choices: [
      { label: 'A reason to train harder', tribe: 'ember' },
      { label: 'People to walk with', tribe: 'violet' },
      { label: 'A meal you are expected to attend', tribe: 'teal' },
      { label: 'People who care that you finished something', tribe: 'gold' },
      { label: 'Proof you are not the only one having a hard time', tribe: 'sky' },
    ],
  },
  {
    id: 'hang',
    prompt: 'If 12 people in this room became a group, you would start with:',
    choices: [
      { label: 'A run or a gym session', tribe: 'ember' },
      { label: 'A night walk and coffee', tribe: 'violet' },
      { label: 'A shared meal', tribe: 'teal' },
      { label: 'A short work session', tribe: 'gold' },
      { label: 'A conversation that is not networking', tribe: 'sky' },
    ],
  },
  {
    id: 'miss',
    prompt: 'When you have been alone too long, what do you miss first?',
    choices: [
      { label: 'Someone to train with', tribe: 'ember' },
      { label: 'Friends who come over without a plan', tribe: 'violet' },
      { label: 'Regular meals with other people', tribe: 'teal' },
      { label: 'Other people making things nearby', tribe: 'gold' },
      { label: 'Someone who asks how you are', tribe: 'sky' },
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
