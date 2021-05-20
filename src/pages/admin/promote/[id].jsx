import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Navigation from '../../../components/Navigation';
import useUser from '../../../lib/useUser';
import fetchJson from '../../../lib/fetchJson';
import formStyles from '../../../styles/Form.module.css';
import { OptionsForSiteList } from '../../../lib/sites';

const PromoteToManagerPage = () => {
  const { user, mutateUser } = useUser({
    redirectTo: '/login',
  });
  const router = useRouter();
  const { id } = router.query;

  const [state, setState] = useState({
    userData: {},
    errorMsg: '',
    userLoading: true,
    sitesList: [],
    sitesLoading: true,
  });
  const setUserData = useCallback(val => {
    setState(prevState => ({ ...prevState, userData: val }));
  }, []);
  const setError = useCallback(val => {
    setState(prevState => ({ ...prevState, errorMsg: val }));
  }, []);
  const setLoading = useCallback(val => {
    setState(prevState => ({ ...prevState, userLoading: val }));
  }, []);
  const setSitesList = useCallback(val => {
    setState(prevState => ({ ...prevState, sitesList: val }));
  }, []);
  const setSitesLoading = useCallback(val => {
    setState(prevState => ({ ...prevState, sitesLoading: val }));
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetchJson(`/api/admin/user/${id}?mode=find`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      setUserData(res);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  }, [id, setUserData, setError, setLoading]);

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
    if (user?.role === 'admin') {
      fetchUser();
    }
    if (
      state?.sitesList &&
      state.sitesList.length === 0 &&
      state.sitesLoading
    ) {
      fetchSites();
    }
  }, [user, fetchUser, state.sitesList, state.sitesLoading, fetchSites]);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    const sites = [...e.currentTarget.sites.options];
    const body = {
      sites: sites.filter(option => option.selected).map(s => s.value),
    };
    try {
      await fetchJson(`/api/admin/user/${id}?mode=promote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      router.push('/admin');
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
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
          {user?.role === 'admin' && state.userLoading && <p>Loading...</p>}
          {user?.role === 'admin' && !state.userLoading && (
            <>
              {state.errorMsg !== '' && <div>{state.errorMsg}</div>}
              {state.userData && state.sitesList && state.sitesList.length > 0 && (
                <form onSubmit={handleSubmit}>
                  <div className={formStyles.fieldset}>
                    <p>
                      <label htmlFor="sites" className={formStyles.label}>
                        Make{' '}
                        <strong>
                          {state.userData.firstName} {state.userData.lastName}
                        </strong>{' '}
                        manager of which site(s)?
                      </label>
                    </p>
                    <p>CTRL or CMD + click to select multiple.</p>
                    <select name="sites" multiple className={formStyles.field}>
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
                  <button type="submit" className={formStyles.button}>
                    Promote
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
