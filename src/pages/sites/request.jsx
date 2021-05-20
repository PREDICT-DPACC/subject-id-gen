import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Navigation from '../../components/Navigation';
import useUser from '../../lib/useUser';
import fetchJson from '../../lib/fetchJson';
import formStyles from '../../styles/Form.module.css';
import { OptionsForSiteList } from '../../lib/sites';

const PromoteToManagerPage = () => {
  const { user, mutateUser } = useUser({
    redirectTo: '/login',
  });
  const router = useRouter();

  const [state, setState] = useState({
    errorMsg: '',
    submitting: false,
    sitesList: [],
    sitesLoading: true,
  });
  const setError = useCallback(val => {
    setState(prevState => ({ ...prevState, errorMsg: val }));
  }, []);
  const setSubmitting = useCallback(val => {
    setState(prevState => ({ ...prevState, submitting: val }));
  }, []);
  const setSitesList = useCallback(val => {
    setState(prevState => ({ ...prevState, sitesList: val }));
  }, []);
  const setSitesLoading = useCallback(val => {
    setState(prevState => ({ ...prevState, sitesLoading: val }));
  }, []);

  const fetchSites = useCallback(async () => {
    try {
      const body = { action: 'names' };
      const res = await fetchJson('/api/sites', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });
      setSitesList(res.sites);
      setError('');
      setSitesLoading(false);
    } catch (error) {
      setError(error.message);
      setSitesLoading(false);
    }
  }, [setError, setSitesList, setSitesLoading]);

  useEffect(() => {
    if (
      state?.sitesList &&
      state.sitesList.length === 0 &&
      state.sitesLoading
    ) {
      fetchSites();
    }
  }, [user, state.sitesList, state.sitesLoading, fetchSites]);

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    const sites = [...e.currentTarget.sites.options];
    const body = {
      action: 'request-access',
      sites: sites.filter(option => option.selected).map(s => s.value),
    };
    try {
      await fetchJson('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      router.push('/');
      setSubmitting(false);
    } catch (error) {
      setError(error.message);
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      {(!user || !user?.isLoggedIn) && <>Loading...</>}
      {user?.isLoggedIn && (
        <>
          <Navigation user={user} mutateUser={mutateUser} setError={setError} />
          {user?.role !== 'admin' && (
            <div>You are not authorized to view this page.</div>
          )}
          {state.sitesLoading && <p>Loading...</p>}
          {!state.sitesLoading && (
            <>
              {state.errorMsg !== '' && <div>{state.errorMsg}</div>}
              {state.sitesList && state.sitesList.length > 0 && (
                <form onSubmit={handleSubmit}>
                  <div className={formStyles.fieldset}>
                    <label htmlFor="sites" className={formStyles.label}>
                      Request access to which site(s)?
                    </label>
                    <p>CTRL or CMD + click to select multiple.</p>
                    <select
                      name="sites"
                      multiple
                      className={formStyles.field}
                      disabled={state.submitting}
                    >
                      <optgroup label="PRESCIENT">
                        <OptionsForSiteList
                          filteredSites={state.sitesList.filter(
                            site => site.network === 'PRESCIENT'
                          )}
                        />
                      </optgroup>
                      <optgroup label="ProNET">
                        <OptionsForSiteList
                          filteredSites={state.sitesList.filter(
                            site => site.network === 'ProNET'
                          )}
                        />
                      </optgroup>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className={formStyles.button}
                    disabled={state.submitting}
                  >
                    Request
                  </button>
                </form>
              )}
            </>
          )}
        </>
      )}
    </Layout>
  );
};

export default PromoteToManagerPage;
