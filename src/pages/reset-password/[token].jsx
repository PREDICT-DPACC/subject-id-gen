import * as yup from 'yup';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useUser from '../../lib/useUser';
import fetchJson from '../../lib/fetchJson';
import Layout from '../../components/Layout';
import styles from '../../styles/Login.module.css';
import formStyles from '../../styles/Form.module.css';

const NewPasswordPage = () => {
  const { user } = useUser({
    redirectTo: '/',
    redirectIfFound: true,
  });
  const router = useRouter();
  const { token } = router.query;
  const [state, setState] = useState({
    errorMsg: '',
    tokenLoading: true,
    submitting: false,
    didReset: false,
    data: {},
  });
  const setErrorMsg = useCallback(val => {
    setState(prevState => ({ ...prevState, errorMsg: val }));
  }, []);
  const setTokenLoading = useCallback(val => {
    setState(prevState => ({ ...prevState, tokenLoading: val }));
  }, []);
  const setSubmitting = useCallback(val => {
    setState(prevState => ({ ...prevState, submitting: val }));
  }, []);
  const setDidReset = useCallback(val => {
    setState(prevState => ({ ...prevState, didReset: val }));
  }, []);
  const setData = useCallback(val => {
    setState(prevState => ({ ...prevState, data: val }));
  }, []);

  const fetchData = useCallback(async () => {
    try {
      console.log(token);
      const body = {
        token,
        action: 'verify-token',
      };
      const res = await fetchJson('/api/auth/reset-pw', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });
      setData(res);
      setErrorMsg('');
      setTokenLoading(false);
    } catch (error) {
      setErrorMsg(error.message);
      setTokenLoading(false);
    }
  }, [setData, setErrorMsg, setTokenLoading, token]);

  useEffect(() => {
    if (token && !state.data.foundToken) {
      fetchData();
    }
  }, [fetchData, state.data.foundToken, token]);

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fields = {
        newPassword: e.currentTarget.password.value,
        newPasswordConfirmation: e.currentTarget['confirm-password'].value,
      };
      const schema = yup.object().shape({
        newPassword: yup.string().min(6).required(),
        newPasswordConfirmation: yup
          .string()
          .oneOf([yup.ref('newPassword')], 'Passwords do not match.')
          .required(),
      });
      await schema.validate(fields);
      const body = {
        token,
        action: 'reset-password',
        newPassword: fields.newPassword,
      };
      await fetchJson('/api/auth/reset-pw', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });
      setErrorMsg('');
      setSubmitting(false);
      setDidReset(true);
    } catch (error) {
      setErrorMsg(error.message);
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      {(!user || user?.isLoggedIn || state.tokenLoading) && <>Loading...</>}
      {user && !user.isLoggedIn && !state.tokenLoading && (
        <>
          <p className={styles.description}>Reset password</p>
          {state.errorMsg && (
            <div className={formStyles.error}>{state.errorMsg}</div>
          )}
          {state.didReset && (
            <p>
              <strong>Password reset.</strong> Please return to the{' '}
              <Link href="/login">login page</Link> and try logging in with your
              new password.
            </p>
          )}
          {!state.didReset && state.data.foundToken && (
            <>
              <form onSubmit={handleSubmit}>
                <div className={formStyles.fieldset}>
                  <div className={formStyles.fieldset}>
                    <label htmlFor="password" className={formStyles.label}>
                      New Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      autoComplete="new-password"
                      disabled={state.submitting}
                      className={formStyles.field}
                      required
                    />
                  </div>

                  <div className={formStyles.fieldset}>
                    <label
                      htmlFor="confirm-password"
                      className={formStyles.label}
                    >
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirm-password"
                      autoComplete="new-password"
                      disabled={state.submitting}
                      className={formStyles.field}
                      required
                    />
                  </div>
                </div>
                <div className={formStyles.buttongroup}>
                  <button
                    type="submit"
                    disabled={state.submitting}
                    className={formStyles.horizbutton}
                  >
                    Submit
                  </button>
                </div>
              </form>
            </>
          )}
        </>
      )}
    </Layout>
  );
};

export default NewPasswordPage;
