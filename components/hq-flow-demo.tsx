import { Stage, Window, Collapse, Field, Stream, States, Spinner, Check, Bar, Text, type Act } from './stageshow-kit'
import { House, Compass, Radio, TrendingUp, Mail, Code, Hammer, Cpu, ArrowUp, GitMerge } from 'lucide-react'

// HQ's web app, built with Stageshow (components/stageshow-kit) from its
// ai-chat and hero-demo golds. One flow, request to decision, about fifteen
// seconds: a request is typed to Maestro and sent (cause); Maestro thinks, then
// answers word by word and shows what it did (the agent at work); a project
// card drops into Chantiers, its progress arrives line by line and it turns
// "à relire" with its pull request (effect); Fusionner becomes Fusionnée and
// holds (payoff: nothing merges without my yes). Then what the story added
// leaves in one reverse stagger, so the loop starts on the same quiet screen.
//
// Real strings: the request, Maestro's answer and its two tools, Chantiers,
// Météo vélo, the status, PR #18, Fusionner / Fusionnée. The rest is lines.

const REQUEST = 'Lance un chantier : météo vélo'
const ANSWER = "C'est parti : dev s'en occupe dans un bac à sable. Je te préviens dès que la PR est prête à relire."
const WORDS = ANSWER.split(' ').length

type Status = 'running' | 'review' | 'merged'
type S = {
  draft: string
  focus: boolean
  sent: boolean
  phase: 'idle' | 'thinking' | 'answer'
  words: number
  tools: boolean
  card: boolean
  steps: number
  status: Status
  merge: 'idle' | 'pending' | 'done'
}

const initial: S = { draft: '', focus: false, sent: false, phase: 'idle', words: 0, tools: false, card: false, steps: 0, status: 'running', merge: 'idle' }
const poster: S = { draft: '', focus: false, sent: true, phase: 'answer', words: WORDS, tools: true, card: true, steps: 3, status: 'merged', merge: 'done' }
const REST = { wide: { x: 560, y: 420 }, compact: { x: 300, y: 500 } }

async function script(a: Act<S>) {
  await a.wait(500)
  a.mark('type')
  await a.click('composer')
  a.put({ focus: true })
  await a.type('draft', REQUEST, { interval: 38 })
  await a.wait(250)
  a.mark('send')
  await a.click('send')
  a.put({ sent: true, draft: '', focus: false })
  await a.wait(420)
  a.put({ phase: 'thinking' })
  await a.wait(950)
  a.mark('answer')
  a.put({ phase: 'answer' })
  for (let i = 1; i <= WORDS; i++) {
    a.put({ words: i })
    await a.wait(42)
  }
  await a.wait(250)
  a.put({ tools: true })
  await a.wait(500)

  // The effect: the project lands in Chantiers and moves on its own
  a.mark('card')
  a.put({ card: true })
  await a.wait(650)
  for (let i = 1; i <= 3; i++) {
    a.put({ steps: i })
    await a.wait(520)
  }
  a.put({ status: 'review' })
  await a.wait(900)

  // The decision
  a.mark('merge')
  await a.click('merge')
  a.put({ merge: 'pending' })
  await a.wait(750)
  a.put({ merge: 'done', status: 'merged' })
  await a.wait(2200)

  // What the story added leaves in one reverse stagger; the screen it started
  // on stays, and the rest resets unseen once it is gone
  a.put({ card: false })
  await a.wait(80)
  a.put({ phase: 'idle', tools: false })
  await a.wait(80)
  a.put({ sent: false })
  await a.wait(560)
  await a.snap({ words: 0, steps: 0, status: 'running', merge: 'idle' })
  await a.move(REST[a.layout])
  await a.wait(150)
}

const NAV = [House, Compass, Radio, TrendingUp, Mail, Code, Hammer, Cpu]
const STATUS: Record<Status, string> = { running: 'en cours', review: 'à relire', merged: 'fusionnée' }

