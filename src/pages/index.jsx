import Layout from '../components/Layout';
import useUser from "../lib/useUser";
import fetchJson from "../lib/fetchJson";
import { useRouter } from "next/router";

export default function Home() {
  const { user, mutateUser } = useUser({
    redirectTo: "/login"
  });
  const router = useRouter();
  
  return (
    <Layout>
      {!user || !user?.isLoggedIn && (
        <>
          Loading
        </>
      )}
      {user?.isLoggedIn && (
        <>
          <div>Logged in</div>
          <a
            href="/api/logout"
            onClick={async (e) => {
              e.preventDefault();
              mutateUser(
                await fetchJson("/api/logout", { method: "POST" }),
                false,
              );
              router.push("/login");
            }}
          >
            Logout
          </a>
        </>
      )}
    </Layout>
  )
}
