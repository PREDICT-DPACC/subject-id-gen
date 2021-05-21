import { useState } from 'react';
import Layout from '../components/Layout';
import LoginForm from '../components/LoginForm';
import fetchJson from '../lib/fetchJson';
import useUser from '../lib/useUser';
import styles from '../styles/Login.module.css';
import Navigation from '../components/Navigation';

const LoginPage = () => {
  const { user, mutateUser } = useUser({
    redirectTo: '/',
    redirectIfFound: true,
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    const body = {
      email: e.currentTarget.email.value,
      password: e.currentTarget.password.value,
    };

    try {
      await mutateUser(
        fetchJson('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      );
      setSubmitting(false);
    } catch (error) {
      setErrorMsg(error.data.message);
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <p className={styles.description}>
        A tool to create or validate subject IDs for the DPACC project.
      </p>
      {(!user || user?.isLoggedIn) && <>Loading...</>}
      {user && !user.isLoggedIn && (
        <>
          <Navigation
            user={user}
            mutateUser={mutateUser}
            setError={setErrorMsg}
          />
          <LoginForm
            onSubmit={handleSubmit}
            errorMessage={errorMsg}
            disabled={submitting}
          />
        </>
      )}
    </Layout>
  );
};

export default LoginPage;
