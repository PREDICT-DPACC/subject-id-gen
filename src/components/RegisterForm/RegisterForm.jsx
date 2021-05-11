import styles from './RegisterForm.module.css';
import formStyles from '../Form/Form.module.css';
import sitesList from '../../lib/sites';

const RegisterForm = ({ errorMessage, onSubmit }) => (
  <div className={styles.register}>
    <div className={formStyles.error}>
      {errorMessage}
    </div>
    <form onSubmit={onSubmit}>
      <div className={formStyles.fieldset}>
        <label htmlFor="email" className={formStyles.label}>Email</label>
        <input type="text" name="email" className={formStyles.field} required />
      </div>

      <div className={formStyles.fieldset}>
        <label htmlFor="password" className={formStyles.label}>Password</label>
        <input type="password" name="password" className={formStyles.field} required />
      </div>

      <div className={formStyles.fieldset}>
        <label htmlFor="confirm-password" className={formStyles.label}>Confirm Password</label>
        <input type="password" name="confirm-password" className={formStyles.field} required />
      </div>

      <div className={formStyles.fieldset}>
        <label htmlFor="sites" className={formStyles.label}>Site(s)</label>
        <select name="sites" multiple className={formStyles.field}>
          {sitesList
          .sort((a,b) => {
            const nameA = a.name.toUpperCase(); 
            const nameB = b.name.toUpperCase(); 
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
          })
          .map((site) => (
            <option value={site.id}>
              {site.name}
            </option>
          ))}
        </select>
      </div>

      <div className={formStyles.buttongroup}>
        <button type="submit" className={formStyles.button}>
          Register
        </button>
      </div>
    </form>
  </div>
);

export default RegisterForm;