export default function HqFlowDemo() {
  return (
    <Stage<S>
      width={760}
      height={470}
      compact={{ below: 600, width: 358, height: 620 }}
      initial={initial}
      poster={poster}
      script={script}
      cursor={{ at: REST, style: 'arrow', ripple: true }}
      theme="dark"
      className="hqw"
    >
      {(s, _rect, layout) => {
        const chat = (
          <section className="hqw-chat">
            <div className="hqw-chat__head">
              <span className="hqw-avatar">
                <Compass size={16} strokeWidth={1.8} />
              </span>
              <span className="hqw-name">Maestro</span>
              <Bar w={88} h={7} r={4} className="hqw-bar hqw-bar--faint" />
            </div>

            <div className="hqw-thread">
              <div className="hqw-past">
                <Bar w={layout === 'wide' ? 170 : 132} h={30} r={15} className="hqw-bar hqw-past__q" />
                <Bar w="84%" h={8} r={4} className="hqw-bar hqw-bar--faint" />
                <Bar w="58%" h={8} r={4} className="hqw-bar hqw-bar--faint" />
              </div>
              <Collapse open={s.sent} reveal="drop" from="below">
                <div className="hqw-q">
                  <Text>{REQUEST}</Text>
                </div>
              </Collapse>
              <Collapse open={s.phase === 'thinking'}>
                <Text className="hqw-thinking">Maestro réfléchit</Text>
              </Collapse>
              <Collapse open={s.phase === 'answer'}>
                <Stream className="hqw-stream" text={ANSWER} count={s.words} />
              </Collapse>
              <Collapse open={s.tools}>
                <div className="hqw-tools">
                  <span className="hqw-tool">a interrogé dev</span>
                  <span className="hqw-tool">a lancé un chantier</span>
                </div>
              </Collapse>
            </div>

            <div className="hqw-composer">
              <Field value={s.draft} placeholder="Écrire à Maestro…" focused={s.focus} box={{ 'data-target': 'composer', 'data-cursor': 'ibeam' }} className="hqw-field" />
              <span className="hqw-send" data-target="send" data-cursor="pointer" data-ready={s.draft.length > 0 || undefined}>
                <ArrowUp size={16} strokeWidth={2.2} />
              </span>
            </div>
          </section>
        )
        const side = (
          <aside className="hqw-side">
            <div className="hqw-side__head">Chantiers</div>
            <Collapse open={s.card} reveal="drop">
              <div className="hqw-card hqw-card--new" data-status={s.status}>
                <div className="hqw-card__top">
                  <span className="hqw-card__title">Météo vélo</span>
                  <span className="hqw-pill" data-status={s.status}>
                    <States value={s.status} states={STATUS} />
                  </span>
                </div>
                <div className="hqw-steps">
                  {[118, 96, 132].map((w, i) => (
                    <Collapse key={i} open={s.steps > i}>
                      <div className="hqw-step">
                        <Bar w={26} h={7} r={4} className="hqw-bar hqw-bar--gold" />
                        <Bar w={w} h={7} r={4} className="hqw-bar" />
                      </div>
                    </Collapse>
                  ))}
                </div>
                <div className="hqw-card__foot" data-on={s.status !== 'running' || undefined}>
                  <span className="hqw-pr">PR #18</span>
                  <span className="hqw-merge" data-cursor="pointer" data-phase={s.merge}>
                  {/* The press lands on the icon, so the label it turns into stays readable */}
                  <span className="hqw-merge__aim" data-target="merge" aria-hidden />
                    <States
                      value={s.merge}
                      states={{
                        idle: (
                          <>
                            <GitMerge size={14} strokeWidth={2} />
                            <span className="hqw-merge__label">Fusionner</span>
                          </>
                        ),
                        pending: <Spinner size={14} />,
                        done: (
                          <>
                            <Check on size={14} />
                            <span className="hqw-merge__label">Fusionnée</span>
                          </>
                        )
                      }}
                    />
                  </span>
                </div>
              </div>
            </Collapse>
            {[
              [104, 64],
              [86, 52]
            ].map(([t, p], i) => (
              // On a phone the new card takes the last one's place
              <Collapse key={i} open={layout === 'wide' || i === 0 || !s.card}>
                <div className="hqw-card">
                  <div className="hqw-card__top">
                    <Bar w={t} h={9} r={5} className="hqw-bar" />
                    <Bar w={p} h={18} r={9} className="hqw-bar hqw-bar--pill" />
                  </div>
                  <Bar w="82%" h={7} r={4} className="hqw-bar hqw-bar--faint" />
                  <Bar w="56%" h={7} r={4} className="hqw-bar hqw-bar--faint" />
                  <Bar w="70%" h={7} r={4} className="hqw-bar hqw-bar--faint" />
                </div>
              </Collapse>
            ))}
          </aside>
        )

        // On a phone, the desktop window would squash: the app's two panes
        // stack in one sheet with no title bar, running off the bottom edge
        if (layout === 'compact')
          return (
            <Window chrome="card" className="hqw-pane" body={{ className: 'hqw-body' }}>
              {chat}
              {side}
            </Window>
          )

        return (
          <Window chrome="glass" url="HQ" className="hqw-win" body={{ className: 'hqw-body' }}>
            <div className="hqw-app">
              <nav className="hqw-rail" aria-hidden>
                {NAV.map((I, i) => (
                  <span key={i} className="hqw-rail__item" data-on={i === 1 || undefined}>
                    <I size={16} strokeWidth={1.8} />
                  </span>
                ))}
              </nav>
              {chat}
              {side}
            </div>
          </Window>
        )
      }}
    </Stage>
  )
}
