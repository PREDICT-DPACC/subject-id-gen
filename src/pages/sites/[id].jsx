import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import useUser from '../../lib/useUser';
import fetchJson from '../../lib/fetchJson';
import formStyles from '../../components/Form/Form.module.css';
import Navigation from '../../components/Navigation';
import Site from '../../components/Site';

export default function SitePage() {
  const { user, mutateUser } = useUser({
    redirectTo: '/login',
  });
  const router = useRouter();
  const { id } = router.query;

  const [state, setState] = useState({
    errorMsg: '',
    data: {},
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

  const fetchData = useCallback(async () => {
    try {
      const res = await fetchJson(`/api/site/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      setData(res);
      setTableLoading(false);
      setError('');
    } catch (error) {
      setError(error.message);
      setTableLoading(false);
    }
  }, [id, setData, setError, setTableLoading]);

  useEffect(() => {
    if (
      user?.isLoggedIn &&
      user?.isVerified &&
      (user?.role === 'admin' ||
        user?.access.some(
          siteAccess =>
            siteAccess.siteRole === 'manager' && siteAccess.siteId === id
        ))
    ) {
      setTableLoading(true);
      fetchData(id);
    }
  }, [user, fetchData, setTableLoading, id]);

  const postToApi = async ({ body }) => {
    const res = await fetchJson(`/api/site/${id}`, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
    });
    setData(res);
    setTableLoading(false);
  };

  const handleSelect = async e => {
    e.preventDefault();
    setTableLoading(true);
    const newRole = e.target.value;
    const userId = e.target.getAttribute('data-id');
    const body = { newRole, userId, action: 'change-role' };
    try {
      await postToApi({ body: JSON.stringify(body) });
      setError('');
    } catch (error) {
      setError(error.message);
      setTableLoading(false);
    }
  };

  const removeUser = async e => {
    e.preventDefault();
    setTableLoading(true);
    const userId = e.target.getAttribute('data-id');
    const body = { userId, action: 'remove-user' };
    try {
      await postToApi({ body: JSON.stringify(body) });
      setError('');
    } catch (error) {
      setError(error.message);
      setTableLoading(false);
    }
  };

  const addUser = async e => {
    e.preventDefault();
    setTableLoading(true);
    const userEmail = e.currentTarget.email.value;
    const body = { userEmail, action: 'add-user' };
    try {
      await postToApi({ body: JSON.stringify(body) });
      setError('');
    } catch (error) {
      setError(error.message);
      setTableLoading(false);
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
          {(!user?.isVerified ||
            !user?.access.some(
              siteAccess => siteAccess.siteRole === 'manager'
            )) && <div>You are not authorized to view this page.</div>}
          {user?.isVerified &&
            user?.access.some(
              siteAccess => siteAccess.siteRole === 'manager'
            ) && (
              <>
                {(state.tableLoading || !state.data) && <p>Loading...</p>}
                {!state.tableLoading && state.data && (
                  <Site
                    site={state.data}
                    user={user}
                    addUser={addUser}
                    handleSelect={handleSelect}
                    removeUser={removeUser}
                  />
                )}
              </>
            )}
        </>
      )}
    </Layout>
  );
}
