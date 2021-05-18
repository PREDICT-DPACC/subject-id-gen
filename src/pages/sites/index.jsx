import { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import useUser from '../../lib/useUser';
import fetchJson from '../../lib/fetchJson';
import formStyles from '../../components/Form/Form.module.css';
import Navigation from '../../components/Navigation';
import SiteTable from '../../components/SiteTable';

export default function ManageSitesPage() {
  const { user, mutateUser } = useUser({
    redirectTo: '/login',
  });

  const [state, setState] = useState({
    errorMsg: '',
    data: [],
    tableLoading: true,
  });
  const setError = useCallback(val => {
    setState(prevState => ({ ...prevState, errorMsg: val }));
  }, []);
  const setData = useCallback(val => {
    setState(prevState => ({ ...prevState, data: val }));
  }, []);
  const setTableLoading = useCallback(val => {
    setState(prevState => ({ ...prevState, tableLoading: val }));
  }, []);

  const fetchData = useCallback(
    async sites => {
      try {
        const body = { sites };
        const res = await fetchJson(`/api/sites`, {
          method: 'POST',
          body: JSON.stringify(body),
          headers: { 'Content-Type': 'application/json' },
        });
        setData(res);
        setTableLoading(false);
      } catch (error) {
        setError(error.message);
        setTableLoading(false);
      }
    },
    [setData, setError, setTableLoading]
  );

  useEffect(() => {
    if (
      user?.isLoggedIn &&
      user?.isVerified &&
      (user?.role === 'admin' ||
        user?.access.some(siteAccess => siteAccess.siteRole === 'manager'))
    ) {
      setTableLoading(true);
      fetchData(
        user.access
          .filter(siteAccess => siteAccess.siteRole === 'manager')
          .map(siteAccess => siteAccess.siteId)
      );
    }
  }, [user, fetchData, setTableLoading]);

  return (
    <Layout>
      {(!user || !user?.isLoggedIn) && <>Loading...</>}
      {user?.isLoggedIn && (
        <>
          <Navigation user={user} mutateUser={mutateUser} setError={setError} />
          {state.errorMsg && state.errorMsg !== '' && (
            <p className={formStyles.error}>{state.errorMsg}</p>
          )}
          {(!user?.isVerified ||
            !user?.access.some(
              siteAccess => siteAccess.siteRole === 'manager'
            )) && <div>You are not authorized to view this page.</div>}
          {user?.isVerified &&
            user?.access.some(
              siteAccess => siteAccess.siteRole === 'manager'
            ) && (
              <>
                {(state.tableLoading || !state.data.sites) && <p>Loading...</p>}
                {!state.tableLoading && state.data.sites && (
                  <>
                    <p>
                      Here you can manage sites for which you are a designated
                      Manager.
                    </p>
                    <SiteTable sites={state.data.sites} mode="manage" />
                  </>
                )}
              </>
            )}
        </>
      )}
    </Layout>
  );
}
