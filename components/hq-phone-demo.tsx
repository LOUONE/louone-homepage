import { Stage, Phone, Expand, Collapse, Notification, States, Check, Spinner, Bar, type Act } from './stageshow-kit'
import { Hammer, Mail, Volume2, X, GitMerge, Search } from 'lucide-react'

// HQ on the phone, built with Stageshow (components/stageshow-kit), copied
// from its phone-touch gold. Story in four beats, about twelve seconds:
// a notification from dev says a pull request is ready (cause), its row lands
// in "À décider" and carries the list down (context), a tap opens the row into
// the project's screen (action), Fusionner turns into Fusionnée and holds
// (payoff: nothing merges without my yes). Close folds the screen back into the
// row, and the row leaves because it is resolved; the next notification brings
// the next one, so the loop never rewinds data in view.
//
// Real strings: Bonsoir, Louis · À décider · Relire Météo vélo · dev · PR prête
// à relire · Météo vélo · à relire / fusionnée · Vérifications au vert ·
// Fusionner / Fusionnée. Everything else is a line.

type Phase = 'idle' | 'pending' | 'done'
type S = { banner: 'hidden' | 'in' | 'out'; row: boolean; launch: boolean; open: boolean; phase: Phase }

const START: S = { banner: 'hidden', row: false, launch: false, open: false, phase: 'idle' }
const REST = { x: 300, y: 470 }

// The app's own wallpaper: the painted hills under night-blue glass
const WALL = "#101138 url('/hq-demo/assets/fond-collines-2000.jpg') 38% 62% / cover no-repeat"

const script = async (a: Act<S>) => {
  await a.wait(500)
  a.mark('notify')
  a.put({ banner: 'in' })
  await a.wait(450)
  a.put({ row: true })
  await a.wait(1700)
  a.put({ banner: 'out' })
  await a.wait(420)
  a.put({ banner: 'hidden' })
  await a.wait(200)
  a.mark('tap')
  await a.click('row')
  a.put({ launch: true })
  await a.wait(16)
  a.put({ open: true })
  await a.wait(1300)
  a.mark('merge')
  await a.click('merge')
  a.put({ phase: 'pending' })
  await a.wait(750)
  a.put({ phase: 'done' })
  // The payoff holds
  await a.wait(2100)
  a.mark('close')
  await a.click('close')
  a.put({ open: false })
  await a.wait(700)
  a.put({ launch: false })
  await a.wait(150)
  // Resolved, so it leaves the list (and carries the cards back up); once it
  // has closed, reset the screen unseen
  a.put({ row: false })
  await a.wait(650)
  await a.snap({ phase: 'idle' })
  await a.move(REST)
  await a.wait(150)
}

function Row({ icon, children, target }: { icon: 'hammer' | 'mail'; children: React.ReactNode; target?: string }) {
  return (
    <div className="hqp-row" data-target={target}>
      <span className="hqp-row__icon">{icon === 'hammer' ? <Hammer size={16} strokeWidth={1.8} /> : <Mail size={16} strokeWidth={1.8} />}</span>
      <span className="hqp-row__text">{children}</span>
    </div>
  )
}

