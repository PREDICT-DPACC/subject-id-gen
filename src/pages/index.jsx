import Layout from '../components/Layout';
import LoginForm from '../components/LoginForm';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <Layout>
      <h1 className={styles.title}>
        Subject ID Generator
      </h1>
      <p className={styles.description}>
        A tool to create or validate subject IDs for the DPACC project.
      </p>
      <LoginForm />
    </Layout>
  )
}
