import styles from './Site.module.scss';
import tableStyles from '../../styles/Table.module.scss';

const Site = ({ user, site, addUser, handleSelect, removeUser, showIds }) => (
  <>
    <h2>Manage site: {site.name}</h2>
    <div className={styles.site}>
      <div>
        <h3>Members</h3>
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
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      <div>
        <h4>Add Member</h4>
        <p>Enter a registered user's email here.</p>
        <form onSubmit={addUser}>
          <input type="text" required name="email" />
          <button type="submit">Submit</button>
        </form>
      </div>
      <div>
        <h3>Used IDs</h3>
        <p>List used IDs for this site.</p>
        <button type="button" onClick={showIds}>
          Show IDs
        </button>
      </div>
    </div>
  </>
);

export default Site;
