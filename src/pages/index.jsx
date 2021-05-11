import Layout from '../components/Layout/Layout';
import useUser from "../lib/useUser";

export default function Home() {
  useUser({
    redirectTo: "/login"
  });
  
  return (
    <Layout>
      Logged in
    </Layout>
  )
}
