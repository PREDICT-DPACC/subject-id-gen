import styles from './Site.module.scss';
import tableStyles from '../../styles/Table.module.scss';
import formStyles from '../../styles/Form.module.css';

const Site = ({ user, site, addUser, handleSelect, removeUser, showIds }) => (
  <>
    <h2>Manage site: {site.name}</h2>
    <div className={styles.site}>
      <h3>Members</h3>
      <div className={styles.members}>
        <table className={`${tableStyles.table} ${styles.sitetable}`}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {site.members &&
              site.members
                .sort((a, b) => {
                  if (a.lastName > b.lastName) return 1;
                  if (a.lastName < b.lastName) return -1;
                  return 0;
                })
                .map(member => (
                  <tr key={member.id}>
                    <td>
                      {member.firstName} {member.lastName}
                    </td>
                    <td>
                      <select
                        onChange={handleSelect}
                        defaultValue={member.siteRole}
                        disabled={user.id === member.id}
                        data-id={member.id}
                        className={`${formStyles.selectfield} ${formStyles.nomargin}`}
                      >
                        <option value="manager">Manager</option>
                        <option value="member">Member</option>
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        disabled={user.id === member.id}
                        data-id={member.id}
                        onClick={removeUser}
                        className={formStyles.button}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        <div>
          <p>
            Site <strong>Members</strong> can generate IDs for a site.
          </p>
          <p>
            Site <strong>Managers</strong> can generate IDs for a site,
            add/remove users for a site, and view all generated IDs for a site.
          </p>
        </div>
        <h4>Add Member</h4>
        <p>Enter a registered user's email here.</p>
        <form onSubmit={addUser}>
          <div className={formStyles.inputgroup}>
            <div className={formStyles.fieldset}>
              <input
                type="email"
                required
                name="email"
                maxLength={255}
                className={formStyles.field}
              />
            </div>
            <div className={formStyles.buttongroup}>
              <button type="submit" className={formStyles.horizbutton}>
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
      <div>
        <h3>Used IDs</h3>
        <p>List used IDs for this site.</p>
        <button type="button" onClick={showIds} className={formStyles.button}>
          Show IDs
        </button>
      </div>
    </div>
  </>
);

export default Site;
