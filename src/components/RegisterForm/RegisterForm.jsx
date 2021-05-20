import Link from 'next/link';
import styles from './RegisterForm.module.css';
import formStyles from '../../styles/Form.module.css';
import { OptionsForSiteList } from '../../lib/sites';

const RegisterForm = ({
  sitesList,
  errorMessage,
  onSubmit,
  onBlur,
  validState,
  disabled,
}) => (
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
          disabled={disabled}
          maxLength={255}
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
          disabled={disabled}
          maxLength={255}
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
          type="email"
          name="email"
          autoComplete="email"
          disabled={disabled}
          maxLength={255}
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
          disabled={disabled}
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
          disabled={disabled}
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
        <p>CTRL or CMD + click to select multiple.</p>
        <select
          name="sites"
          multiple
          disabled={disabled}
          className={formStyles.field}
        >
          <optgroup label="PRESCIENT">
            <OptionsForSiteList
              filteredSites={sitesList.filter(
                site => site.network === 'PRESCIENT'
              )}
            />
          </optgroup>
          <optgroup label="ProNET">
            <OptionsForSiteList
              filteredSites={sitesList.filter(
                site => site.network === 'ProNET'
              )}
            />
          </optgroup>
        </select>
      </div>

      {errorMessage && <div className={formStyles.error}>{errorMessage}</div>}
      <div className={formStyles.buttongroup}>
        <button type="submit" disabled={disabled} className={formStyles.button}>
          Register
        </button>
        <div className={formStyles.formlink}>
          <Link href="/">Go back</Link>
        </div>
      </div>
    </form>
  </div>
);

export default RegisterForm;
