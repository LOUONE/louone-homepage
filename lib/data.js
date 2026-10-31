export const profile = {
  name: 'Louis Forrer',
  role: 'Cyber, AI & software',
  location: 'Geneva, CH',
  timeZone: 'Europe/Zurich',
  email: 'louone.lf@gmail.com',
  links: {
    github: 'https://github.com/LOUONE',
    linkedin: 'https://www.linkedin.com/in/~lf/',
    flickr: 'https://flickr.com/photos/197481682@N03/'
  }
}

export const paintings = {
  hero: {
    src: '/images/hodler-leman-1905.jpg',
    caption: 'Ferdinand Hodler, Lake Geneva from Chexbres, 1905'
  },
  dusk: {
    src: '/images/hodler-leman-evening-1895.jpg',
    caption: 'Ferdinand Hodler, Lake Geneva in the Evening from Chexbres, 1895'
  }
}

export const mailguard = {
  slug: 'mailguard',
  title: 'mailguard',
  year: '2026',
  kind: 'Personal · open source',
  tagline:
    'Phishing detection that explains every verdict, measures itself honestly and runs as a monitored service.',
  stack: ['Python', 'LightGBM', 'SHAP', 'FastAPI', 'MLflow', 'Prometheus', 'Grafana', 'Docker'],
  repo: 'https://github.com/LOUONE/mailguard',
  stats: [
    { value: '99.0%', label: 'of phishing caught at 1% false alarms' },
    { value: '18 ms', label: 'median latency per email' },
    { value: '406', label: 'tests, mypy strict, Docker CI' },
    { value: '3', label: 'improvements measured and rejected' }
  ]
}

export const projects = [
  {
    title: 'Algorithmic trading systems',
    year: '2025 – now',
    kind: 'Personal',
    summary:
      'Two trading bots I run myself, on a Linux VPS I administer, 24/7.',
    stack: ['Python', 'Interactive Brokers API', 'SQLite', 'Docker', 'Linux'],
    details: [
      'Event-driven executor: takes external trade signals, applies position sizing and risk rules, sends the orders through the Interactive Brokers API and pings me on Telegram.',
      'Multi-strategy bot for crypto perpetual futures, with its own backtesting engine and Monte Carlo runs to see how bad the bad days can get.'
    ]
  },
  {
    title: 'AI collaboration platform',
    year: '2025',
    kind: 'Capstone · team of 3',
    summary:
      'Real-time task board where each user gets a local LLM to sort out what to do first.',
    stack: ['FastAPI', 'React', 'TypeScript', 'Ollama', 'Redis', 'PostgreSQL'],
    details: [
      'Led the team. Each user runs LLaMA 3 locally through Ollama, so task prioritisation never leaves their machine.',
      'Wrote the FastAPI backend (Redis for state, a PostgreSQL task graph, under 100 ms per request) and the React/TypeScript frontend with live WebSocket sync.'
    ]
  }
]

export const experience = [
  {
    company: 'EY Switzerland',
    place: 'Geneva',
    role: 'Consultant, Cybersecurity & AI',
    period: 'Sep 2025 – now',
    current: true,
    points: [
      'Designed and built an AI document-analysis platform in Python: FastAPI backend, LLM/RAG pipelines, OCR/NLP ingestion and real-time dashboards. On client pilots it cut manual review time by about 60%.',
      'Part of the AI innovation team in EY Switzerland’s technology consulting: I build internal tools, give AI trainings and help modernise how consulting work gets done.',
      'Designed the security of AI tooling for regulated clients (access control, redaction, audit logging, data handling) so banks and public-sector teams could actually adopt it.',
      'Cybersecurity work for Swiss banks: digital forensics on a FINMA-mandated investigation, security and risk assessments (SWIFT CSP, SIC payment infrastructure), and incident-response tabletop exercises.',
      'Interview engineering candidates for the team.'
    ]
  },
  {
    company: 'EY Canada',
    place: 'Montréal',
    role: 'Technology Consultant, intern',
    period: 'Summers 2023 & 2024',
    points: [
      'Python ETL pipeline pulling from core banking databases for a major Canadian bank.',
      'Data integrity on its Oracle FSDF platform: 15M+ liquidity, treasury, risk and derivatives transactions a day.',
      'Cut query times on critical databases by about 20%, and brought in Kubernetes deployments and GitHub Actions CI/CD.'
    ]
  },
  {
    company: 'Genetec',
    place: 'Montréal',
    role: 'SOC Analyst, intern',
    period: 'Summer 2022',
    points: [
      'Went through 200+ alerts a week and tuned the SIEM queries: about 20% fewer false positives.',
      'Python scripts for the monitoring workflow that made triage about 30% faster.',
      'Tested Microsoft EDR and antivirus coverage, which helped surface 12 vulnerabilities nobody had caught.'
    ]
  }
]

export const toolkit = [
  {
    group: 'Code',
    items: ['Python', 'TypeScript', 'JavaScript', 'SQL', 'Bash', 'React']
  },
  {
    group: 'AI',
    items: ['LLM / RAG pipelines', 'LangChain', 'Ollama', 'OCR / NLP', 'LightGBM, SHAP']
  },
  {
    group: 'Backend & data',
    items: ['FastAPI', 'PostgreSQL', 'Redis', 'MongoDB', 'WebSockets', 'ETL']
  },
  {
    group: 'Infra',
    items: ['Docker', 'Kubernetes', 'GitHub Actions CI/CD', 'Linux', 'Prometheus, Grafana']
  },
  {
    group: 'Security',
    items: ['Digital forensics', 'Incident response', 'SIEM', 'EDR', 'IAM', 'Cloud security']
  },
  {
    group: 'Frameworks',
    items: ['SWIFT CSCF', 'FINMA', 'ISO 27001', 'NIST CSF']
  }
]

export const education = {
  degree: 'BSc Computer Science',
  school: 'Université de Montréal',
  period: '2021 – 2025',
  notes: [
    'Competitive Algorithmics Club, ICPC 2024',
    'Cybersecurity Club: Hackfest 2023 & 2024 CTFs, MontreHack'
  ]
}

export const certifications = [
  { name: 'CCSK', detail: 'Certificate of Cloud Security Knowledge, Cloud Security Alliance' }
]

export const languages = [
  { name: 'French', level: 'native' },
  { name: 'English', level: 'fluent' },
  { name: 'German', level: 'basic' }
]
