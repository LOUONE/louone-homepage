import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import Dither from '../../components/dither'
import { Card, Reveal, Terminal } from '../../components/card'
import { mailguard as project, paintings } from '../../lib/data'

const points = [
  {
    title: 'Splits that do not leak',
    body: 'Near-duplicate emails stay in the same split, so one campaign never sits in both train and test. Every figure has a 95% interval from a bootstrap over duplicate clusters, and model comparisons are paired (McNemar).'
  },
  {
    title: 'It turns down its own upgrades',
    body: 'A retrained model gained 0.33 points and was not promoted (p = 0.23). A threshold rule that pushed recall to 99.4% was dropped because it broke the 1% false-alarm target.'
  },
  {
    title: 'A running service',
    body: 'One command starts the API, an MLflow registry, Prometheus, a 14-panel Grafana dashboard, a drift job and fake traffic. Retraining only promotes a model behind a statistical gate.'
  },
  {
    title: 'Reasons with every score',
    body: 'The API returns the five strongest TreeSHAP contributions, plus the probability a person would actually see in their own inbox.'
  },
  {
    title: 'Private by default',
    body: 'No email content in the logs, only numbers in the drift job, a read-only model store, no pickle, and every port bound to localhost.'
  },
  {
    title: 'Known limits',
    body: 'The public corpora are old, so the scores are an upper bound. Short personal mail is the usual false alarm; that is what the planned LLM agent is for.'
  }
]

export default function Mailguard() {
  return (
    <>
      <Head>
        <title>mailguard · Louis Forrer</title>
        <meta property="og:title" content="mailguard · Louis Forrer" />
        <meta name="description" content={project.tagline} />
      </Head>

      <div className="case-band">
        <Dither src={paintings.dusk.src} cell={6} radius={140} />
      </div>

      <section className="case-hero container">
        <Reveal className="crumbs">
          <Link href="/">home</Link> / <Link href="/#work">work</Link> / mailguard
        </Reveal>
        <Reveal delay={0.05}>
          <h1>mailguard</h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="lede">{project.tagline}</p>
        </Reveal>
        <Reveal delay={0.15} as="dl" className="facts">
          <div>
            <dt>Year</dt>
            <dd>{project.year}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>Everything, solo</dd>
          </div>
          <div>
            <dt>Stack</dt>
            <dd>Python, LightGBM, FastAPI</dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd>
              <a href={project.repo} target="_blank" rel="noreferrer">
                LOUONE/mailguard ↗
              </a>
            </dd>
          </div>
        </Reveal>
      </section>

      <section className="container">
        <Reveal>
          <Terminal title="docs/demo — ./score.sh phishing.eml">
            <Image
              src="/images/work/mailguard/demo.gif"
              alt="A terminal scores two made-up emails with the mailguard API: a PayPal lure is labelled phishing at 96.4% with credential and URL reasons, a colleague's reply is labelled legitimate at 0.1%."
              width={1100}
              height={720}
              unoptimized
              priority
            />
          </Terminal>
        </Reveal>
        <Reveal className="stats">
          {project.stats.map(s => (
            <div key={s.label} className="stat">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="section container">
        <Reveal className="prose">
          <span className="label">
            <b>01</b> Why
          </span>
          <h2>A good score is the easy part</h2>
          <p>
            Most phishing classifiers stop at one accuracy number. I wanted to know whether
            that number <strong>holds up in a real inbox</strong>, and whether someone can
            tell why an email got flagged.
          </p>
        </Reveal>
        <Reveal as="ul" className="points">
          {points.map(pt => (
            <li key={pt.title}>
              <h3>{pt.title}</h3>
              <p>{pt.body}</p>
            </li>
          ))}
        </Reveal>
      </section>

      <section className="section container">
        <Reveal className="prose">
          <span className="label">
            <b>02</b> Architecture
          </span>
          <h2>Training, scoring, monitoring</h2>
          <p>
            Training and retraining feed an MLflow production alias behind a significance
            gate. The online path parses the email, scores it with LightGBM and TreeSHAP,
            and returns a label, a calibrated probability and its reasons. Prometheus,
            Grafana and a drift job watch what goes through.
          </p>
        </Reveal>
        <Reveal as="figure" className="figure">
          <Card className="frame">
            <Image
              src="/images/work/mailguard/architecture-dark.png"
              alt="Architecture: training and retraining with grouped splits, calibration and a significance gate feed the online FastAPI path, which feeds Prometheus, Grafana and a drift job."
              width={2168}
              height={1768}
              sizes="(max-width: 1120px) 100vw, 1040px"
            />
          </Card>
          <figcaption>Fig. 1 · System architecture, drawn in Mermaid</figcaption>
        </Reveal>

        <Reveal className="prose" style={{ marginTop: 64 }}>
          <h2>What the API returns</h2>
          <p>
            The contract is versioned, and every response says <strong>why</strong>, so a
            mail client could show the reasoning to whoever is reading.
          </p>
        </Reveal>
        <Reveal>
          <Card as="pre" className="code">
            <span className="c"># POST /v1/predict</span>
            {'\n'}
            {'{\n'}
            {'  '}<span className="k">&quot;label&quot;</span>: <span className="s">&quot;phishing&quot;</span>,{'\n'}
            {'  '}<span className="k">&quot;probability&quot;</span>: 0.9184,{'\n'}
            {'  '}<span className="k">&quot;reasons&quot;</span>: [{'\n'}
            {'    '}{'{ '}<span className="k">&quot;feature&quot;</span>: <span className="s">&quot;display_name_brand_mismatch&quot;</span>, <span className="k">&quot;contribution&quot;</span>: 1.91 {'}'},{'\n'}
            {'    '}{'{ '}<span className="k">&quot;feature&quot;</span>: <span className="s">&quot;subject_credential_cues&quot;</span>, <span className="k">&quot;contribution&quot;</span>: 1.63 {'}'},{'\n'}
            {'    '}<span className="c">…</span>{'\n'}
            {'  ]\n'}
            {'}'}
          </Card>
        </Reveal>
      </section>

      <section className="section container">
        <Reveal className="prose">
          <span className="label">
            <b>03</b> Monitoring
          </span>
          <h2>The alerts in this screenshot are real</h2>
          <p>
            The demo traffic is mostly short personal mail, so the dashboard shows a high
            phishing rate and a drift alert. That is not a bug: this traffic looks nothing
            like the training data, and <strong>this panel is where an operator would
            notice</strong>.
          </p>
        </Reveal>
        <Reveal as="figure" className="figure">
          <Card className="frame">
            <Image
              src="/images/work/mailguard/grafana-dark.png"
              alt="The mailguard Grafana dashboard: model version, readiness, request rate, predicted phishing rate, latency percentiles, score distribution and drift status."
              width={1600}
              height={1440}
              sizes="(max-width: 1120px) 100vw, 1040px"
            />
          </Card>
          <figcaption>Fig. 2 · Grafana dashboard from make demo</figcaption>
        </Reveal>
      </section>

      <section className="section container" style={{ paddingTop: 0 }}>
        <Reveal>
          <Card className="end-card">
            <span className="label">Run it</span>
            <h2>
              <code>make demo</code>
            </h2>
            <p>Only Docker needed. The API, Grafana, Prometheus and MLflow start together.</p>
            <div className="actions">
              <a href={project.repo} target="_blank" rel="noreferrer" className="btn btn-light">
                View on GitHub <span className="arrow">→</span>
              </a>
              <Link href="/" className="btn">
                ← Home
              </Link>
            </div>
          </Card>
        </Reveal>
      </section>
    </>
  )
}
