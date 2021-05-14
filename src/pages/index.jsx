import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import useUser from '../lib/useUser';
import fetchJson from '../lib/fetchJson';
import formStyles from '../components/Form/Form.module.css';
import Navigation from '../components/Navigation';

export default function Home() {
  const [state, setState] = useState({
    formDisabled: false,
    sentEmail: false,
    errorMsg: '',
  });
  const setDisabled = val => {
    setState({ ...state, formDisabled: val });
  };
  const setSentEmail = val => {
    setState({ ...state, sentEmail: val });
  };
  const setError = val => {
    setState({ ...state, errorMsg: val });
  };
  const { user, mutateUser } = useUser({
    redirectTo: '/login',
  });
  const router = useRouter();

  const handleResendVerification = async e => {
    e.preventDefault();
    try {
      setDisabled(true);
      const body = { email: user.email };
      await fetchJson('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setSentEmail(true);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Layout>
      {(!user || !user?.isLoggedIn) && <>Loading...</>}
      {user?.isLoggedIn && (
        <>
          <Navigation
            user={user}
            mutateUser={mutateUser}
            setError={setError}
            router={router}
          />
          {state.errorMsg && state.errorMsg !== '' && (
            <p className={formStyles.error}>{state.errorMsg}</p>
          )}
          {!user?.isVerified && (
            <>
              {!state.sentEmail && (
                <>
                  <p>
                    Email not yet verified. Please check your email, including
                    Spam or Junk folders, or:
                  </p>
                  <button
                    onClick={handleResendVerification}
                    type="button"
                    disabled={state.formDisabled}
                    className={formStyles.button}
                  >
                    Resend verification email
                  </button>
                </>
              )}
              {state.sentEmail && <p>Verification email sent.</p>}
            </>
          )}
          {user?.isVerified && <p>Email is verified!</p>}
        </>
      )}
    </Layout>
  );
}
