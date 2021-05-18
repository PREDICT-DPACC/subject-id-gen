import formStyles from '../Form/Form.module.css';
import sitesList from '../../lib/sites';

const IdGenerator = ({ access, onSubmit, formDisabled }) => (
  <form onSubmit={onSubmit}>
    <div className={formStyles.inputgroup}>
      <div className={formStyles.fieldset}>
        <label htmlFor="site" className={formStyles.label}>
          Site
        </label>
        <select
          name="site"
          className={formStyles.selectfield}
          disabled={formDisabled}
        >
          {sitesList
            .filter(site =>
              access.some(accessSite => accessSite.siteId === site.id)
            )
            .sort((a, b) => {
              const nameA = a.name.toUpperCase();
              const nameB = b.name.toUpperCase();
              if (nameA < nameB) return -1;
              if (nameA > nameB) return 1;
              return 0;
            })
            .map(site => (
              <option value={site.id} key={site.id}>
                {site.name} ({site.id})
              </option>
            ))}
        </select>
      </div>
      <div className={formStyles.fieldset}>
        <label htmlFor="quantity" className={formStyles.label}>
          Quantity
        </label>
        <input
          type="number"
          name="quantity"
          required
          defaultValue={1}
          min="1"
          max="100"
          className={formStyles.field}
          disabled={formDisabled}
        />
      </div>
      <div className={formStyles.buttongroup}>
        <button
          type="submit"
          className={formStyles.horizbutton}
          disabled={formDisabled}
        >
          Generate
        </button>
      </div>
    </div>
  </form>
);

export default IdGenerator;
