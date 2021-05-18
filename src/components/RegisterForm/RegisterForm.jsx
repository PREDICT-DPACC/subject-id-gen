import Link from 'next/link';
import styles from './RegisterForm.module.css';
import formStyles from '../../styles/Form.module.css';
import sitesList from '../../lib/sites';

const RegisterForm = ({ errorMessage, onSubmit, onBlur, validState }) => (
  <div className={styles.register}>
    <form onSubmit={onSubmit} onBlur={onBlur}>
      <div className={formStyles.fieldset}>
        <label htmlFor="firstName" className={formStyles.label}>
          First name
        </label>
        <input
          type="text"
          name="firstName"
          autoComplete="given_name"
          className={
            validState.firstName
              ? formStyles.field
              : `${formStyles.field} ${formStyles.invalid}`
          }
          required
        />
      </div>

      <div className={formStyles.fieldset}>
        <label htmlFor="lastName" className={formStyles.label}>
          Last name
        </label>
        <input
          type="text"
          name="lastName"
          autoComplete="family_name"
          className={
            validState.lastName
              ? formStyles.field
              : `${formStyles.field} ${formStyles.invalid}`
          }
          required
        />
      </div>

      <div className={formStyles.fieldset}>
        <label htmlFor="email" className={formStyles.label}>
          Email
        </label>
        <input
          type="text"
          name="email"
          autoComplete="email"
          className={
            validState.email
              ? formStyles.field
              : `${formStyles.field} ${formStyles.invalid}`
          }
          required
        />
      </div>

      <div className={formStyles.fieldset}>
        <label htmlFor="password" className={formStyles.label}>
          Password
        </label>
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          className={
            validState.password
              ? formStyles.field
              : `${formStyles.field} ${formStyles.invalid}`
          }
          required
        />
      </div>

      <div className={formStyles.fieldset}>
        <label htmlFor="confirm-password" className={formStyles.label}>
          Confirm Password
        </label>
        <input
          type="password"
          name="confirm-password"
          autoComplete="new-password"
          className={
            validState['confirm-password']
              ? formStyles.field
              : `${formStyles.field} ${formStyles.invalid}`
          }
          required
        />
      </div>

      <div className={formStyles.fieldset}>
        <label htmlFor="sites" className={formStyles.label}>
          Site(s)
        </label>
        <select name="sites" multiple className={formStyles.field}>
          {sitesList
            .sort((a, b) => {
              const nameA = a.name.toUpperCase();
              const nameB = b.name.toUpperCase();
              if (nameA < nameB) return -1;
              if (nameA > nameB) return 1;
              return 0;
            })
            .map(site => (
              <option value={site.id} key={site.id}>
                {site.name}
              </option>
            ))}
        </select>
      </div>

      {errorMessage && <div className={formStyles.error}>{errorMessage}</div>}
      <div className={formStyles.buttongroup}>
        <button type="submit" className={formStyles.button}>
          Register
        </button>
        <div className={formStyles.button}>
          <Link href="/">Go back</Link>
        </div>
      </div>
    </form>
  </div>
);

export default RegisterForm;
