import Link from 'next/link';
import styles from './LoginForm.module.css';
import formStyles from '../../styles/Form.module.css';

const LoginForm = ({ errorMessage, onSubmit, disabled }) => (
  <div className={styles.login}>
    {errorMessage && <div className={formStyles.error}>{errorMessage}</div>}
    <form onSubmit={onSubmit}>
      <div className={formStyles.fieldset}>
        <label htmlFor="email" className={formStyles.label}>
          Email
        </label>
        <input
          type="email"
          name="email"
          className={formStyles.field}
          required
          disabled={disabled}
        />
      </div>

      <div className={formStyles.fieldset}>
        <label htmlFor="password" className={formStyles.label}>
          Password
        </label>
        <input
          type="password"
          name="password"
          className={formStyles.field}
          required
          disabled={disabled}
        />
      </div>

      <div className={formStyles.small}>
        <small>
          Forgot your password? <Link href="/reset-password">Click here</Link>{' '}
          to reset it.
        </small>
      </div>
      <div className={formStyles.buttongroup}>
        <button type="submit" className={formStyles.button} disabled={disabled}>
          Login
        </button>
        <div className={formStyles.button}>
          <Link href="/register">Register</Link>
        </div>
      </div>
    </form>
  </div>
);

export default LoginForm;
