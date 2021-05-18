import { useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import useUser from '../lib/useUser';
import fetchJson from '../lib/fetchJson';
import formStyles from '../components/Form/Form.module.css';
import Navigation from '../components/Navigation';
import IdGenerator from '../components/IdGenerator';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [state, setState] = useState({
    ids: [],
    formDisabled: false,
    sentEmail: false,
    errorMsg: '',
  });
  const setDisabled = val => {
    setState(prevState => ({ ...prevState, formDisabled: val }));
  };
  const setSentEmail = val => {
    setState(prevState => ({ ...prevState, sentEmail: val }));
  };
  const setError = val => {
    setState(prevState => ({ ...prevState, errorMsg: val }));
  };
  const setIds = val => {
    setState(prevState => ({ ...prevState, ids: val }));
  };
  const { user, mutateUser } = useUser({
    redirectTo: '/login',
  });

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

  const handleGenerate = async e => {
    e.preventDefault();
    try {
      setDisabled(true);
      const body = {
        action: 'generate',
        siteId: e.currentTarget.site.value,
        quantity: e.currentTarget.quantity.value,
      };
      const res = await fetchJson(`/api/ids`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });
      setIds(res.ids);
    } catch (error) {
      setDisabled(false);
      setError(error.message);
    }
  };

  return (
    <Layout>
      {(!user || !user?.isLoggedIn) && <>Loading...</>}
      {user?.isLoggedIn && (
        <>
          <Navigation user={user} mutateUser={mutateUser} setError={setError} />
          {state.errorMsg && state.errorMsg !== '' && (
            <p className={formStyles.error}>{state.errorMsg}</p>
          )}
          {!user?.isVerified && (
            <div className={styles.maintext}>
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
            </div>
          )}
          {user?.isVerified && (!user?.access || user?.access.length === 0) && (
            <div className={styles.maintext}>
              <p>You have not yet been added to any sites.</p>
              <p>
                The site manager for each site you requested has been notified.
                (If there is not yet a site manager, the system administrator
                has been notified.)
              </p>
              <p>
                Once you have been added to the sites you requested, you will be
                able to generate new IDs here.
              </p>
            </div>
          )}
          {user?.isVerified && user?.access && user?.access.length > 0 && (
            <>
              <IdGenerator
                access={user.access}
                onSubmit={handleGenerate}
                formDisabled={state.formDisabled}
              />
              {state.ids && state.ids.length > 0 && (
                <>
                  <p>The following IDs have been marked as used:</p>
                  {state.ids.map(id => (
                    <div className={styles.id} key={id.id}>
                      {id.id}
                    </div>
                  ))}
                </>
              )}
              <p>
                To see previously generated IDs, please visit{' '}
                <Link href="/my-ids">My IDs</Link>.
              </p>
            </>
          )}
        </>
      )}
    </Layout>
  );
}
