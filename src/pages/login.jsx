import React, { useState } from 'react';
import Layout from '../components/Layout';
import LoginForm from '../components/LoginForm/LoginForm';
import fetchJson from '../lib/fetchJson';
import useUser from '../lib/useUser';
import styles from '../styles/Login.module.css';

const LoginPage = () => {
  const { mutateUser } = useUser({
    redirectTo: '/',
    redirectIfFound: true,
  });

  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();

    const body = {
      email: e.currentTarget.email.value,
      password: e.currentTarget.password.value,
    };

    try {
      await mutateUser(
        fetchJson('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      );
    } catch (error) {
      console.error('An unexpected error happened:', error);
      setErrorMsg(error.data.message);
    }
  }

  return (
    <Layout>
      <h1 className={styles.title}>Subject ID Generator</h1>
      <p className={styles.description}>
        A tool to create or validate subject IDs for the DPACC project.
      </p>
      <LoginForm onSubmit={handleSubmit} errorMessage={errorMsg} />
    </Layout>
  );
};

export default LoginPage;
