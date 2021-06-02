import Link from 'next/link';
import { useRouter } from 'next/router';
import fetchJson from '../../lib/fetchJson';
import styles from './Navigation.module.css';

const Navigation = ({ user, mutateUser, setError }) => {
  const router = useRouter();
  const handleLogout = async e => {
    e.preventDefault();
    try {
      mutateUser(
        await fetchJson('/api/auth/logout', { method: 'POST' }),
        false
      );
      router.push('/login');
    } catch (error) {
      setError(error.message);
    }
  };
  const NavLink = ({ path, title }) => {
    if (router.pathname === path) {
      return <span className={styles.navlink}>{title}</span>;
    }
    return (
      <Link href={path}>
        <a className={styles.navlink}>{title}</a>
      </Link>
    );
  };
  return (
    <div className={styles.navbar}>
      <NavLink path={user?.isLoggedIn ? '/' : '/login'} title="Home" />
      <NavLink path="/check-id" title="Check ID" />
      {user?.isLoggedIn && (
        <>
          {user?.isVerified && <NavLink path="/my-ids" title="My IDs" />}
          {user?.isVerified && user?.role === 'admin' && (
            <NavLink path="/admin" title="Administration" />
          )}
          {user?.isVerified &&
            user?.access.some(
              siteAccess => siteAccess.siteRole === 'manager'
            ) && <NavLink path="/sites" title="Manage Site(s)" />}
          <NavLink path="/account" title="Account" />
          <a
            href="/api/auth/logout"
            className={styles.navlink}
            onClick={handleLogout}
          >
            Logout
          </a>
        </>
      )}
    </div>
  );
};

export default Navigation;
