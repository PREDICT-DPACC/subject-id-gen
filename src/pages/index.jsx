import Layout from '../components/Layout/Layout';
import useUser from "../lib/useUser";

export default function Home() {
  const { user } = useUser({
    redirectTo: "/login"
  });
  
  return (
    <Layout>
      {!user || !user?.isLoggedIn && (
        <>
        Loading
        </>
      )}
      {user?.isLoggedIn && (
        <>
        Logged in
        </>
      )}
    </Layout>
  )
}
