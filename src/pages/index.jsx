import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import useUser from '../lib/useUser';
import fetchJson from '../lib/fetchJson';

export default function Home() {
  const { user, mutateUser } = useUser({
    redirectTo: '/login',
  });
  const router = useRouter();

  return (
    <Layout>
      {(!user || !user?.isLoggedIn) && <>Loading...</>}
      {user?.isLoggedIn && (
        <>
          <div>Logged in</div>
          {!user?.isVerified && <div>Email not yet verified</div>}
          {user?.isVerified && <div>Email is verified!</div>}
          <a
            href="/api/logout"
            onClick={async e => {
              e.preventDefault();
              mutateUser(
                await fetchJson('/api/logout', { method: 'POST' }),
                false
              );
              router.push('/login');
            }}
          >
            Logout
          </a>
        </>
      )}
    </Layout>
  );
}