export default function HqPhoneDemo() {
  return (
    <Stage<S>
      width={440}
      height={560}
      compact={{ below: 440, width: 358, height: 520 }}
      initial={START}
      poster={{ banner: 'hidden', row: true, launch: true, open: true, phase: 'done' }}
      script={script}
      cursor={{ at: REST, style: 'touch' }}
      theme="dark"
      className="hqp"
    >
      {(s, rect, layout) => (
        <>
          <div className="hqp-wash" />
          <Phone width={layout === 'compact' ? 326 : 340} dark wallpaper={WALL} className="hqp-phone" time="18:40">
            <div className="hqp-veil" />

            {/* Home */}
            <div className="hqp-home" data-back={s.open || undefined} data-launching={s.launch || undefined}>
              <div className="hqp-head">
                <div className="hqp-title-row">
                  <span className="hqp-title">Bonsoir, Louis</span>
                  <span className="hqp-round">
                    <Search size={16} strokeWidth={1.8} />
                  </span>
                </div>
                <Bar w={150} h={9} r={5} className="hqp-bar" />
              </div>

              <div className="hqp-flow">
                <div className="hqp-card">
                  <span className="hqp-label">À décider</span>
                  {/* drop: the new row arrives whole and glides in on its own layer */}
                  <Collapse open={s.row} reveal="drop">
                    <Row icon="hammer" target="row">
                      Relire Météo vélo
                    </Row>
                  </Collapse>
                  <Row icon="mail">
                    <Bar w={168} h={9} r={5} className="hqp-bar" />
                  </Row>
                  <Row icon="mail">
                    <Bar w={124} h={9} r={5} className="hqp-bar" />
                  </Row>
                </div>

                <div className="hqp-section">
                  <span className="hqp-h2">Brief du jour</span>
                  <span className="hqp-round">
                    <Volume2 size={16} strokeWidth={1.8} />
                  </span>
                </div>

                <div className="hqp-card hqp-card--brief">
                  <Bar w={64} h={8} r={4} className="hqp-bar hqp-bar--faint" />
                  {[
                    [132, 84],
                    [104, 112],
                  ].map(([t, sub], i) => (
                    <div key={i} className="hqp-event">
                      <Bar w={38} h={9} r={4} className="hqp-bar hqp-bar--gold" />
                      <span className="hqp-event__text">
                        <Bar w={t} h={9} r={5} className="hqp-bar" />
                        <Bar w={sub} h={7} r={4} className="hqp-bar hqp-bar--faint" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* The row and the project screen are one object */}
            <div className="hqp-launch" data-on={s.launch || undefined}>
              <Expand
                open={s.open}
                from={rect('row')}
                radius={14}
                duration={600}
                face={
                  <div className="hqp-row hqp-row--face">
                    <span className="hqp-row__icon">
                      <Hammer size={16} strokeWidth={1.8} />
                    </span>
                    <span className="hqp-row__text">Relire Météo vélo</span>
                  </div>
                }
              >
                <div className="hqp-screen">
                  <span className="hqp-close hqp-round" data-target="close">
                    <X size={16} strokeWidth={2} />
                  </span>
                  <div className="hqp-screen__head">
                    <span className="hqp-pill" data-done={s.phase === 'done' || undefined}>
                      <States value={s.phase === 'done' ? 'done' : 'todo'} states={{ todo: 'à relire', done: 'fusionnée' }} />
                    </span>
                    <span className="hqp-screen__title">Météo vélo</span>
                    <Bar w={190} h={8} r={4} className="hqp-bar hqp-bar--faint" />
                  </div>

                  <div className="hqp-card hqp-card--checks">
                    <div className="hqp-check">
                      <Check on size={18} />
                      <span>Vérifications au vert</span>
                    </div>
                    <div className="hqp-check">
                      <Check on size={18} />
                      <Bar w={150} h={9} r={5} className="hqp-bar" />
                    </div>
                    <div className="hqp-check">
                      <Check on size={18} />
                      <Bar w={118} h={9} r={5} className="hqp-bar" />
                    </div>
                  </div>

                  <div className="hqp-card hqp-card--notes">
                    <Bar w="88%" h={8} r={4} className="hqp-bar hqp-bar--faint" />
                    <Bar w="76%" h={8} r={4} className="hqp-bar hqp-bar--faint" />
                    <Bar w="52%" h={8} r={4} className="hqp-bar hqp-bar--faint" />
                  </div>

                  <span className="hqp-merge" data-target="merge" data-phase={s.phase}>
                    <States
                      value={s.phase}
                      states={{
                        idle: (
                          <>
                            <GitMerge size={18} strokeWidth={2} /> <span className="hqp-merge__label">Fusionner</span>
                          </>
                        ),
                        pending: <Spinner size={18} />,
                        done: (
                          <>
                            <Check on size={18} /> <span className="hqp-merge__label">Fusionnée</span>
                          </>
                        )
                      }}
                    />
                  </span>
                </div>
              </Expand>
            </div>

            {/* dev's notification drops in over the app, then goes */}
            {s.banner !== 'hidden' && (
              <div className="hqp-banner" data-out={s.banner === 'out' || undefined}>
                <Notification
                  banner
                  // The kit styles the icon as a direct <img> child of the notification
                  // eslint-disable-next-line @next/next/no-img-element
                  icon={<img src="/hq-demo/assets/icones/icone-192.png" alt="" />}
                  title="dev"
                  body="PR prête à relire : Météo vélo"
                  // In the phone column the banner keeps its message and drops the
                  // time, which would render under the 10px floor there
                  time={layout === 'compact' ? '' : 'maintenant'}
                />
              </div>
            )}
          </Phone>
        </>
      )}
    </Stage>
  )
}
