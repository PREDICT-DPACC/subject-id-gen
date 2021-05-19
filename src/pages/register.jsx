import { useRouter } from 'next/router';
import { useState } from 'react';
import * as yup from 'yup';
import Layout from '../components/Layout';
import RegisterForm from '../components/RegisterForm';
import fetchJson from '../lib/fetchJson';
import useUser from '../lib/useUser';
import styles from '../styles/Login.module.css';

const RegisterPage = () => {
  const { user, mutateUser } = useUser({
    redirectTo: '/',
    redirectIfFound: true,
  });
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [validState, setValidState] = useState({
    firstName: true,
    lastName: true,
    email: true,
    password: true,
    'confirm-password': true,
  });

  const schema = yup.object().shape({
    firstName: yup.string().max(255).required(),
    lastName: yup.string().max(255).required(),
    email: yup.string().max(255).email().required(),
    sites: yup.array().of(yup.string()),
    password: yup.string().min(6).required(),
    passwordConfirmation: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords do not match.')
      .required(),
  });

  async function handleBlur(e) {
    if (
      e.target !== null &&
      (e.target.type === 'password' || e.target.type === 'text')
    ) {
      if (e.target.value === '')
        setValidState(prevState => ({ ...prevState, [e.target.name]: false }));
      else
        setValidState(prevState => ({ ...prevState, [e.target.name]: true }));
    }
  }
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    const sites = [...e.currentTarget.sites.options];

    const body = {
      firstName: e.currentTarget.firstName.value,
      lastName: e.currentTarget.lastName.value,
      email: e.currentTarget.email.value,
      sites: sites.filter(option => option.selected).map(s => s.value),
      password: e.currentTarget.password.value,
      passwordConfirmation: e.currentTarget['confirm-password'].value,
    };

    try {
      await schema.validate(body);
      await mutateUser(
        fetchJson('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      );
      router.push('/');
      setSubmitting(false);
    } catch (error) {
      setErrorMsg(error.message);
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      {(!user || user?.isLoggedIn) && <>Loading...</>}
      {user && !user.isLoggedIn && (
        <>
          <p className={styles.description}>Registration</p>
          <RegisterForm
            onSubmit={handleSubmit}
            errorMessage={errorMsg}
            onBlur={handleBlur}
            validState={validState}
            disabled={submitting}
          />
        </>
      )}
    </Layout>
  );
};

export default RegisterPage;
