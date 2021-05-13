import { useRouter } from 'next/router';
import React, { useState } from 'react';
import Layout from '../components/Layout';
import RegisterForm from '../components/RegisterForm';
import fetchJson from '../lib/fetchJson';
import useUser from '../lib/useUser';
import styles from '../styles/Home.module.css';

const RegisterPage = () => {
  const { mutateUser } = useUser({
    redirectTo: '/',
    redirectIfFound: true,
  });
  const router = useRouter();

  const [errorMsg, setErrorMsg] = useState('');
  async function handleSubmit(e) {
    e.preventDefault();

    const sites = [...e.currentTarget.sites.options];

    const body = {
      firstName: e.currentTarget.firstName.value,
      lastName: e.currentTarget.lastName.value,
      email: e.currentTarget.email.value,
      sites: sites.filter(option => option.selected).map(s => s.value),
      password: e.currentTarget.password.value,
    };

    try {
      await mutateUser(
        fetchJson('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      );
      router.push('/');
    } catch (error) {
      console.error('An unexpected error happened:', error);
      setErrorMsg(error.message);
    }
  }

  return (
    <Layout>
      <p className={styles.description}>Registration</p>
      <RegisterForm onSubmit={handleSubmit} errorMessage={errorMsg} />
    </Layout>
  );
};

export default RegisterPage;
