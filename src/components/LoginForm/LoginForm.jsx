import Link from 'next/link';
import styles from './LoginForm.module.css';
import formStyles from '../Form/Form.module.css';

const LoginForm = ({ errorMessage, onSubmit }) => (
  <div className={styles.login}>
    <div className={formStyles.error}>{errorMessage}</div>
    <form onSubmit={onSubmit}>
      <div className={formStyles.fieldset}>
        <label htmlFor="email" className={formStyles.label}>
          Email
        </label>
        <input type="text" name="email" className={formStyles.field} required />
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
        />
      </div>

      <div className={formStyles.buttongroup}>
        <button type="submit" className={formStyles.button}>
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
