import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import useUser from '../lib/useUser';
import Layout from '../components/Layout';
import Navigation from '../components/Navigation';
import fetchJson from '../lib/fetchJson';
import formStyles from '../styles/Form.module.css';
import IdTable from '../components/IdTable';
import IdTableCsvLink from '../lib/csv';

const MyIdsPage = () => {
  const { user, mutateUser } = useUser({
    redirectTo: '/login',
  });
  const [state, setState] = useState({
    ids: [],
    errorMsg: '',
    noIdsForSite: false,
    idsLoading: false,
    sitesList: [],
    sitesLoading: true,
  });
  const setError = useCallback(val => {
    setState(prevState => ({ ...prevState, errorMsg: val }));
  }, []);
  const setIds = useCallback(val => {
    setState(prevState => ({ ...prevState, ids: val }));
  }, []);
  const setNoIdsForSite = useCallback(val => {
    setState(prevState => ({ ...prevState, noIdsForSite: val }));
  }, []);
  const setIdsLoading = useCallback(val => {
    setState(prevState => ({ ...prevState, idsLoading: val }));
  }, []);
  const setSitesList = useCallback(val => {
    setState(prevState => ({ ...prevState, sitesList: val }));
  }, []);
  const setSitesLoading = useCallback(val => {
    setState(prevState => ({ ...prevState, sitesLoading: val }));
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setIdsLoading(true);
    try {
      const body = {
        action: 'list-mine',
        siteId: e.currentTarget.site.value,
      };
      const res = await fetchJson('/api/ids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setIds(res.ids);
      if (res.ids.length === 0) {
        setNoIdsForSite(true);
      } else setNoIdsForSite(false);
      setIdsLoading(false);
    } catch (error) {
      setError(error.message);
      setIdsLoading(false);
    }
  };

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

  return (
    <Layout>
      {(!user || !user?.isLoggedIn || state?.sitesLoading) && <>Loading...</>}
      {user?.isLoggedIn && !state?.sitesLoading && (
        <>
          <Navigation user={user} mutateUser={mutateUser} setError={setError} />
          {state.errorMsg && state.errorMsg !== '' && (
            <p className={formStyles.error}>{state.errorMsg}</p>
          )}
          {user?.isVerified && (!user.access || user.access.length === 0) && (
            <div>
              <p>You have not yet been added to any sites.</p>
              <p>
                The site manager for each site you requested has been notified.
              </p>
              <p>
                Once you have been added to the site(s) you requested, you will
                be able to generate new IDs from the <Link href="/">Home</Link>{' '}
                page.
              </p>
            </div>
          )}
          {user?.isVerified && user.access?.length > 0 && (
            <>
              <h4>My Generated IDs</h4>
              <div>
                <form onSubmit={handleSubmit}>
                  <div className={formStyles.inputgroup}>
                    <div className={formStyles.fieldset}>
                      <label htmlFor="site" className={formStyles.label}>
                        Site
                      </label>
                      <select name="site" className={formStyles.selectfield}>
                        {state.sitesList
                          .filter(site =>
                            user.access.some(
                              accessSite => accessSite.siteId === site.siteId
                            )
                          )
                          .sort((a, b) => {
                            const nameA = a.name.toUpperCase();
                            const nameB = b.name.toUpperCase();
                            if (nameA < nameB) return -1;
                            if (nameA > nameB) return 1;
                            return 0;
                          })
                          .map(site => (
                            <option value={site.siteId} key={site.siteId}>
                              {site.name} ({site.siteId})
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className={formStyles.buttongroup}>
                      <button type="submit" className={formStyles.horizbutton}>
                        Show
                      </button>
                    </div>
                  </div>
                </form>
              </div>
              {state.idsLoading && <p>Loading...</p>}
              {!state.idsLoading && state.ids && state.ids.length > 0 && (
                <>
                  <p>
                    You have generated the following IDs, now marked as used (
                    <IdTableCsvLink ids={state.ids} mode="mine" />
                    ):
                  </p>
                  <div>
                    <IdTable ids={state.ids} mode="mine" />
                  </div>
                </>
              )}
              {!state.idsLoading && state.noIdsForSite === true && (
                <p>You have not generated any IDs for this site yet.</p>
              )}
            </>
          )}
        </>
      )}
    </Layout>
  );
};

export default MyIdsPage;
