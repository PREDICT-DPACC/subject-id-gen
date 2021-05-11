import Link from 'next/link';
import styles from './LoginForm.module.css';

const LoginForm = ({ errorMessage, onSubmit }) => (
  <div className={styles.login}>
    <div className={styles.error}>
      {errorMessage}
    </div>
    <form onSubmit={onSubmit}>
      <div className={styles.fieldset}>
        <label htmlFor="email" className={styles.label}>Email</label>
        <input type="text" name="email" className={styles.field} required />
      </div>

      <div className={styles.fieldset}>
        <label htmlFor="password" className={styles.label}>Password</label>
        <input type="password" name="password" className={styles.field} required />
      </div>

      <div className={styles.buttongroup}>
        <button type="submit" className={styles.button}>
          Login
        </button>
        <div className={styles.button}>
          <Link href="/register">
            Register
          </Link>
        </div>
      </div>
    </form>
  </div>
);

export default LoginForm;
