import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Subject ID Generator</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Subject ID Generator
        </h1>
        <p className={styles.description}>
          A tool to create or validate subject IDs for the DPACC project.
        </p>
      </main>
    </div>
  )
}
