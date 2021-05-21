import { useState, useCallback } from 'react';
import Layout from '../components/Layout';
import useUser from '../lib/useUser';
import fetchJson from '../lib/fetchJson';
import formStyles from '../styles/Form.module.css';
import Navigation from '../components/Navigation';

const PublicCheckIdPage = () => {
  const { user, mutateUser } = useUser();
  const [state, setState] = useState({
    errorMsg: '',
    successMsg: '',
    submitting: false,
  });
  const setError = useCallback(val => {
    setState(prevState => ({ ...prevState, errorMsg: val }));
  }, []);
  const setSuccessMsg = useCallback(val => {
    setState(prevState => ({ ...prevState, successMsg: val }));
  }, []);
  const setSubmitting = useCallback(val => {
    setState(prevState => ({ ...prevState, submitting: val }));
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const id = e.currentTarget.id.value.toUpperCase();
      const res = await fetchJson(`/api/ids?id=${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      setError('');
      setSuccessMsg(res.message);
      setSubmitting(false);
    } catch (error) {
      setError(error.message);
      setSuccessMsg('');
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      {!user && <p>Loading...</p>}
      {user && (
        <>
          <Navigation user={user} mutateUser={mutateUser} setError={setError} />
          <h3>Check an ID</h3>
          <p>Here you can check if an ID is in use.</p>
          <form onSubmit={handleSubmit}>
            <div className={formStyles.inputgroup}>
              <div className={formStyles.fieldset}>
                <input
                  type="text"
                  required
                  name="id"
                  minLength={7}
                  maxLength={7}
                  disabled={state.submitting}
                  className={`${formStyles.field} ${formStyles.uppercasefield}`}
                />
              </div>
              <div className={formStyles.buttongroup}>
                <button
                  type="submit"
                  className={formStyles.horizbutton}
                  disabled={state.submitting}
                >
                  Submit
                </button>
              </div>
            </div>
          </form>
          {state.errorMsg && state.errorMsg !== '' && (
            <p className={formStyles.error}>{state.errorMsg}</p>
          )}
          {state.successMsg && state.successMsg !== '' && (
            <p className={formStyles.success}>{state.successMsg}</p>
          )}
        </>
      )}
    </Layout>
  );
};

export default PublicCheckIdPage;
