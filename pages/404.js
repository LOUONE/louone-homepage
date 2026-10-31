import Head from 'next/head'
import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="container notfound">
      <Head>
        <title>404 · Louis Forrer</title>
      </Head>
      <h1>404</h1>
      <p>
        Nothing here. The lake is still there though.
      </p>
      <Link href="/" className="btn">
        ← Back home
      </Link>
    </section>
  )
}
