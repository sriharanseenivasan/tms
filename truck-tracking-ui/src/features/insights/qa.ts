export interface CannedQa {
  question: string
  answer: string
}

/** Pre-written Q&A for the demo "Ask AI" box — no real API is called. */
export const CANNED_QA: CannedQa[] = [
  {
    question: 'What is the biggest bottleneck right now?',
    answer:
      'Security document verification is the slowest stage today at ~14 min average. Adding a second verification counter during the 10–12 AM peak could cut overall TAT by ~8%.',
  },
  {
    question: 'Which bay is underperforming?',
    answer:
      'Bay 7 is running 32% slower than the average bay this week. It is worth inspecting its equipment and rebalancing heavier loads to Bays 3 and 9.',
  },
  {
    question: 'When does the yard get most congested?',
    answer:
      'Yard waiting time peaks between 10 AM and 12 PM due to clustered arrivals. Staggering transporter arrival windows would smooth the morning surge.',
  },
  {
    question: 'What TAT should I expect for the next truck?',
    answer:
      'Based on the current queue depth and bay availability, the predicted turnaround for the next inbound truck is about 84 minutes.',
  },
  {
    question: 'Which transporter has the most document issues?',
    answer:
      'Gati Cargo has a 3× higher document-rejection rate than average. Sharing a pre-arrival checklist with them should reduce gate holds.',
  },
]

const FALLBACK_ANSWER =
  "I don't have a specific reading for that yet, but you can explore the KPIs and charts on the Control Tower dashboard for the underlying numbers."

/** Return the best canned answer for a free-text question, or a fallback. */
export function answerFor(question: string): string {
  const q = question.trim().toLowerCase()
  if (!q) return FALLBACK_ANSWER
  const match = CANNED_QA.find((item) => {
    const words = item.question.toLowerCase().split(/\W+/).filter((w) => w.length > 3)
    return words.some((w) => q.includes(w))
  })
  return match?.answer ?? FALLBACK_ANSWER
}
