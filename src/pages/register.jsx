import React, { useState } from 'react';
import Layout from '../components/Layout';
import RegisterForm from '../components/RegisterForm';
import useUser from '../lib/useUser';
import styles from '../styles/Login.module.css';
import { hash } from '../lib/hash';

const RegisterPage = () => {
  const { mutateUser } = useUser({
    redirectTo: "/",
    redirectIfFound: true,
  });

  const [errorMsg, setErrorMsg] = useState("");
  async function handleSubmit(e) {
    e.preventDefault();

    const body = {
      email: e.currentTarget.email.value,
      // sites:  e.currentTarget.sites.value,
      password: e.currentTarget.password.value
    };

    try {
      // await mutateUser(
      //   fetchJson("/api/register", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify(body),
      //   }),
      // );
      console.log(hash({ text: body.password }));
    } catch (error) {
      console.error("An unexpected error happened:", error);
      setErrorMsg(error.message);
    }
  }

  return (
    <Layout>
      <h1 className={styles.title}>
        Subject ID Generator
    </h1>
      <p className={styles.description}>
        A tool to create or validate subject IDs for the DPACC project.
    </p>
      <RegisterForm
        onSubmit={handleSubmit}
        errorMessage={errorMsg}
      />
    </Layout>
  );

};

export default RegisterPage;
