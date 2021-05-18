import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Navigation from '../../../components/Navigation';
import useUser from '../../../lib/useUser';
import fetchJson from '../../../lib/fetchJson';
import formStyles from '../../../components/Form/Form.module.css';
import sitesList from '../../../lib/sites';

const PromoteToManagerPage = () => {
  const { user, mutateUser } = useUser({
    redirectTo: '/login',
  });
  const router = useRouter();
  const { id } = router.query;

  const [state, setState] = useState({
    userData: {},
    errorMsg: '',
    loading: true,
  });

  const setData = useCallback(val => {
    setState(prevState => ({ ...prevState, userData: val }));
  }, []);

  const setError = useCallback(val => {
    setState(prevState => ({ ...prevState, errorMsg: val }));
  }, []);

  const setLoading = useCallback(val => {
    setState(prevState => ({ ...prevState, loading: val }));
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetchJson(`/api/admin/user/${id}?mode=find`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      setData(res);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  }, [id, setData, setError, setLoading]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUser();
    }
  }, [user, fetchUser]);

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
          {user?.role === 'admin' && state.loading && <p>Loading...</p>}
          {user?.role === 'admin' && !state.loading && (
            <>
              {state.errorMsg !== '' && <div>{state.errorMsg}</div>}
              {state.userData && (
                <form onSubmit={handleSubmit}>
                  <div className={formStyles.fieldset}>
                    <label htmlFor="sites" className={formStyles.label}>
                      Make{' '}
                      <strong>
                        {state.userData.firstName} {state.userData.lastName}
                      </strong>{' '}
                      manager of which site(s)?
                    </label>
                    <p>CTRL or CMD + click to select multiple.</p>
                    <select name="sites" multiple className={formStyles.field}>
                      {sitesList
                        .sort((a, b) => {
                          const nameA = a.name.toUpperCase();
                          const nameB = b.name.toUpperCase();
                          if (nameA < nameB) return -1;
                          if (nameA > nameB) return 1;
                          return 0;
                        })
                        .map(site => (
                          <option value={site.id} key={site.id}>
                            {site.name}
                          </option>
                        ))}
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
