import Link from 'next/link';
import { useState } from 'react';
import useUser from '../../lib/useUser';
import Layout from '../../components/Layout';
import styles from '../../styles/Login.module.css';
import formStyles from '../../styles/Form.module.css';
import fetchJson from '../../lib/fetchJson';

const ResetPasswordPage = () => {
  const { user } = useUser({
    redirectTo: '/',
    redirectIfFound: true,
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sentEmail, setSentEmail] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        action: 'send-email',
        email: e.currentTarget.email.value,
      };
      await fetchJson('/api/auth/reset-pw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setSubmitting(false);
      setSentEmail(true);
    } catch (error) {
      setErrorMsg(error.data.message);
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      {(!user || user?.isLoggedIn) && <>Loading...</>}
      {user && !user.isLoggedIn && (
        <>
          <p className={styles.description}>Reset password</p>
          {errorMsg && <div className={formStyles.error}>{errorMsg}</div>}
          {!sentEmail && (
            <>
              <form onSubmit={handleSubmit}>
                <div className={formStyles.inputgroup}>
                  <div className={formStyles.fieldset}>
                    <label htmlFor="email" className={formStyles.label}>
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      disabled={submitting}
                      maxLength={255}
                      className={formStyles.field}
                      required
                    />
                  </div>
                  <div className={formStyles.buttongroup}>
                    <button
                      type="submit"
                      disabled={submitting}
                      className={formStyles.horizbutton}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </form>
              <p>
                If you forgot your password, fill out the field above and a link
                to reset your password will be sent to your email.
              </p>
            </>
          )}
          {sentEmail && (
            <p>
              <strong>Email sent.</strong> Please check your email, including
              spam or junk mail, for your reset password link.
            </p>
          )}
          <div className={formStyles.button}>
            <Link href="/">Go back</Link>
          </div>
        </>
      )}
    </Layout>
  );
};

export default ResetPasswordPage;
