import { useState } from 'react';
import Link from 'next/link';
import useUser from '../lib/useUser';
import Layout from '../components/Layout';
import Navigation from '../components/Navigation';
import fetchJson from '../lib/fetchJson';
import formStyles from '../styles/Form.module.css';
import sitesList from '../lib/sites';
import tableStyles from '../styles/Table.module.scss';
import styles from '../styles/Home.module.css';

const MyIdsPage = () => {
  const { user, mutateUser } = useUser({
    redirectTo: '/login',
  });
  const [state, setState] = useState({
    ids: [],
    errorMsg: '',
    noIdsForSite: false,
  });
  const setError = val => {
    setState(prevState => ({ ...prevState, errorMsg: val }));
  };
  const setIds = val => {
    setState(prevState => ({ ...prevState, ids: val }));
  };
  const setNoIdsForSite = val => {
    setState(prevState => ({ ...prevState, noIdsForSite: val }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const body = {
        action: 'list',
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
    } catch (error) {
      setError(error.message);
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
          {user?.isVerified && (!user?.access || user?.access.length === 0) && (
            <div>
              <p>You have not yet been added to any sites.</p>
              <p>
                The site manager for each site you requested has been notified.
              </p>
              <p>
                Once you have been added to the sites you requested, you will be
                able to generate new IDs from the <Link href="/">Home</Link>{' '}
                page.
              </p>
            </div>
          )}
          {user?.isVerified && user?.access && user?.access.length > 0 && (
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
                        {sitesList
                          .filter(site =>
                            user.access.some(
                              accessSite => accessSite.siteId === site.id
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
                            <option value={site.id} key={site.id}>
                              {site.name} ({site.id})
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
              {state.ids && state.ids.length > 0 && (
                <div>
                  <table className={tableStyles.table}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Date used</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.ids.map(id => (
                        <tr key={id.id}>
                          <td className={styles.mono}>{id.id}</td>
                          <td>
                            {new Date(id.usedDate).toLocaleDateString('en-US')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {state.noIdsForSite === true && (
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
