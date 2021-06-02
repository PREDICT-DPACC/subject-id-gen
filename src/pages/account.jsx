import { useCallback, useState } from 'react';
import * as yup from 'yup';
import useUser from '../lib/useUser';
import fetchJson from '../lib/fetchJson';
import Layout from '../components/Layout';
import Navigation from '../components/Navigation';
import formStyles from '../styles/Form.module.css';
import styles from '../components/RegisterForm/RegisterForm.module.css';

const AccountPage = () => {
  const { user, mutateUser } = useUser({
    redirectTo: '/login',
  });
  const [state, setState] = useState({
    formDisabled: false,
    errorMsg: '',
    successMsg: '',
    pwErrorMsg: '',
    pwSuccessMsg: '',
  });
  const setStateByKey = useCallback(({ key, value }) => {
    setState(prevState => ({ ...prevState, [key]: value }));
  }, []);
  const setError = value => setStateByKey({ key: 'errorMsg', value });

  const handleChangeDetails = async e => {
    e.preventDefault();
    setStateByKey({ key: 'formDisabled', value: true });
    try {
      const fields = {
        firstName: e.currentTarget['first-name'].value,
        lastName: e.currentTarget['last-name'].value,
      };
      const schema = yup.object().shape({
        firstName: yup.string().max(255).required(),
        lastName: yup.string().max(255).required(),
      });
      await schema.validate(fields);
      const body = {
        action: 'change-details',
        firstName: fields.firstName,
        lastName: fields.lastName,
      };
      await fetchJson('/api/auth/account', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });
      setStateByKey({ key: 'pwErrorMsg', value: '' });
      setStateByKey({ key: 'pwSuccessMsg', value: '' });
      setStateByKey({ key: 'errorMsg', value: '' });
      setStateByKey({
        key: 'successMsg',
        value: 'Details changed successfully',
      });
      setStateByKey({ key: 'formDisabled', value: false });
    } catch (error) {
      setStateByKey({ key: 'pwErrorMsg', value: '' });
      setStateByKey({ key: 'pwSuccessMsg', value: '' });
      setStateByKey({ key: 'errorMsg', value: error.message });
      setStateByKey({ key: 'successMsg', value: '' });
      setStateByKey({ key: 'formDisabled', value: false });
    }
  };

  const handleChangePassword = async e => {
    e.preventDefault();
    setStateByKey({ key: 'formDisabled', value: true });
    try {
      const fields = {
        currentPassword: e.currentTarget['current-password'].value,
        newPassword: e.currentTarget.password.value,
        newPasswordConfirmation: e.currentTarget['confirm-password'].value,
      };
      const schema = yup.object().shape({
        currentPassword: yup.string().min(6).required(),
        newPassword: yup.string().min(6).required(),
        newPasswordConfirmation: yup
          .string()
          .oneOf([yup.ref('newPassword')], 'Passwords do not match.')
          .required(),
      });
      await schema.validate(fields);
      const body = {
        action: 'change-password',
        currentPassword: fields.currentPassword,
        newPassword: fields.newPassword,
      };
      await fetchJson('/api/auth/account', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });
      setStateByKey({ key: 'errorMsg', value: '' });
      setStateByKey({ key: 'successMsg', value: '' });
      setStateByKey({ key: 'pwErrorMsg', value: '' });
      setStateByKey({
        key: 'pwSuccessMsg',
        value: 'Password changed successfully',
      });
      setStateByKey({ key: 'formDisabled', value: false });
    } catch (error) {
      setStateByKey({ key: 'pwErrorMsg', value: error.message });
      setStateByKey({ key: 'pwSuccessMsg', value: '' });
      setStateByKey({ key: 'errorMsg', value: '' });
      setStateByKey({ key: 'successMsg', value: '' });
      setStateByKey({ key: 'formDisabled', value: false });
    }
  };

  return (
    <Layout>
      {!user?.isLoggedIn && <p>Loading...</p>}
      {user?.isLoggedIn && (
        <>
          <Navigation user={user} mutateUser={mutateUser} setError={setError} />
          <h3>Edit account details</h3>
          {state.errorMsg && state.errorMsg !== '' && (
            <p className={formStyles.error}>{state.errorMsg}</p>
          )}
          {state.successMsg && state.successMsg !== '' && (
            <p className={formStyles.success}>{state.successMsg}</p>
          )}
          <div className={styles.register}>
            <form onSubmit={handleChangeDetails}>
              <div className={formStyles.fieldset}>
                <label htmlFor="email" className={formStyles.label}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  disabled
                  maxLength={255}
                  defaultValue={user.email || ''}
                  className={formStyles.field}
                  required
                />
              </div>
              <div className={formStyles.fieldset}>
                <label htmlFor="firstName" className={formStyles.label}>
                  First name
                </label>
                <input
                  type="text"
                  name="first-name"
                  autoComplete="given-name"
                  disabled={state.formDisabled}
                  defaultValue={user.firstName || ''}
                  maxLength={255}
                  className={formStyles.field}
                />
              </div>
              <div className={formStyles.fieldset}>
                <label htmlFor="lastName" className={formStyles.label}>
                  Last name
                </label>
                <input
                  type="text"
                  name="last-name"
                  autoComplete="family-name"
                  disabled={state.formDisabled}
                  defaultValue={user.lastName || ''}
                  maxLength={255}
                  className={formStyles.field}
                />
              </div>
              <div className={formStyles.buttongroup}>
                <button
                  type="submit"
                  disabled={state.formDisabled}
                  className={formStyles.centerbutton}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
          <h3>Change password</h3>
          {state.pwErrorMsg && state.pwErrorMsg !== '' && (
            <p className={formStyles.error}>{state.pwErrorMsg}</p>
          )}
          {state.pwSuccessMsg && state.pwSuccessMsg !== '' && (
            <p className={formStyles.success}>{state.pwSuccessMsg}</p>
          )}
          <div className={styles.register}>
            <form onSubmit={handleChangePassword}>
              <div className={formStyles.fieldset}>
                <label htmlFor="confirm-password" className={formStyles.label}>
                  Current password
                </label>
                <input
                  type="password"
                  name="current-password"
                  autoComplete="current-password"
                  disabled={state.formDisabled}
                  className={formStyles.field}
                  required
                />
              </div>
              <div className={formStyles.fieldset}>
                <label htmlFor="password" className={formStyles.label}>
                  New password
                </label>
                <input
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  disabled={state.formDisabled}
                  className={formStyles.field}
                  required
                />
              </div>
              <div className={formStyles.fieldset}>
                <label htmlFor="confirm-password" className={formStyles.label}>
                  Confirm new password
                </label>
                <input
                  type="password"
                  name="confirm-password"
                  autoComplete="new-password"
                  disabled={state.formDisabled}
                  className={formStyles.field}
                  required
                />
              </div>
              <div className={formStyles.buttongroup}>
                <button
                  type="submit"
                  disabled={state.formDisabled}
                  className={formStyles.centerbutton}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </Layout>
  );
};

export default AccountPage;
