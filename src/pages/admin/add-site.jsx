import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState } from 'react';
import useUser from '../../lib/useUser';
import fetchJson from '../../lib/fetchJson';
import Layout from '../../components/Layout';
import Navigation from '../../components/Navigation';
import formStyles from '../../styles/Form.module.css';

const AdminAddSitePage = () => {
  const { user, mutateUser } = useUser({
    redirectTo: '/login',
  });
  const [state, setState] = useState({
    errorMsg: '',
    submitting: false,
  });
  const router = useRouter();

  const setErrorMsg = val => {
    setState(prevState => ({ ...prevState, errorMsg: val }));
  };
  const setSubmitting = val => {
    setState(prevState => ({ ...prevState, submitting: val }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      const body = {
        siteId: e.currentTarget.siteId.value.toUpperCase(),
        name: e.currentTarget.name.value,
        network: e.currentTarget.network.value,
        action: 'add-site',
      };
      await fetchJson('/api/admin/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      router.push('/admin');
      setErrorMsg('');
      setSubmitting(false);
    } catch (error) {
      setErrorMsg(error.message);
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      {(!user || !user?.isLoggedIn) && <>Loading...</>}
      {user?.isLoggedIn && (
        <>
          <Navigation
            user={user}
            mutateUser={mutateUser}
            setError={setErrorMsg}
          />
          {state.errorMsg !== '' && (
            <div className={formStyles.error}>{state.errorMsg}</div>
          )}
          {(!user?.isVerified || user?.role !== 'admin') && (
            <div>You are not authorized to view this page.</div>
          )}
          {user?.isVerified && user?.role === 'admin' && (
            <>
              <h3>Add site</h3>
              <div>
                <form onSubmit={handleSubmit}>
                  <div className={formStyles.fieldset}>
                    <label htmlFor="network" className={formStyles.label}>
                      Network
                    </label>
                    <select
                      name="network"
                      disabled={state.submitting}
                      className={formStyles.field}
                    >
                      <option value="PRESCIENT">PRESCIENT</option>
                      <option value="ProNET">ProNET</option>
                    </select>
                  </div>
                  <div className={formStyles.fieldset}>
                    <label htmlFor="siteId" className={formStyles.label}>
                      Site ID
                    </label>
                    <small>Must be two letters</small>
                    <input
                      type="text"
                      maxLength={2}
                      required
                      disabled={state.submitting}
                      className={formStyles.field}
                      name="siteId"
                    />
                  </div>
                  <div className={formStyles.fieldset}>
                    <label htmlFor="name" className={formStyles.label}>
                      Site name
                    </label>
                    <input
                      type="text"
                      maxLength={255}
                      required
                      disabled={state.submitting}
                      className={formStyles.field}
                      name="name"
                    />
                  </div>
                  <div className={formStyles.buttongroup}>
                    <button
                      type="submit"
                      disabled={state.submitting}
                      className={formStyles.button}
                    >
                      Submit
                    </button>
                    <div className={formStyles.formlink}>
                      <Link href="/admin">Go back</Link>
                    </div>
                  </div>
                </form>
              </div>
            </>
          )}
        </>
      )}
    </Layout>
  );
};

export default AdminAddSitePage;
