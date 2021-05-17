import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import useUser from '../../lib/useUser';
import fetchJson from '../../lib/fetchJson';
import Navigation from '../../components/Navigation';
import AdminNav from '../../components/Admin/AdminNav';
import AdminUserTable from '../../components/Admin/AdminUserTable';
import SiteTable from '../../components/SiteTable';

export default function AdminUsersPage() {
  const { user, mutateUser } = useUser({
    redirectTo: '/login',
  });
  const router = useRouter();

  const [state, setState] = useState({
    data: {},
    errorMsg: '',
    tableLoading: true,
    activeKey: 'users',
  });

  const setData = useCallback(val => {
    setState(prevState => ({ ...prevState, data: val }));
  }, []);

  const setError = useCallback(val => {
    setState(prevState => ({ ...prevState, errorMsg: val }));
  }, []);

  const setTableLoading = useCallback(val => {
    setState(prevState => ({ ...prevState, tableLoading: val }));
  }, []);

  const setActiveKey = useCallback(val => {
    setState(prevState => ({ ...prevState, activeKey: val }));
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetchJson(`/api/admin/${state.activeKey}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      setData(res);
      setTableLoading(false);
    } catch (error) {
      setError(error.message);
      setTableLoading(false);
    }
  }, [setData, setError, setTableLoading, state.activeKey]);

  useEffect(() => {
    if (user?.role === 'admin') {
      setTableLoading(true);
      fetchData();
    }
  }, [state.activeKey, user, fetchData, setTableLoading]);

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
          {(!user?.isVerified || user?.role !== 'admin') && (
            <div>You are not authorized to view this page.</div>
          )}
          {user?.isVerified && user?.role === 'admin' && state.tableLoading && (
            <p>Loading...</p>
          )}
          {user?.isVerified && user?.role === 'admin' && !state.tableLoading && (
            <>
              {state.errorMsg !== '' && <div>{state.errorMsg}</div>}
              <AdminNav
                activeKey={state.activeKey}
                setActiveKey={setActiveKey}
              />
              {state.data.users && (
                <AdminUserTable
                  adminUser={user}
                  users={state.data.users}
                  router={router}
                />
              )}
              {state.data.sites && (
                <SiteTable sites={state.data.sites} mode="admin" />
              )}
            </>
          )}
        </>
      )}
    </Layout>
  );
}
