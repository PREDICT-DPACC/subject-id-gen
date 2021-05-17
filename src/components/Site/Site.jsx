import styles from './Site.module.scss';

const Site = ({ user, site, handleSelect, removeUser }) => (
  <>
    <h3>Manage site: {site.name}</h3>
    <div className={styles.grid}>
      <div>
        <h4>Members</h4>
        <table className={styles.table}>
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
    </div>
  </>
);

export default Site;
