import Link from 'next/link';
import styles from '../styles/LoginForm.module.css';

const LoginForm = () => (
  <div className={styles.login}>
    <form>
      <div className={styles.fieldset}>
        <label for="email" className={styles.label}>Email</label>
        <input type="text" name="email" className={styles.field} required />
      </div>

      <div className={styles.fieldset}>
        <label for="password" className={styles.label}>Password</label>
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
