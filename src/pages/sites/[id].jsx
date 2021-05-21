import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import useUser from '../../lib/useUser';
import fetchJson from '../../lib/fetchJson';
import formStyles from '../../styles/Form.module.css';
import Navigation from '../../components/Navigation';
import Site from '../../components/Site';
import IdTable from '../../components/IdTable';
import IdTableCsvLink from '../../lib/csv';

export default function SitePage() {
  const { user, mutateUser } = useUser({
    redirectTo: '/login',
  });
  const router = useRouter();
  const { id } = router.query;

  const [state, setState] = useState({
    errorMsg: '',
    data: {},
    membersLoading: true,
    idsLoading: false,
    idList: [],
    noIdsForSite: false,
  });
  const setError = useCallback(val => {
    setState(prevState => ({ ...prevState, errorMsg: val }));
  }, []);
  const setData = useCallback(val => {
    setState(prevState => ({ ...prevState, data: val }));
  }, []);
  const setMembersLoading = useCallback(val => {
    setState(prevState => ({ ...prevState, membersLoading: val }));
  }, []);
  const setIdsLoading = useCallback(val => {
    setState(prevState => ({ ...prevState, idsLoading: val }));
  }, []);
  const setIdList = useCallback(val => {
    setState(prevState => ({ ...prevState, idList: val }));
  }, []);
  const setNoIdsForSite = useCallback(val => {
    setState(prevState => ({ ...prevState, noIdsForSite: val }));
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetchJson(`/api/site/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      setData(res);
      setMembersLoading(false);
      setError('');
    } catch (error) {
      setError(error.message);
      setMembersLoading(false);
    }
  }, [id, setData, setError, setMembersLoading]);

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
      setMembersLoading(true);
      fetchData(id);
    }
  }, [user, fetchData, setMembersLoading, id]);

  const postToApi = async ({ body }) => {
    const res = await fetchJson(`/api/site/${id}`, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
    });
    setData(res);
    setMembersLoading(false);
    setError('');
  };

  const handleSelect = async e => {
    e.preventDefault();
    setMembersLoading(true);
    const newRole = e.target.value;
    const userId = e.target.getAttribute('data-id');
    const body = { newRole, userId, action: 'change-role' };
    try {
      await postToApi({ body: JSON.stringify(body) });
      setError('');
    } catch (error) {
      setError(error.message);
      setMembersLoading(false);
    }
  };

  const removeUser = async e => {
    e.preventDefault();
    setMembersLoading(true);
    const userId = e.target.getAttribute('data-id');
    const body = { userId, action: 'remove-user' };
    try {
      await postToApi({ body: JSON.stringify(body) });
      setError('');
    } catch (error) {
      setError(error.message);
      setMembersLoading(false);
    }
  };

  const addUser = async e => {
    e.preventDefault();
    setMembersLoading(true);
    const userEmail = e.currentTarget.email.value;
    const body = { userEmail, action: 'add-user' };
    try {
      await postToApi({ body: JSON.stringify(body) });
      setError('');
    } catch (error) {
      setError(error.message);
      setMembersLoading(false);
    }
  };

  const showIds = async e => {
    e.preventDefault();
    setIdsLoading(true);
    const body = { siteId: id, action: 'list-all' };
    try {
      const res = await fetchJson('/api/ids', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });
      setIdList(res.ids);
      if (res.ids.length === 0) {
        setNoIdsForSite(true);
      } else setNoIdsForSite(false);
      setError('');
      setIdsLoading(false);
      e.target.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      setError(error.message);
      setIdsLoading(false);
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
          {(!user?.isVerified ||
            !(
              user?.role === 'admin' ||
              user?.access.some(
                siteAccess =>
                  siteAccess.siteRole === 'manager' && siteAccess.siteId === id
              )
            )) && <div>You are not authorized to view this page.</div>}
          {user?.isVerified &&
            (user?.role === 'admin' ||
              user?.access.some(
                siteAccess =>
                  siteAccess.siteRole === 'manager' && siteAccess.siteId === id
              )) && (
              <>
                {(state.membersLoading || !state.data) && <p>Loading...</p>}
                {!state.membersLoading && state.data && (
                  <>
                    <Site
                      site={state.data}
                      user={user}
                      addUser={addUser}
                      handleSelect={handleSelect}
                      removeUser={removeUser}
                      showIds={showIds}
                    />
                    {state.idsLoading && <p>Loading...</p>}
                    {!state.idsLoading &&
                      state.idList &&
                      state.idList.length > 0 && (
                        <>
                          <p>
                            The following IDs are marked as used in the database
                            (
                            <IdTableCsvLink ids={state.idList} mode="manage" />
                            ):
                          </p>
                          <div>
                            <IdTable ids={state.idList} mode="manage" />
                          </div>
                        </>
                      )}
                    {!state.idsLoading && state.noIdsForSite === true && (
                      <p>There are no used IDs for this site yet.</p>
                    )}
                  </>
                )}
              </>
            )}
        </>
      )}
    </Layout>
  );
}
