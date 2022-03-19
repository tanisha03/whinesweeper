import Head from 'next/head'
import Grid from '../components/Grid'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Whinesweeper</title>
        <meta name="description" content="A minesweeper that doesn't make you whine" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div>
          <Grid />
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://twitter.com/tanishaaa03"
          target="_blank"
          rel="noopener noreferrer"
        >
          A useless game by &nbsp;<span style={{color: '#83A8CB'}}>{'@tanishaaa03'}</span>
        </a>
      </footer>
    </div>
  )
}
