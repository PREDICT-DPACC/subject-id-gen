import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import useUser from '../../lib/useUser';
import fetchJson from '../../lib/fetchJson';

const VerifyEmailPage = () => {
  const { user, mutateUser } = useUser();
  const [errorMsg, setErrorMsg] = useState('');
  const [clickedButton, setClickedButton] = useState(false);

  const router = useRouter();
  const { token } = router.query;
  const body = { verificationToken: token, userId: user?.id };

  const handleSubmit = async e => {
    e.preventDefault();
    setClickedButton(true);
    try {
      await mutateUser(
        fetchJson('/api/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      );
    } catch (error) {
      console.error('An unexpected error happened:', error);
      setErrorMsg(error.message);
    }
  };

  return (
    <Layout>
      {!user && <p>Loading...</p>}
      {user && !user?.isLoggedIn && (
        <>
          <p>
            You are not currently logged in, so your email could not be verified
            yet.
          </p>
          <p>
            Please <Link href="/login">log in</Link> and visit this page again.
          </p>
        </>
      )}
      {user?.isLoggedIn && !user?.isVerified && (
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={errorMsg !== '' || clickedButton === true}
        >
          Confirm Email
        </button>
      )}
      {user?.isLoggedIn && user?.isVerified && (
        <p>
          Successfully verified.{' '}
          <Link href="/">Click here to return to the dashboard.</Link>
        </p>
      )}
      {errorMsg !== '' && <p style={{ color: 'red' }}>{errorMsg}</p>}
    </Layout>
  );
};

export default VerifyEmailPage;
